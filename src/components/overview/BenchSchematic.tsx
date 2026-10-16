import React from 'react';
import { 
  Zap, 
  RotateCw, 
  Layers, 
  Flame, 
  ThermometerSnowflake, 
  Disc,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useBench } from '../../context/BenchContext';
import { BenchComponent } from '../../types';

interface BenchSchematicProps {
  onSelectComponent: (comp: BenchComponent) => void;
  selectedCompId?: string;
}

export const BenchSchematic: React.FC<BenchSchematicProps> = ({ onSelectComponent, selectedCompId }) => {
  const { components, isTestRunning, telemetry } = useBench();

  const getComp = (id: string) => components.find(c => c.id === id);

  const vfdComp = getComp('comp-vfd');
  const inverterComp = getComp('comp-inverter');
  const indMotorComp = getComp('comp-motor-ind');
  const syncGenComp = getComp('comp-motor-sync');
  const brakeComp = getComp('comp-brake');
  const coolingComp = getComp('comp-cooling');

  const getStatusBorder = (comp?: BenchComponent) => {
    if (!comp) return 'border-[#202936] text-slate-400';
    if (comp.status === 'error') return 'border-red-500 bg-red-950/30 text-red-300';
    if (comp.status === 'warning') return 'border-amber-500 bg-amber-950/30 text-amber-300';
    return 'border-emerald-500/50 bg-[#111720] text-emerald-400';
  };

  return (
    <div className="industrial-card p-4 rounded-xs select-none">
      {/* Schematic Header */}
      <div className="flex items-center justify-between mb-3 border-b border-[#202834] pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 led-glow-emerald" />
          <span className="text-xs font-bold text-white tracking-[0.08em] uppercase font-mono">
            Технологическая мнемосхема испытательного стенда 6.0 кВ
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 led-glow-emerald" /> Норма
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 led-glow-amber" /> Предупреждение
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400 led-glow-red" /> Авария
          </span>
        </div>
      </div>

      {/* Schematic Grid */}
      <div className="grid grid-cols-12 gap-3 items-center py-1">
        {/* Left Section: VFD & Inverter (Electrical Drive) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-2.5">
          {/* VFD Box (RU-DRIVE Brand Object) */}
          <div
            onClick={() => vfdComp && onSelectComponent(vfdComp)}
            className={`p-3.5 border rounded-xs transition-[transform,border-color,background-color] duration-150 cursor-pointer relative shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${
              vfdComp?.status === 'error'
                ? 'border-red-500 bg-red-950/30 text-red-300'
                : vfdComp?.status === 'warning'
                  ? 'border-amber-500 bg-amber-950/30 text-amber-300'
                  : 'border-cyan-500/60 bg-[#0e1722] text-cyan-400'
            } ${
              selectedCompId === 'comp-vfd' ? 'ring-2 ring-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.35)]' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono tracking-widest text-cyan-400/90 font-bold uppercase">ОБЪЕКТ ИСПЫТАНИЙ RU-DRIVE</span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-[#09131d] border border-cyan-500/40 text-cyan-300 font-bold rounded-xs shadow-sm">
                6.0 кВ / 1000 кВт
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <div className="font-extrabold text-xs text-white tracking-wide">ВЧРП RU-DRIVE MV-1000</div>
            </div>
            <div className="mt-2.5 text-[11px] font-mono flex items-center justify-between text-slate-400 bg-[#070b10] p-2 border border-[#172535] rounded-xs font-mono-telemetry">
              <span>U_вых: <strong className="text-white">{isTestRunning ? telemetry.voltage : 0} В</strong></span>
              <span>Частота: <strong className="text-cyan-400 font-bold">{isTestRunning ? telemetry.frequency.toFixed(1) : 0} Гц</strong></span>
            </div>
          </div>

          {/* Inverter Box */}
          <div
            onClick={() => inverterComp && onSelectComponent(inverterComp)}
            className={`p-3 border rounded-xs transition-[transform,border-color,background-color] duration-150 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] ${getStatusBorder(inverterComp)} ${
              selectedCompId === 'comp-inverter' ? 'ring-1 ring-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">СИЛОВАЯ ЧАСТЬ</span>
              <span className="text-[11px] font-mono text-slate-300 font-mono-telemetry">
                T: <strong className="text-emerald-300">{isTestRunning ? telemetry.inverterTemp.toFixed(1) : (inverterComp?.temperature || 42)} °C</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">Инверторная стойка 3-Level NPC</span>
            </div>
          </div>
        </div>

        {/* Center/Right Section: Mechanical Shaft Powertrain */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-2.5">
          <div className="bg-[#0b0e12] border border-[#202834] p-3.5 rounded-xs shadow-inner">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-sky-400 rounded-full" />
                МЕХАНИЧЕСКИЙ ВАЛОПРОВОД СТЕНДА
              </span>
              {isTestRunning ? (
                <span className="text-sky-300 flex items-center gap-1.5 text-[11px] font-mono-telemetry font-bold">
                  <RotateCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                  {telemetry.rpm || 0} об/мин
                </span>
              ) : (
                <span className="text-slate-500 font-mono text-[10px]">ВАЛ ОСТАНОВЛЕН</span>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
              {/* 1. Induction Motor */}
              <div
                onClick={() => indMotorComp && onSelectComponent(indMotorComp)}
                className={`flex-1 min-w-[140px] p-3 border rounded-xs transition-[transform,border-color,background-color] duration-150 cursor-pointer ${getStatusBorder(indMotorComp)} ${
                  selectedCompId === 'comp-motor-ind' ? 'ring-1 ring-emerald-400' : ''
                }`}
              >
                <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">ПРИВОД (1000 кВт)</div>
                <div className="font-bold text-xs text-white truncate mt-0.5">Асинхр. двигатель</div>
                <div className="text-[11px] font-mono text-emerald-400 mt-1 font-mono-telemetry">
                  {isTestRunning ? `${telemetry.current || 0} А` : '0 А'}
                </div>
              </div>

              {/* Coupling Link with Shaft Animation */}
              <div className="flex flex-col items-center justify-center px-1">
                <svg width="48" height="14" className="overflow-visible">
                  <line 
                    x1="0" y1="7" x2="48" y2="7" 
                    stroke={isTestRunning ? '#38bdf8' : '#334155'} 
                    strokeWidth="3" 
                    className={isTestRunning ? 'animate-shaft' : ''}
                  />
                </svg>
                <span className="text-[8px] font-mono tracking-tighter text-slate-400 mt-0.5">МУФТА</span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold whitespace-nowrap font-mono-telemetry">
                  {isTestRunning ? `${telemetry.torque} Н·м` : '0 Н·м'}
                </span>
              </div>

              {/* 2. Synchronous Machine */}
              <div
                onClick={() => syncGenComp && onSelectComponent(syncGenComp)}
                className={`flex-1 min-w-[140px] p-3 border rounded-xs transition-[transform,border-color,background-color] duration-150 cursor-pointer ${getStatusBorder(syncGenComp)} ${
                  selectedCompId === 'comp-motor-sync' ? 'ring-1 ring-emerald-400' : ''
                }`}
              >
                <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">ГЕНЕРАТОР НАГРУЗКИ</div>
                <div className="font-bold text-xs text-white truncate mt-0.5">Синхронная машина</div>
                <div className="text-[11px] font-mono text-slate-300 mt-1 font-mono-telemetry">
                  Нагрузка: <strong className="text-white">{isTestRunning ? telemetry.loadPercent : 0}%</strong>
                </div>
              </div>

              {/* Coupling Link */}
              <div className="flex flex-col items-center justify-center px-1">
                <svg width="36" height="14">
                  <line 
                    x1="0" y1="7" x2="36" y2="7" 
                    stroke={isTestRunning ? '#10b981' : '#334155'} 
                    strokeWidth="2" 
                    strokeDasharray="3 2"
                  />
                </svg>
                <span className="text-[8px] font-mono text-slate-500">СЕТЬ</span>
              </div>

              {/* 3. Load / Grid Feedback */}
              <div className="flex-1 min-w-[130px] p-3 border border-[#202834] bg-[#12161e] rounded-xs text-slate-300 shadow-sm">
                <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">РЕКУПЕРАЦИЯ</div>
                <div className="font-bold text-xs text-white truncate mt-0.5">АСУ Нагрузки</div>
                <div className="text-[11px] font-mono text-emerald-400 mt-1 font-mono-telemetry font-bold">
                  {isTestRunning ? `${telemetry.power} кВт` : '0 кВт'}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Auxiliaries: Braking & Cooling */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Braking Chopper */}
            <div
              onClick={() => brakeComp && onSelectComponent(brakeComp)}
              className={`p-3 border rounded-xs transition-[transform,border-color,background-color] duration-150 cursor-pointer flex items-center justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] ${getStatusBorder(brakeComp)} ${
                selectedCompId === 'comp-brake' ? 'ring-1 ring-emerald-400' : ''
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-[9px] font-mono text-slate-400 uppercase">СБРОС ЭНЕРГИИ</div>
                  <div className="text-xs font-semibold text-white">Тормозной чоппер</div>
                </div>
              </div>
              <div className="text-right text-[11px] font-mono text-slate-300 font-mono-telemetry">
                <span>0.62 МПа</span>
              </div>
            </div>

            {/* Cooling System */}
            <div
              onClick={() => coolingComp && onSelectComponent(coolingComp)}
              className={`p-3 border rounded-xs transition-[transform,border-color,background-color] duration-150 cursor-pointer flex items-center justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] ${getStatusBorder(coolingComp)} ${
                selectedCompId === 'comp-cooling' ? 'ring-1 ring-emerald-400' : ''
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ThermometerSnowflake className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-[9px] font-mono text-slate-400 uppercase">ОХЛАЖДЕНИЕ</div>
                  <div className="text-xs font-semibold text-white">Жидкостный чиллер</div>
                </div>
              </div>
              <div className="text-right text-[11px] font-mono text-cyan-300 font-bold font-mono-telemetry">
                <span>{isTestRunning ? telemetry.coolingTemp.toFixed(1) : '24.8'} °C</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
