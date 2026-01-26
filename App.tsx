import React, { useState, useEffect, useCallback } from 'react';
import PuzzleBoard from './components/PuzzleBoard';
import WelcomeScreen from './components/WelcomeScreen';
import MainMenu from './components/MainMenu';
import Tutorial from './components/Tutorial';
import { GameState, PuzzlePiece, Difficulty, DIFFICULTY_CONFIG, AppMode } from './types';
import { ArrowLeft, Clock, Move, Eye, EyeOff, Lightbulb, HelpCircle } from 'lucide-react';

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>(AppMode.WELCOME);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [showHint, setShowHint] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Initialize state with a seeded random image to ensure consistency between Menu and Board
  const [gameState, setGameState] = useState<GameState>(() => {
    const seed = Math.floor(Math.random() * 1000000);
    // Use picsum seed url to guarantee the same image is returned every time for this session
    const defaultImage = `https://picsum.photos/seed/${seed}/800/800`;
    
    return {
      imageSrc: defaultImage,
      pieces: [],
      rows: 3,
      cols: 3,
      isSolved: false,
      isPlaying: false,
      moves: 0,
      secondsElapsed: 0,
    };
  });

  const [timerId, setTimerId] = useState<number | null>(null);

  // Timer logic
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isSolved) {
      const id = window.setInterval(() => {
        setGameState(prev => ({ ...prev, secondsElapsed: prev.secondsElapsed + 1 }));
      }, 1000);
      setTimerId(id);
      return () => clearInterval(id);
    } else if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
  }, [gameState.isPlaying, gameState.isSolved]);

  const handleInitPieces = useCallback((pieces: PuzzlePiece[], width: number, height: number) => {
    // Initial load: pieces are generated and considered "solved" on the board for preview
    setGameState(prev => ({
      ...prev,
      pieces: pieces,
      isSolved: false, 
      isPlaying: false, // Wait for user to hit Start
      moves: 0,
      secondsElapsed: 0
    }));
  }, []);

  const handleShuffle = () => {
    if (gameState.pieces.length === 0) return;

    // Move all pieces to tray (currentPos = null) and shuffle array order
    const piecesInTray = gameState.pieces.map(p => ({
      ...p,
      currentPos: null // null means "in tray"
    }));

    // Fisher-Yates shuffle for the array order (display order in tray)
    for (let i = piecesInTray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [piecesInTray[i], piecesInTray[j]] = [piecesInTray[j], piecesInTray[i]];
    }

    setGameState(prev => ({
      ...prev,
      pieces: piecesInTray,
      isPlaying: true,
      isSolved: false,
      moves: 0,
      secondsElapsed: 0
    }));
  };

  const handleMove = (pieceId: number, targetIndex: number | null) => {
    setGameState(prev => {
      // Create a copy of pieces
      const newPieces = [...prev.pieces];
      
      // Find the piece being moved
      const movedPieceIndex = newPieces.findIndex(p => p.id === pieceId);
      if (movedPieceIndex === -1) return prev;
      const movedPiece = newPieces[movedPieceIndex];

      // Logic:
      // 1. If targetIndex is null, we are moving TO TRAY.
      // 2. If targetIndex is number, we are moving TO BOARD.
      //    a. If that board slot is empty, just place it.
      //    b. If that board slot is occupied, the OCCUPANT goes back to TRAY.

      if (targetIndex === null) {
        // Move to tray
        newPieces[movedPieceIndex] = { ...movedPiece, currentPos: null };
      } else {
        // Move to board
        // Check if spot is occupied by SOMEONE ELSE
        const existingOccupantIndex = newPieces.findIndex(p => p.currentPos === targetIndex && p.id !== pieceId);
        
        if (existingOccupantIndex !== -1) {
          // Kick existing occupant to tray
          newPieces[existingOccupantIndex] = { ...newPieces[existingOccupantIndex], currentPos: null };
        }

        // Place new piece
        newPieces[movedPieceIndex] = { ...movedPiece, currentPos: targetIndex };
      }

      // Check win condition
      // Win if ALL pieces are on board AND currentPos == correctPos
      const isSolved = newPieces.every(p => p.currentPos === p.correctPos);

      return {
        ...prev,
        pieces: newPieces,
        moves: prev.moves + 1,
        isSolved,
        isPlaying: !isSolved
      };
    });
  };

  const handleWin = () => {
    // Win animation handled in Board component
  };

  const handleImageChange = (src: string) => {
    setGameState(prev => ({
      ...prev,
      imageSrc: src,
      isPlaying: false,
      isSolved: false,
      moves: 0,
      secondsElapsed: 0
    }));
  };

  // --- Helpers ---
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- Navigation Handlers ---

  const enterMenu = () => {
    setAppMode(AppMode.MENU);
  };

  const startGameFromMenu = (selectedDiff: Difficulty) => {
    setDifficulty(selectedDiff);
    setShowHint(false); // Reset hint state on new game
    const { rows, cols } = DIFFICULTY_CONFIG[selectedDiff];
    
    // Update config
    setGameState(prev => ({
      ...prev,
      rows,
      cols,
      isPlaying: false, // Start in preview mode
      isSolved: false,
      moves: 0,
      secondsElapsed: 0
    }));
    
    setAppMode(AppMode.GAME);
    // Optional: Auto show tutorial on first game? For now, user clicks button.
    // setShowTutorial(true); 
  };

  const goToMenu = () => {
    setAppMode(AppMode.MENU);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-600">
      
      {/* SCENE: WELCOME */}
      {appMode === AppMode.WELCOME && (
        <WelcomeScreen onEnter={enterMenu} />
      )}

      {/* SCENE: MENU */}
      {appMode === AppMode.MENU && (
        <MainMenu 
          onStartGame={startGameFromMenu}
          imageSrc={gameState.imageSrc}
          onImageChange={handleImageChange}
        />
      )}

      {/* SCENE: GAME */}
      {appMode === AppMode.GAME && (
        <div className="flex flex-col min-h-screen animate-in fade-in duration-700">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 py-3 px-4 md:px-6 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
              
              {/* Left: Back & Title */}
              <div className="flex items-center justify-between w-full md:w-auto">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={goToMenu}
                    className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    title="メニューに戻る"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h1 className="text-xl font-medium text-slate-700 tracking-tight flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                     Gemini ジグソー
                  </h1>
                </div>
                
                {/* Mobile controls row */}
                <div className="flex items-center gap-2 md:hidden">
                  <button
                    onClick={() => setShowTutorial(true)}
                    className="p-2 rounded-full bg-indigo-50 text-indigo-500"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </button>
                  <div className="text-[10px] font-semibold bg-slate-100 px-3 py-1 rounded-full text-slate-500 tracking-wide">
                    {difficulty.split(' ')[0]}
                  </div>
                </div>
              </div>

              {/* Center/Right: Stats & Difficulty */}
              <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end">
                
                {/* Stats Container */}
                <div id="stats-panel" className="flex items-center gap-4 bg-slate-50/80 px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                   <div className="flex items-center gap-2">
                      <Move className="w-3.5 h-3.5 text-indigo-400" />
                      <div className="flex flex-col md:flex-row md:items-baseline md:gap-2 leading-none">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">手数</span>
                        <span className="text-sm font-mono font-medium text-slate-700">{gameState.moves}</span>
                      </div>
                   </div>
                   <div className="w-px h-5 bg-slate-200"></div>
                   <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <div className="flex flex-col md:flex-row md:items-baseline md:gap-2 leading-none">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">時間</span>
                        <span className="text-sm font-mono font-medium text-slate-700 min-w-[5ch]">{formatTime(gameState.secondsElapsed)}</span>
                      </div>
                   </div>
                </div>

                {/* Desktop Difficulty Display */}
                <div className="hidden md:block text-xs font-semibold bg-slate-100 px-4 py-2 rounded-full text-slate-500 tracking-wide">
                  {difficulty}
                </div>

                {/* Help Button (Desktop) */}
                <button
                  onClick={() => setShowTutorial(true)}
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all text-xs font-bold uppercase tracking-wider shadow-sm"
                >
                  <HelpCircle className="w-4 h-4" />
                  遊び方
                </button>

              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 items-start">
            
            {/* Sidebar Controls */}
            <aside id="sidebar-panel" className="order-2 lg:order-1 w-full space-y-8">
               
               {/* Reference Image (Toggleable Hint) */}
               <div id="reference-area" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300">
                 <div className="flex items-center justify-between">
                   <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                      <Lightbulb className={`w-4 h-4 transition-colors ${showHint ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                      見本
                   </h3>
                   <button
                     onClick={() => setShowHint(!showHint)}
                     className={`
                       flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all
                       ${showHint 
                         ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100' 
                         : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                       }
                     `}
                   >
                     {showHint ? (
                       <>
                         <EyeOff className="w-3.5 h-3.5" />
                         隠す
                       </>
                     ) : (
                       <>
                         <Eye className="w-3.5 h-3.5" />
                         見本を見る
                       </>
                     )}
                   </button>
                 </div>

                 {/* Collapsible Image Area */}
                 <div className={`
                    overflow-hidden transition-all duration-300 ease-in-out
                    ${showHint ? 'max-h-[400px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}
                 `}>
                   <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                     <img 
                       src={gameState.imageSrc} 
                       alt="Reference" 
                       className="w-full h-auto object-contain" 
                     />
                   </div>
                 </div>
              </div>

               {/* Simple Instructions Card (Static) */}
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hidden lg:block">
                 <h3 className="font-semibold text-slate-700 mb-4 text-sm">クイックガイド</h3>
                 <ul className="text-sm text-slate-500 space-y-3 leading-relaxed">
                   <li className="flex gap-3">
                     <span className="flex-none bg-slate-50 text-slate-400 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-slate-100">1</span>
                     <span><strong>スタート</strong>でピースを散らします</span>
                   </li>
                   <li className="flex gap-3">
                     <span className="flex-none bg-slate-50 text-slate-400 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-slate-100">2</span>
                     <span>トレイからボードへピースを置きます</span>
                   </li>
                 </ul>
               </div>
            </aside>

            {/* Game Area */}
            <section className="order-1 lg:order-2 w-full">
              <PuzzleBoard 
                game={gameState}
                onMove={handleMove}
                onInit={handleInitPieces}
                onWin={handleWin}
                onStart={handleShuffle}
              />
            </section>

          </main>

          {/* Tutorial Overlay */}
          {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}
        </div>
      )}
    </div>
  );
};

export default App;