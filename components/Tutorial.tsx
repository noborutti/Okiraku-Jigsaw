import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Check, MousePointer2 } from 'lucide-react';

interface TutorialProps {
  onClose: () => void;
}

interface Step {
  targetId: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const steps: Step[] = [
  {
    targetId: 'tutorial-welcome-center', // Virtual ID for center screen
    title: "Gemini ジグソーへようこそ！",
    description: "簡単な遊び方を説明します。",
    position: 'center'
  },
  {
    targetId: 'reference-area',
    title: "完成図（見本）",
    description: "これが完成図です。わからなくなったら「見本を見る」ボタンでいつでも確認できます。",
    position: 'right'
  },
  {
    targetId: 'start-button-area',
    title: "ゲーム開始",
    description: "絵を覚えたら、「スタート」ボタンを押してピースをバラバラにしましょう。",
    position: 'top'
  },
  {
    targetId: 'piece-tray-area',
    title: "ピース置き場",
    description: "バラバラになったピースがここに表示されます。探しやすいように少し小さく表示されます。",
    position: 'top'
  },
  {
    targetId: 'puzzle-board-area',
    title: "パズルを完成させよう",
    description: "トレイからボード上の正しい場所にピースをドラッグして戻してください。頑張って！",
    position: 'bottom'
  }
];

const Tutorial: React.FC<TutorialProps> = ({ onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const step = steps[currentStepIndex];

  // Handle resizing and scrolling updates
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    // Update rect function
    const updateRect = () => {
      let element = document.getElementById(step.targetId);
      
      // Fallbacks if elements are missing from DOM (e.g. Start button during play)
      if (!element && step.targetId === 'start-button-area') {
         element = document.getElementById('puzzle-board-area');
      }

      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
      } else if (step.position === 'center') {
        // Virtual center rect
        setTargetRect({
          top: window.innerHeight / 2 - 100,
          left: window.innerWidth / 2 - 150,
          width: 300,
          height: 200,
          bottom: 0, right: 0, x: 0, y: 0, toJSON: () => {}
        });
      }
    };

    updateRect();
    window.addEventListener('resize', handleResize);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true); // Capture scroll

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [currentStepIndex, step.targetId, step.position]);

  // Auto-scroll to element on step change
  useEffect(() => {
    if (step.position !== 'center') {
      let element = document.getElementById(step.targetId);
      if (!element && step.targetId === 'start-button-area') {
         element = document.getElementById('puzzle-board-area');
      }
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStepIndex, step.targetId, step.position]);


  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  // Construct SVG Path for the "Hole"
  // Outer rect (full screen) + Inner rect (target) with evenodd rule
  const getOverlayPath = () => {
    if (!targetRect) return "";
    
    // Full screen rect
    const outer = `M 0 0 H ${windowSize.width} V ${windowSize.height} H 0 Z`;
    
    // Target rect with rounded corners (approx radius 12)
    const r = 12; 
    const { left: x, top: y, width: w, height: h } = targetRect;
    
    // Prevent negative dimensions or radius issues if target is tiny
    if (w < 2 * r || h < 2 * r) {
       // Simple rect if too small
       const inner = `M ${x} ${y} h ${w} v ${h} h -${w} Z`;
       return `${outer} ${inner}`;
    }

    const inner = `
      M ${x + r} ${y}
      h ${w - 2 * r}
      a ${r} ${r} 0 0 1 ${r} ${r}
      v ${h - 2 * r}
      a ${r} ${r} 0 0 1 -${r} ${r}
      h -${w - 2 * r}
      a ${r} ${r} 0 0 1 -${r} -${r}
      v -${h - 2 * r}
      a ${r} ${r} 0 0 1 ${r} -${r}
      z
    `;

    return `${outer} ${inner}`;
  };

  // Tooltip positioning logic
  const getTooltipStyle = () => {
    if (!targetRect) return {};
    const gap = 20;
    
    if (step.position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    let top = 0;
    let left = targetRect.left + targetRect.width / 2;
    let transform = 'translateX(-50%)';

    if (step.position === 'top') {
      top = targetRect.top - gap;
      transform = 'translate(-50%, -100%)';
    } else if (step.position === 'bottom') {
      top = targetRect.bottom + gap;
      transform = 'translate(-50%, 0)';
    } else if (step.position === 'left') {
      top = targetRect.top + targetRect.height / 2;
      left = targetRect.left - gap;
      transform = 'translate(-100%, -50%)';
    } else if (step.position === 'right') {
      top = targetRect.top + targetRect.height / 2;
      left = targetRect.right + gap;
      transform = 'translate(0, -50%)';
    }

    // Boundary checks to keep tooltip on screen
    const tooltipWidth = 320; 
    if (left < tooltipWidth / 2) { 
        left = 20; 
        transform = step.position === 'top' || step.position === 'bottom' 
            ? (step.position === 'top' ? 'translate(0, -100%)' : 'translate(0, 0)')
            : transform;
    } else if (left > windowSize.width - tooltipWidth / 2) {
        left = windowSize.width - 340;
         transform = step.position === 'top' || step.position === 'bottom' 
            ? (step.position === 'top' ? 'translate(0, -100%)' : 'translate(0, 0)')
            : transform;
    }
    
    return { top, left, transform };
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      
      {/* SVG Overlay: Blocks clicks everywhere EXCEPT the hole */}
      <svg className="absolute inset-0 w-full h-full">
         <path 
           d={getOverlayPath()} 
           fill="rgba(0, 0, 0, 0.75)" 
           fillRule="evenodd"
           className="pointer-events-auto transition-all duration-300 ease-in-out"
         />
      </svg>
      
      {/* Highlight Border (Visual only) */}
      {targetRect && (
        <div 
          className="absolute border-2 border-white/50 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.3)] pointer-events-none transition-all duration-300 ease-in-out"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
        />
      )}

      {/* Animated Floating Tooltip */}
      <div 
        className="absolute w-[320px] max-w-[90vw] transition-all duration-500 ease-out pointer-events-auto"
        style={getTooltipStyle()}
      >
        <div className="bg-white rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-300 border border-slate-100">
           
           {/* Decorative Elements */}
           <div className="absolute -top-10 -left-10 w-20 h-20 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
           <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700"></div>

           {/* Step Counter */}
           <div className="flex items-center justify-between mb-4">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
               Step {currentStepIndex + 1}/{steps.length}
             </span>
             <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors">
               <X className="w-5 h-5" />
             </button>
           </div>

           {/* Content */}
           <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
             {step.title}
             {currentStepIndex === 0 && <span className="text-2xl">👋</span>}
           </h3>
           <p className="text-slate-500 leading-relaxed text-sm mb-6">
             {step.description}
           </p>

           {/* Animated Interaction Hints */}
           {step.targetId === 'puzzle-board-area' && (
             <div className="absolute right-4 bottom-20 pointer-events-none opacity-20">
                <MousePointer2 className="w-12 h-12 text-indigo-500 animate-[bounce_2s_infinite]" />
             </div>
           )}

           {/* Buttons */}
           <div className="flex justify-end gap-3">
             <button 
               onClick={handleNext}
               className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 flex items-center gap-2"
             >
               {currentStepIndex === steps.length - 1 ? (
                 <>
                   あそぶ <Check className="w-4 h-4" />
                 </>
               ) : (
                 <>
                   次へ <ArrowRight className="w-4 h-4" />
                 </>
               )}
             </button>
           </div>
        </div>
      </div>

    </div>
  );
};

export default Tutorial;