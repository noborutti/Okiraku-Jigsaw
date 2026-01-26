import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onEnter: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter }) => {
  useEffect(() => {
    // Gentle confetti on mount
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#a5b4fc', '#cbd5e1', '#f0abfc'] // Softer colors
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#a5b4fc', '#cbd5e1', '#f0abfc']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-[#f8fafc]"
      onClick={onEnter}
    >
      {/* Calm Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white to-transparent opacity-80"></div>
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[100px] opacity-60 animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[100px] opacity-60 animate-pulse delay-1000"></div>
      
      <div className="relative z-10 text-center space-y-6 p-8">
        <div className="mb-8 inline-block p-4 rounded-full bg-white shadow-xl shadow-indigo-100/50 animate-[bounce_3s_infinite]">
           <Sparkles className="w-8 h-8 text-indigo-400" />
        </div>

        <h1 className="text-5xl md:text-7xl font-serif font-medium text-slate-800 tracking-tight leading-tight">
          Gemini<br/>
          <span className="text-indigo-500">Jigsaw</span>
        </h1>
        
        <p className="text-lg text-slate-500 font-light tracking-wide max-w-md mx-auto">
          AIが生成する、癒やしのパズル体験
        </p>

        <div className="pt-16">
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] animate-pulse">
            クリックしてスタート
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;