import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  RotateCcw,
  Radio,
  Power
} from 'lucide-react';
import { useBench } from '../../context/BenchContext';

export const TopBar: React.FC = () => {
  const { benchStatus, resetToIdle, isTestRunning, testId, alarmDetails, resetAlarm } = useBench();
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('ru-RU', { hour12: false }));
      setDateStr(now.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = () => {
    switch (benchStatus) {
      case 'ready':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs font-semibold uppercase tracking-wider rounded-xs shadow-[inset_0_1px_0_rgba(16,185,129,0.15)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 led-glow-emerald" />
            <span>ГОТОВ К ПУСКУ</span>
          </div>
        );
      case 'running':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-sky-950/50 border border-sky-500/50 text-sky-300 text-xs font-semibold uppercase tracking-wider rounded-xs shadow-[inset_0_1px_0_rgba(56,189,248,0.2)]">
            <span className="w-2 h-2 rounded-full bg-sky-400 led-glow-sky animate-ping" />
            <span>ИСПЫТАНИЕ: {testId}</span>
          </div>
        );
      case 'warning':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-950/60 border border-amber-500/60 text-amber-300 text-xs font-bold uppercase tracking-wider rounded-xs shadow-[inset_0_1px_0_rgba(245,158,11,0.2)]">
            <span className="w-2 h-2 rounded-full bg-amber-400 led-glow-amber animate-pulse" />
            <span>ПРЕДУПРЕЖДЕНИЕ</span>
          </div>
        );
      case 'alarm':
        return (
          <div className="flex items-center gap-2 px-3.5 py-1 bg-red-950/80 border border-red-500 text-red-200 text-xs font-extrabold uppercase tracking-wider rounded-xs shadow-[inset_0_1px_0_rgba(239,68,68,0.3)] animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 led-glow-red" />
            <span>АВАРИЙНЫЙ ОСТАНОВ</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <header className="h-14 bg-[#0d1015] border-b border-[#202834] px-4 flex items-center justify-between select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      {/* Brand & Bench Identity */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#0d1f2d] border border-cyan-500/50 rounded-xs flex items-center justify-center text-cyan-400 font-black text-xs tracking-tighter shadow-[0_0_10px_rgba(6,182,212,0.25)]">
            RD
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-[0.1em] text-white">
                RU<span className="text-cyan-400">-DRIVE</span>
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 rounded-xs">
                HMI SYSTEM
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 tracking-wide">
              СТЕНД: <strong className="text-slate-200 font-semibold">TEST BENCH 01</strong> | ВЧРП 6.0 кВ
            </div>
          </div>
        </div>

        <div className="h-6 w-px bg-[#202834]" />

        {/* Controller Status Indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 bg-[#12161d] border border-[#202834] rounded-xs text-xs shadow-inner">
          <Radio className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400 text-[11px] font-mono">ПЛК:</span>
          <span className="text-amber-300 font-mono text-[11px] font-medium">Симуляция данных</span>
        </div>
      </div>

      {/* Center Bench Status Badge */}
      <div className="flex items-center gap-3">
        {getStatusBadge()}

        {alarmDetails && (
          <button
            onClick={resetAlarm}
            className="flex items-center gap-1.5 px-3 py-1 bg-red-900/60 hover:bg-red-800/80 active:scale-[0.96] border border-red-500/80 text-red-200 text-xs font-semibold rounded-xs transition-[transform,background-color] duration-150 cursor-pointer"
            title="Квитировать и сбросить аварию"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сброс аварии</span>
          </button>
        )}
      </div>

      {/* Right side: Clock & Quick Reset */}
      <div className="flex items-center gap-4">
        <button
          onClick={resetToIdle}
          disabled={isTestRunning}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-xs border transition-[transform,background-color,border-color] duration-150 ${
            isTestRunning 
              ? 'opacity-30 cursor-not-allowed border-[#1c222b] text-slate-500' 
              : 'border-[#263140] hover:bg-[#161c24] enabled:active:scale-[0.96] text-slate-300 cursor-pointer'
          }`}
          title="Сбросить стенд в дежурный режим"
        >
          <RotateCcw className="w-3 h-3 text-slate-400" />
          <span>Дежурный режим</span>
        </button>

        <div className="h-6 w-px bg-[#202834]" />

        <div className="text-right font-mono">
          <div className="text-sm font-bold text-white tracking-wider font-mono-telemetry leading-tight">
            {timeStr}
          </div>
          <div className="text-[10px] text-slate-500 tracking-wider">
            {dateStr}
          </div>
        </div>
      </div>
    </header>
  );
};
