import './index.css';

import { context, requestExpandedMode } from '@devvit/web/client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

export const Splash = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-cyan-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'grid-scroll 20s linear infinite'
        }}></div>
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 text-center max-w-2xl">
        {/* Title */}
        <div className="mb-8">
          <h1 
            className="text-7xl md:text-9xl font-black mb-2 animate-pulse-slow"
            style={{
              fontFamily: 'Impact, sans-serif',
              background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 80px rgba(34, 211, 238, 0.5)'
            }}
          >
            TACTICAL
          </h1>
          <h2 
            className="text-5xl md:text-7xl font-black"
            style={{
              fontFamily: 'Impact, sans-serif',
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #ef4444 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            SKIRMISH
          </h2>
        </div>

        {/* Feature tags */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <div className="bg-cyan-900/50 border border-cyan-500/50 px-4 py-2 rounded-full text-cyan-300 text-sm font-bold">
            ⚔️ 1v1 COMBAT
          </div>
          <div className="bg-blue-900/50 border border-blue-500/50 px-4 py-2 rounded-full text-blue-300 text-sm font-bold">
            🎯 4 UNIT TYPES
          </div>
          <div className="bg-purple-900/50 border border-purple-500/50 px-4 py-2 rounded-full text-purple-300 text-sm font-bold">
            🗺️ MULTIPLE MAPS
          </div>
        </div>

        {/* Description */}
        <p className="text-cyan-400 text-lg mb-8 max-w-md mx-auto">
          Command your forces in intense turn-based tactical warfare. Outmaneuver your opponent across diverse battlefields!
        </p>

        {/* Greeting */}
        <div className="mb-8">
          <p className="text-2xl font-bold text-white">
            Welcome, <span className="text-cyan-400">{context.username ?? 'Commander'}</span>!
          </p>
        </div>

        {/* Start button */}
        <button
          onClick={(e) => requestExpandedMode(e.nativeEvent, 'game')}
          className="group relative inline-flex items-center justify-center px-12 py-4 text-xl font-black text-white bg-linear-to-r from-cyan-600 to-blue-600 rounded-full overflow-hidden shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-110"
        >
          <span className="absolute w-64 h-64 bg-white/20 rounded-full -translate-x-32 -translate-y-32 group-hover:scale-150 transition-transform duration-500"></span>
          <span className="relative flex items-center gap-2">
            <span>⚡</span>
            DEPLOY TO BATTLE
            <span>⚡</span>
          </span>
        </button>

        {/* Unit preview */}
        <div className="mt-12 grid grid-cols-4 gap-4 max-w-md mx-auto">
          <div className="bg-cyan-900/30 border border-cyan-500/30 rounded-lg p-3 hover:border-cyan-400 transition-all">
            <div className="text-3xl mb-1">⚔️</div>
            <div className="text-xs text-cyan-400 font-bold">INFANTRY</div>
          </div>
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 hover:border-blue-400 transition-all">
            <div className="text-3xl mb-1">🛡️</div>
            <div className="text-xs text-blue-400 font-bold">TANK</div>
          </div>
          <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-3 hover:border-purple-400 transition-all">
            <div className="text-3xl mb-1">⚡</div>
            <div className="text-xs text-purple-400 font-bold">SCOUT</div>
          </div>
          <div className="bg-pink-900/30 border border-pink-500/30 rounded-lg p-3 hover:border-pink-400 transition-all">
            <div className="text-3xl mb-1">🎯</div>
            <div className="text-xs text-pink-400 font-bold">ARTILLERY</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes grid-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);