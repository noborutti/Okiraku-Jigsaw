import React, { useEffect, useState, useRef } from 'react';
import { GameState, PuzzlePiece } from '../types';
import confetti from 'canvas-confetti';
import { Play } from 'lucide-react';

interface PuzzleBoardProps {
  game: GameState;
  onMove: (pieceId: number, targetIndex: number | null) => void;
  onInit: (pieces: PuzzlePiece[], width: number, height: number) => void;
  onWin: () => void;
  onStart: () => void;
}

const PuzzleBoard: React.FC<PuzzleBoardProps> = ({ game, onMove, onInit, onWin, onStart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [draggingId, setDraggingId] = useState<number | null>(null);

  // Initialize the puzzle pieces from the source image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = game.imageSrc;

    img.onload = () => {
      const maxWidth = Math.min(800, window.innerWidth - 40); 
      const scale = maxWidth / img.width;
      const width = maxWidth;
      const height = img.height * scale;

      setContainerSize({ width, height });

      const pieceWidth = width / game.cols;
      const pieceHeight = height / game.rows;

      const newPieces: PuzzlePiece[] = [];
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      canvas.width = pieceWidth;
      canvas.height = pieceHeight;

      for (let row = 0; row < game.rows; row++) {
        for (let col = 0; col < game.cols; col++) {
          const id = row * game.cols + col;
          
          ctx.clearRect(0, 0, pieceWidth, pieceHeight);
          
          const sWidth = img.width / game.cols;
          const sHeight = img.height / game.rows;
          const sx = col * sWidth;
          const sy = row * sHeight;

          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, pieceWidth, pieceHeight);

          // Add a border effect
          ctx.strokeStyle = 'rgba(255,255,255,0.4)';
          ctx.lineWidth = 1;
          ctx.strokeRect(0, 0, pieceWidth, pieceHeight);
          ctx.strokeStyle = 'rgba(0,0,0,0.2)';
          ctx.lineWidth = 1;
          ctx.strokeRect(1, 1, pieceWidth - 2, pieceHeight - 2);

          newPieces.push({
            id,
            correctPos: id,
            currentPos: id, // Initially solved on load
            imageData: canvas.toDataURL('image/jpeg', 0.9),
            width: pieceWidth,
            height: pieceHeight,
            row,
            col
          });
        }
      }
      onInit(newPieces, width, height);
    };
  }, [game.imageSrc, game.rows, game.cols]); 

  // Trigger win effect
  useEffect(() => {
    if (game.isSolved && game.pieces.length > 0 && game.isPlaying) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#ec4899']
      });
      onWin();
    }
  }, [game.isSolved, game.isPlaying]);

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, pieceId: number) => {
    if (!game.isPlaying) {
      e.preventDefault();
      return;
    }
    e.stopPropagation(); // Stop bubbling to prevent any parent drag issues
    setDraggingId(pieceId);
    e.dataTransfer.effectAllowed = 'move';
    // Fallback for some browsers, though we primarily use state now
    e.dataTransfer.setData('text/plain', pieceId.toString());
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnBoard = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation(); // Critical: Stop bubbling so the parent slot doesn't also try to handle it
    
    // Prioritize state, fallback to dataTransfer if needed (rare)
    let pieceId = draggingId;
    if (pieceId === null) {
      const idStr = e.dataTransfer.getData('text/plain');
      if (idStr) pieceId = parseInt(idStr, 10);
    }

    if (pieceId !== null && !isNaN(pieceId)) {
      onMove(pieceId, targetIndex);
    }
    setDraggingId(null);
  };

  const handleDropOnTray = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    let pieceId = draggingId;
    if (pieceId === null) {
      const idStr = e.dataTransfer.getData('text/plain');
      if (idStr) pieceId = parseInt(idStr, 10);
    }

    if (pieceId !== null && !isNaN(pieceId)) {
      onMove(pieceId, null);
    }
    setDraggingId(null);
  };

  // Render logic
  const gridSlots = Array(game.rows * game.cols).fill(null);
  
  // Pieces that are currently on the board for quick lookup
  const placedPieces = new Map<number, PuzzlePiece>();
  game.pieces.forEach(p => {
    if (p.currentPos !== null) {
      placedPieces.set(p.currentPos, p);
    }
  });

  // Calculate remaining count for display
  const piecesRemaining = game.pieces.filter(p => p.currentPos === null).length;

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      
      {/* 1. THE BOARD AREA */}
      <div 
        id="puzzle-board-area"
        ref={containerRef}
        className="relative bg-slate-100 rounded-lg shadow-inner border-2 border-slate-300 transition-all duration-300"
        style={{
          width: containerSize.width,
          height: containerSize.height,
          display: 'grid',
          gridTemplateColumns: `repeat(${game.cols}, 1fr)`,
          gridTemplateRows: `repeat(${game.rows}, 1fr)`,
        }}
      >
        {!containerSize.width && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500">
            画像を読み込み中...
          </div>
        )}

        {containerSize.width && gridSlots.map((_, index) => {
          const piece = placedPieces.get(index);
          const isCorrect = piece && piece.correctPos === index;

          return (
            <div
              key={`slot-${index}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropOnBoard(e, index)}
              className={`
                relative border border-slate-300/50 box-border
                ${!piece ? 'bg-slate-200/50' : ''}
                ${draggingId !== null && !piece ? 'bg-indigo-50/50' : ''} 
              `}
            >
              {piece && (
                <div
                  draggable={game.isPlaying}
                  onDragStart={(e) => handleDragStart(e, piece.id)}
                  onDragEnd={handleDragEnd}
                  /* ADDED: Allow drop on the piece itself (replaces it) */
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnBoard(e, index)}
                  className={`
                    w-full h-full shadow-sm z-10 transition-transform
                    ${game.isPlaying ? 'cursor-grab active:cursor-grabbing hover:brightness-110' : ''}
                    ${draggingId === piece.id ? 'opacity-50' : 'opacity-100'}
                  `}
                  style={{
                    backgroundImage: `url(${piece.imageData})`,
                    backgroundSize: 'cover',
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Start Overlay: "絵を憶えたら START" */}
        {!game.isPlaying && !game.isSolved && piecesRemaining === 0 && game.pieces.length > 0 && (
           <div id="start-button-area" className="absolute inset-0 flex items-end justify-center pb-12 z-30 pointer-events-none">
              <div className="pointer-events-auto bg-white/90 backdrop-blur-md px-10 py-6 rounded-2xl shadow-xl border border-white/50 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                 <p className="text-lg font-bold text-slate-700 mb-4 tracking-wide">絵を覚えたら</p>
                 <button 
                   onClick={onStart}
                   className="group relative overflow-hidden bg-slate-800 hover:bg-indigo-600 text-white text-base font-bold py-3 px-12 rounded-xl shadow-lg transition-all duration-300 active:scale-95"
                 >
                   <span className="relative z-10 flex items-center gap-2">
                     スタート
                     <Play className="w-4 h-4 fill-current" />
                   </span>
                 </button>
              </div>
           </div>
        )}
        
        {/* Solved Overlay */}
        {game.isSolved && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <div className="bg-white/90 p-6 rounded-2xl shadow-2xl backdrop-blur-sm transform scale-110 animate-[bounce_1s_infinite]">
              <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
                完成！
              </h2>
            </div>
          </div>
        )}
      </div>

      {/* 2. THE TRAY AREA */}
      <div 
        id="piece-tray-area"
        className={`
          w-full min-h-[200px] p-6 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50
          transition-all duration-300
          ${game.isPlaying ? 'opacity-100' : 'opacity-50 pointer-events-none'}
          ${draggingId !== null ? 'bg-indigo-50 border-indigo-300' : ''}
        `}
        onDragOver={handleDragOver}
        onDrop={handleDropOnTray}
      >
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>ピース置き場</span>
          <span className="bg-indigo-100 text-indigo-700 py-0.5 px-2 rounded-full text-xs">
            残り {piecesRemaining} 
          </span>
        </h3>
        
        {piecesRemaining === 0 && game.isPlaying && !game.isSolved && (
           <div className="text-center text-slate-400 py-8 italic">
             全てのピースがボード上にあります。
           </div>
        )}

        <div className="flex flex-wrap gap-2 justify-center content-start">
          {game.pieces.map((piece) => {
            const isInTray = piece.currentPos === null;
            
            // If we are not playing, we generally don't want to show the huge grid of empty slots
            // unless we want a consistent layout. But usually users just want to see the tray 'stable' during play.
            // When game.isPlaying is false, pieces are all on board (preview), so tray should be empty.
            if (!game.isPlaying && !isInTray) return null;

            if (isInTray) {
              return (
                <div
                  key={`tray-${piece.id}`}
                  draggable={game.isPlaying}
                  onDragStart={(e) => handleDragStart(e, piece.id)}
                  onDragEnd={handleDragEnd}
                  className={`
                    cursor-grab active:cursor-grabbing hover:scale-105 hover:shadow-lg transition-all duration-200 rounded-sm overflow-hidden border border-slate-300 shadow-sm
                    ${draggingId === piece.id ? 'opacity-50' : 'opacity-100'}
                  `}
                  style={{
                    // Use 0.5 for smaller pieces in tray
                    width: piece.width * 0.5, 
                    height: piece.height * 0.5,
                    backgroundImage: `url(${piece.imageData})`,
                    backgroundSize: 'cover',
                  }}
                />
              );
            } else {
              // Placeholder for piece that is on the board
              return (
                 <div
                  key={`tray-placeholder-${piece.id}`}
                  className="rounded-sm border border-slate-200 border-dashed bg-slate-100 hidden" // Hidden placeholder to tighten layout
                  style={{
                    width: piece.width * 0.5, 
                    height: piece.height * 0.5,
                  }}
                />
              );
            }
          })}
        </div>
      </div>

    </div>
  );
};

export default PuzzleBoard;