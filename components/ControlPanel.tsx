import React from 'react';
import { Difficulty, DIFFICULTY_CONFIG } from '../types';

interface ControlPanelProps {
  onDifficultyChange: (rows: number, cols: number) => void;
  onShuffle: () => void;
  isPlaying: boolean;
  currentDifficulty: Difficulty;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onDifficultyChange,
  onShuffle,
  isPlaying,
  currentDifficulty
}) => {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Difficulty Selector (For Restarting) */}
      <div className="pt-2">
        <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest ml-1">Settings</label>
        <div className="relative">
          <select
            className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all cursor-pointer appearance-none shadow-sm"
            value={currentDifficulty}
            onChange={(e) => {
              const diff = e.target.value as Difficulty;
              const { rows, cols } = DIFFICULTY_CONFIG[diff];
              onDifficultyChange(rows, cols);
            }}
          >
            {Object.values(Difficulty).map((diff) => (
              <option key={diff} value={diff}>{diff}</option>
            ))}
          </select>
          <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;