import React, { useState } from 'react';
import { Difficulty, DIFFICULTY_CONFIG } from '../types';
import { generatePuzzleImage } from '../services/geminiService';
import { 
  Play, Grid3X3, Trophy, Image as ImageIcon, Upload, 
  Wand2, Loader2, ArrowRight, ArrowLeft, Check, Sparkles 
} from 'lucide-react';

interface MainMenuProps {
  onStartGame: (difficulty: Difficulty) => void;
  imageSrc: string;
  onImageChange: (src: string) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, imageSrc, onImageChange }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageChange(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const base64Image = await generatePuzzleImage(prompt);
      onImageChange(base64Image);
      setPrompt(''); 
    } catch (err: any) {
      setErrorMsg("画像の生成に失敗しました。もう一度お試しください。");
    } finally {
      setIsGenerating(false);
    }
  };

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  return (
    <div className="fixed inset-0 z-40 bg-[#f8fafc] text-slate-600 overflow-y-auto">
      {/* Calm Ambient Background */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-blue-100 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-50 rounded-full blur-[120px]"></div>
      </div>

      <div className="min-h-full flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="max-w-6xl w-full">
          
          {/* Header */}
          <header className="mb-10 text-center space-y-2">
             <h1 className="text-3xl font-serif font-medium text-slate-800 tracking-tight">
               パズル設定
             </h1>
             <div className="flex justify-center items-center gap-3">
               <span className={`text-xs font-bold tracking-widest uppercase transition-colors ${step === 1 ? 'text-indigo-500' : 'text-slate-300'}`}>01 イラスト選択</span>
               <div className="w-8 h-px bg-slate-200"></div>
               <span className={`text-xs font-bold tracking-widest uppercase transition-colors ${step === 2 ? 'text-indigo-500' : 'text-slate-300'}`}>02 難易度</span>
             </div>
          </header>

          {/* MAIN CARD */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-white overflow-hidden relative transition-all duration-700">
            
            {/* STEP 1: IMAGE SELECTION */}
            {step === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* Left: Preview */}
                <div className="p-8 lg:p-12 bg-slate-50 flex flex-col justify-center items-center relative border-r border-slate-100">
                  <div className="relative w-full max-w-md bg-white p-3 rounded-2xl shadow-sm border border-slate-100 transform transition-transform hover:scale-[1.02] duration-500">
                    <div className="rounded-xl overflow-hidden bg-slate-100 relative">
                       {/* Use object-contain to show full image without cropping */}
                       <img 
                        src={imageSrc} 
                        alt="Preview" 
                        className="w-full h-auto max-h-[400px] object-contain mx-auto"
                      />
                    </div>
                    <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 border border-slate-100">
                       <Check className="w-3.5 h-3.5 text-green-500" />
                       <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">選択中</span>
                    </div>
                  </div>
                </div>

                {/* Right: Controls */}
                <div className="p-8 lg:p-12 flex flex-col justify-center space-y-10 bg-white">
                  
                  {/* AI Section */}
                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      AIで生成する
                    </label>
                    <div className="flex gap-2">
                       <input
                          type="text"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                          placeholder="どんな絵がいいですか？ (例: 宇宙を泳ぐ猫)"
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                        />
                        <button
                          onClick={handleGenerate}
                          disabled={isGenerating || !prompt}
                          className="bg-slate-800 hover:bg-slate-700 text-white px-5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-slate-200"
                        >
                          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                        </button>
                    </div>
                    {errorMsg && <p className="text-red-400 text-xs">{errorMsg}</p>}
                  </div>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-100"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-300 text-xs font-medium uppercase tracking-widest">または</span>
                    <div className="flex-grow border-t border-slate-100"></div>
                  </div>

                  {/* Upload Section */}
                  <div className="space-y-4">
                     <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-indigo-400" />
                      写真をアップロード
                    </label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-100 border-dashed rounded-2xl cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group bg-slate-50/50">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-6 h-6 text-slate-300 group-hover:text-indigo-400 mb-2 transition-colors" />
                            <p className="text-xs text-slate-400 font-medium group-hover:text-indigo-400">端末からファイルを選択</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button
                      onClick={nextStep}
                      className="group flex items-center gap-3 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5"
                    >
                      次へ
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* STEP 2: DIFFICULTY SELECTION */}
            {step === 2 && (
              <div className="p-8 md:p-10 animate-in fade-in slide-in-from-right-8 duration-700 flex flex-col h-full bg-white">
                
                <div className="flex items-center justify-between mb-6">
                  <button 
                    onClick={prevStep}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    イラスト選択に戻る
                  </button>
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                     {/* Show thumbnail properly */}
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-white border border-slate-200">
                        <img src={imageSrc} alt="Selected" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500">選択中の画像</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 items-stretch">
                  {Object.values(Difficulty).map((diff, index) => {
                    const config = DIFFICULTY_CONFIG[diff];
                    const icons = [<ImageIcon key={0} className="w-5 h-5"/>, <Grid3X3 key={1} className="w-5 h-5"/>, <Play key={2} className="w-5 h-5"/>, <Trophy key={3} className="w-5 h-5"/>];
                    
                    // Calm colors
                    const accents = [
                      "text-emerald-500 bg-emerald-50 group-hover:bg-emerald-100 ring-1 ring-emerald-100",
                      "text-sky-500 bg-sky-50 group-hover:bg-sky-100 ring-1 ring-sky-100",
                      "text-violet-500 bg-violet-50 group-hover:bg-violet-100 ring-1 ring-violet-100",
                      "text-rose-500 bg-rose-50 group-hover:bg-rose-100 ring-1 ring-rose-100",
                    ];
                    
                    const totalPieces = config.rows * config.cols;

                    return (
                      <button
                        key={diff}
                        onClick={() => onStartGame(diff)}
                        className="group relative flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-200 bg-white shadow-md hover:shadow-xl hover:border-indigo-200 hover:ring-2 hover:ring-indigo-100 transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className={`
                          w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300
                          ${accents[index % accents.length]}
                        `}>
                          {icons[index % icons.length]}
                        </div>

                        <div className="text-center space-y-1">
                          <h3 className="text-lg font-bold text-slate-700 flex items-center justify-center gap-2">
                             {diff.split(' ')[0]}
                             <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                               {totalPieces} ピース
                             </span>
                          </h3>
                          <p className="text-slate-400 text-xs font-medium tracking-wide">
                            {config.rows} &times; {config.cols} グリッド
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;