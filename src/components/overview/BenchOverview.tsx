import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  Play, 
  ArrowRight, 
  History, 
  Calendar, 
  ShieldCheck, 
  FileText,
  X,
  Gauge
} from 'lucide-react';
import { useBench } from '../../context/BenchContext';
import { BenchComponent } from '../../types';
import { BenchSchematic } from './BenchSchematic';

export const BenchOverview: React.FC = () => {
  const { 
    components, 
    runSelfTest, 
    isSelfTesting, 
    selfTestProgress, 
    results, 
    events, 
    setActiveTab,
    startTest,
    isTestRunning
  } = useBench();

  const [selectedComponent, setSelectedComponent] = useState<BenchComponent | null>(null);

  const lastResult = results[0];
  const testsThisShiftCount = 4; // realistic shift counter

  const getStatusBadge = (status: BenchComponent['status']) => {
    switch (status) {
      case 'normal':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 text-[10px] font-semibold font-mono rounded-xs">
            <CheckCircle2 className="w-3 h-3" />
            НОРМА
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-950/80 border border-amber-500/60 text-amber-300 text-[10px] font-semibold font-mono rounded-xs">
            <AlertTriangle className="w-3 h-3" />
            ПРЕДУПРЕЖДЕНИЕ
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-950/90 border border-red-500 text-red-300 text-[10px] font-semibold font-mono rounded-xs">
            <XCircle className="w-3 h-3" />
            ОШИБКА
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-900 border border-slate-700 text-slate-400 text-[10px] font-mono rounded-xs">
            <HelpCircle className="w-3 h-3" />
            НЕ ПРОВЕРЕНО
          </span>
        );
    }
  };

  return (
    <div className="p-4 pb-12 space-y-4 max-w-[1600px] mx-auto select-none">
      {/* Top Banner: Bench Readiness & Quick Action */}
      <div className="bg-[#10141a] border border-[#232b36] p-4 rounded-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-lg font-bold text-white tracking-wide">
              Испытательный стенд высоковольтных частотно-регулируемых приводов
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 font-bold rounded-xs">
              ГОТОВНОСТЬ 100%
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Стендовая позиция 01 • Объект: <span className="text-slate-200 font-medium">RU-DRIVE MV-1000/6-УХЛ4</span> • Серийный №: <span className="text-slate-200 font-mono">RD-2026-MV-0492</span>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Button: Check readiness (Автодиагностика) */}
          <button
            onClick={runSelfTest}
            disabled={isSelfTesting || isTestRunning}
            className={`px-4 py-2 border rounded-xs text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
              isSelfTesting
                ? 'bg-[#1b232e] border-sky-500 text-sky-400'
                : 'bg-[#151c24] hover:bg-[#1a232f] border-[#2c3746] text-slate-200'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${isSelfTesting ? 'animate-spin text-cyan-400' : 'text-emerald-400'}`} />
            <span>{isSelfTesting ? `Проверка... ${selfTestProgress}%` : 'Проверить готовность'}</span>
          </button>

          {/* Button: Configure & Start Test (RU-DRIVE Brand Turquoise) */}
          <button
            onClick={() => setActiveTab('new-test')}
            disabled={isTestRunning}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xs flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Настроить испытание</span>
          </button>
        </div>
      </div>

      {/* Self-test Progress Bar (visible during self-test) */}
      {isSelfTesting && (
        <div className="bg-[#10141a] border border-cyan-500/50 p-3 rounded-xs animate-fade-in">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-300 mb-1.5">
            <span>ВЫПОЛНЯЕТСЯ ТЕСТОВАЯ ПОСЛЕДОВАТЕЛЬНОСТЬ САМОДИАГНОСТИКИ ПОДСИСТЕМ СТЕНДА</span>
            <span>{selfTestProgress}%</span>
          </div>
          <div className="w-full bg-[#1b232e] h-2 rounded-xs overflow-hidden">
            <div 
              className="bg-cyan-400 h-full transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.6)]" 
              style={{ width: `${selfTestProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Compact Interactive Schematic */}
      <BenchSchematic 
        onSelectComponent={comp => setSelectedComponent(comp)}
        selectedCompId={selectedComponent?.id}
      />

      {/* Grid of Components Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {components.map(comp => (
          <div
            key={comp.id}
            onClick={() => setSelectedComponent(comp)}
            className={`p-3.5 industrial-card rounded-xs transition-[transform,border-color] duration-150 cursor-pointer enabled:active:scale-[0.98] flex flex-col justify-between ${
              selectedComponent?.id === comp.id ? 'border-cyan-500 ring-1 ring-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.25)]' : ''
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{comp.role}</span>
                {getStatusBadge(comp.status)}
              </div>
              <div className="font-bold text-sm text-white mb-1">{comp.name}</div>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                {comp.details}
              </p>
            </div>

            <div>
              {/* Subsystem Health Micro-bar */}
              <div className="space-y-1 mb-2.5">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Готовность узла</span>
                  <span className="text-emerald-400 font-bold">{comp.healthPercent}%</span>
                </div>
                <div className="w-full bg-[#17202c] h-1 rounded-xs overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${comp.healthPercent}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#1a232f] flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Проверено: {comp.lastChecked}</span>
                <span className="text-cyan-400 font-semibold hover:underline">Подробнее →</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Summary: Last Test, Shift Counters, Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Last Test Summary */}
        <div className="bg-[#10141a] border border-[#232b36] p-4 rounded-xs">
          <div className="flex items-center justify-between mb-3 border-b border-[#232b36] pb-2">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Последнее испытание</span>
            </div>
            <span className="text-xs font-mono text-slate-400">{lastResult?.date}</span>
          </div>

          {lastResult ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Номер:</span>
                <span className="font-mono font-bold text-slate-200">{lastResult.testId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Методика:</span>
                <span className="text-slate-200 truncate max-w-[200px]" title={lastResult.methodology.title}>
                  {lastResult.methodology.code} ({lastResult.methodology.title})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Итог:</span>
                <span className={`font-semibold ${lastResult.finalStatus === 'success' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {lastResult.finalStatus === 'success' ? 'Успешно завершено' : 'Завершено с замечаниями'}
                </span>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('results')}
                  className="w-full py-1.5 px-3 bg-[#151c24] hover:bg-[#1a232e] border border-[#232b36] text-slate-300 text-xs rounded-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Открыть протокол испытания</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-4 text-center">Нет завершённых испытаний</div>
          )}
        </div>

        {/* Shift Stats */}
        <div className="bg-[#10141a] border border-[#232b36] p-4 rounded-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 border-b border-[#232b36] pb-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Статистика смены</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-[#0b0e12] border border-[#1e2632] p-2.5 rounded-xs">
                <div className="text-[10px] font-mono text-slate-400">ИСПЫТАНИЙ ЗА СМЕНУ</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">{testsThisShiftCount}</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">3 успешно / 1 с замечаниями</div>
              </div>
              <div className="bg-[#0b0e12] border border-[#1e2632] p-2.5 rounded-xs">
                <div className="text-[10px] font-mono text-slate-400">НАРАБОТКА СТЕНДА</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">4.2 ч</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Смена 1 (08:00 – 20:00)</div>
              </div>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 bg-[#0d1117] p-2 border border-[#1b222c] rounded-xs flex items-center justify-between">
            <span>Оператор: Смирнов А. В.</span>
            <span className="text-emerald-400">Допуск: Группа V (&gt;1000В)</span>
          </div>
        </div>

        {/* Recent Events Feed */}
        <div className="bg-[#10141a] border border-[#232b36] p-4 rounded-xs">
          <div className="flex items-center justify-between mb-3 border-b border-[#232b36] pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Последние события стенда</span>
            <button
              onClick={() => setActiveTab('logs')}
              className="text-[11px] font-mono text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Все события</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {events.slice(0, 3).map(ev => (
              <div key={ev.id} className="text-xs p-2 bg-[#0c1015] border border-[#1e2632] rounded-xs">
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="text-slate-400">{ev.timestamp}</span>
                  <span className={`font-semibold ${ev.level === 'alarm' ? 'text-red-400' : ev.level === 'warning' ? 'text-amber-400' : 'text-slate-300'}`}>
                    {ev.component}
                  </span>
                </div>
                <div className="text-slate-200 truncate">{ev.event}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Component Details Modal */}
      {selectedComponent && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#11161d] border border-[#2d3748] rounded-xs max-w-lg w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-[#232b36] pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">{selectedComponent.role}</span>
                <h3 className="text-base font-bold text-white">{selectedComponent.name}</h3>
              </div>
              <button
                onClick={() => setSelectedComponent(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Текущее состояние</span>
                <div className="mt-1 flex items-center gap-2">
                  {getStatusBadge(selectedComponent.status)}
                  <span className="text-xs font-mono text-slate-300">
                    Индекс готовности: <strong className="text-emerald-400">{selectedComponent.healthPercent}%</strong>
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Описание и диагностика</span>
                <p className="mt-1 text-xs text-slate-200 bg-[#0b0e12] p-3 border border-[#1e2632] rounded-xs leading-relaxed">
                  {selectedComponent.details}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Контрольные параметры</span>
                <div className="mt-2 space-y-1.5">
                  {selectedComponent.parameters.map((param, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 bg-[#0c1015] border border-[#1e2632] rounded-xs font-mono">
                      <span className="text-slate-400">{param.label}</span>
                      <span className="text-emerald-400 font-bold">{param.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-[#232b36]">
                <button
                  onClick={() => setSelectedComponent(null)}
                  className="px-4 py-1.5 bg-[#1b232e] hover:bg-[#242f3d] border border-[#2f3d4f] text-slate-200 text-xs font-semibold rounded-xs cursor-pointer"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
