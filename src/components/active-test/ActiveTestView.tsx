import React, { useState } from 'react';
import { 
  Pause, 
  Play, 
  Square, 
  OctagonAlert, 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Thermometer, 
  Zap, 
  RotateCw, 
  ScrollText, 
  TrendingUp,
  Cpu,
  Layers,
  ShieldAlert
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { useBench } from '../../context/BenchContext';
import { SimulationScenario } from '../../types';

export const ActiveTestView: React.FC = () => {
  const {
    testId,
    activeObject,
    activeMethodology,
    activeParams,
    isTestRunning,
    isTestPaused,
    testStage,
    elapsedSec,
    progressPercent,
    telemetry,
    telemetryHistory,
    pauseTest,
    resumeTest,
    stopTest,
    triggerEmergencyStop,
    scenario,
    setScenario,
    setActiveTab,
    alarmDetails,
    isWorstCaseData,
    toggleWorstCaseData
  } = useBench();

  const [activeChartChannel, setActiveChartChannel] = useState<'rpm' | 'current' | 'torque' | 'inverterTemp' | 'all'>('rpm');
  const [chartTimeWindow, setChartTimeWindow] = useState<number>(60);
  const [showStopModal, setShowStopModal] = useState<boolean>(false);
  const [showEStopModal, setShowEStopModal] = useState<boolean>(false);

  const filteredHistory = chartTimeWindow === 0 
    ? telemetryHistory 
    : telemetryHistory.slice(-chartTimeWindow);

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const stagesList = [
    { key: 'readiness', label: '1. Проверка готовности' },
    { key: 'ramp_up', label: '2. Разгон' },
    { key: 'stabilization', label: '3. Выход на режим' },
    { key: 'load_test', label: '4. Под нагрузкой' },
    { key: 'completion', label: '5. Завершение' }
  ];

  const getStageIndex = (stage: string) => {
    switch (stage) {
      case 'readiness': return 0;
      case 'ramp_up': return 1;
      case 'stabilization': return 2;
      case 'load_test': return 3;
      case 'completion': return 4;
      default: return 0;
    }
  };

  const currentStageIdx = getStageIndex(testStage);

  // Meter percentage calculations
  const rpmPercent = Math.min(100, Math.round(((telemetry.rpm || 0) / (activeParams.targetRpm || 1500)) * 100));
  const currentPercent = Math.min(100, Math.round(((telemetry.current || 0) / (activeParams.maxCurrent || 140)) * 100));
  const tempPercent = Math.min(100, Math.round((telemetry.inverterTemp / 100) * 100));
  const loadPercent = Math.min(100, telemetry.loadPercent);

  return (
    <div className="p-4 pb-12 space-y-3.5 max-w-[1600px] mx-auto select-none">
      {/* Top Test Header & Status */}
      <div className="industrial-card p-4 rounded-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0 max-w-full">
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5 min-w-0">
              <span className="font-mono font-bold text-lg text-white tracking-wider font-mono-telemetry shrink-0">{testId}</span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 rounded-xs shrink-0">
                {activeMethodology.code}: {activeMethodology.title}
              </span>
              <span className="text-xs font-mono text-slate-400 truncate max-w-xl" title={`${activeObject.model} (${activeObject.serialNumber})`}>
                Объект: <strong className="text-slate-200">{activeObject.model}</strong> <span className="text-slate-400">({activeObject.serialNumber})</span>
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Время: <strong className="text-white font-mono-telemetry">{formatTime(elapsedSec)}</strong> / {formatTime(activeParams.durationSec)}
              </span>
              <span>•</span>
              <span>
                Прогресс: <strong className="text-cyan-400 font-mono-telemetry">{progressPercent}%</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                Статус: 
                <strong className={`font-mono ${isTestPaused ? 'text-amber-400' : isTestRunning ? 'text-cyan-400' : 'text-slate-400'}`}>
                  {isTestPaused ? 'ПАУЗА' : isTestRunning ? 'В РАБОТЕ' : 'ОСТАНОВЛЕНО'}
                </strong>
              </span>
            </div>
          </div>

          {/* Test Control Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {isTestRunning && (
              <>
                {isTestPaused ? (
                  <button
                    onClick={resumeTest}
                    className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 enabled:active:scale-[0.96] text-white text-xs font-bold rounded-xs flex items-center gap-1.5 cursor-pointer transition-[transform,background-color] duration-150 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Продолжить</span>
                  </button>
                ) : (
                  <button
                    onClick={pauseTest}
                    className="px-4 py-2 bg-[#1a232f] hover:bg-[#222e3d] enabled:active:scale-[0.96] border border-[#2d3d52] text-slate-200 text-xs font-semibold rounded-xs flex items-center gap-1.5 cursor-pointer transition-[transform,background-color] duration-150"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Пауза</span>
                  </button>
                )}

                <button
                  onClick={() => setShowStopModal(true)}
                  className="px-3.5 py-2 bg-[#1b2028] hover:bg-[#252b36] enabled:active:scale-[0.96] border border-[#2f3846] text-slate-300 text-xs font-semibold rounded-xs flex items-center gap-1.5 cursor-pointer transition-[transform,background-color] duration-150"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Остановить</span>
                </button>
              </>
            )}

            {/* Emergency Stop Button (E-STOP) */}
            <button
              onClick={() => setShowEStopModal(true)}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 enabled:active:scale-[0.96] text-white text-xs font-extrabold uppercase tracking-wider rounded-xs flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-[transform,background-color] duration-150 border border-red-500"
            >
              <OctagonAlert className="w-4 h-4 text-white" />
              <span>АВАРИЙНЫЙ ОСТАНОВ (E-STOP)</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className="px-3 py-2 bg-[#12161e] hover:bg-[#181f2a] border border-[#202834] text-slate-300 text-xs rounded-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ScrollText className="w-3.5 h-3.5 text-slate-400" />
              <span>Журнал</span>
            </button>
          </div>
        </div>

        {/* Stages Progress Timeline */}
        <div className="mt-4 pt-3 border-t border-[#1d2633]">
          <div className="grid grid-cols-5 gap-2">
            {stagesList.map((st, idx) => {
              const isPast = idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx && isTestRunning;
              return (
                <div
                  key={st.key}
                  className={`p-2.5 border rounded-xs text-[11px] font-mono transition-colors flex items-center justify-between ${
                    isCurrent
                      ? 'border-cyan-500 bg-[#0d1f2d] text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                      : isPast
                        ? 'border-[#1e2a38] bg-[#0c1117] text-slate-400'
                        : 'border-[#161d26] bg-[#080b0f] text-slate-600'
                  }`}
                >
                  <span className="truncate">{st.label}</span>
                  {isPast ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : isCurrent ? (
                    <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Demonstration Scenarios Bar */}
      <div className="bg-[#0e1218] border border-[#202834] p-2.5 rounded-xs flex flex-wrap items-center justify-between gap-2 text-xs shadow-inner">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-semibold">ДЕМО-СЦЕНАРИИ:</span>
          <span className="text-[11px] text-slate-400">Проверить реакцию HMI на события стенда:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'normal', label: 'A. Нормальный цикл', color: 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/30' },
            { id: 'temp_warning', label: 'B. Перегрев (>85°C)', color: 'border-amber-500/50 text-amber-300 hover:bg-amber-950/30' },
            { id: 'sensor_loss', label: 'C. Обрыв датчика LEM', color: 'border-yellow-500/50 text-yellow-300 hover:bg-yellow-950/30' },
            { id: 'critical_trip', label: 'D. Критическая авария (КЗ)', color: 'border-red-500/60 text-red-300 hover:bg-red-950/30' }
          ].map(sc => (
            <button
              key={sc.id}
              onClick={() => setScenario(sc.id as SimulationScenario)}
              className={`px-3 py-1 text-[11px] font-mono border rounded-xs transition-[transform,background-color] duration-150 cursor-pointer enabled:active:scale-[0.96] ${
                scenario === sc.id
                  ? 'bg-[#1b2330] font-bold text-white ring-1 ring-slate-300 shadow-sm'
                  : `bg-[#11161d] ${sc.color}`
              }`}
            >
              {sc.label}
            </button>
          ))}

          {/* break-ui adversarial stress toggle */}
          <div className="h-4 w-px bg-[#263140] mx-1" />
          <button
            onClick={toggleWorstCaseData}
            className={`px-2.5 py-1 text-[11px] font-mono border rounded-xs transition-[transform,background-color] duration-150 cursor-pointer enabled:active:scale-[0.96] ${
              isWorstCaseData
                ? 'bg-purple-950/60 border-purple-500 text-purple-300 font-bold shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                : 'bg-[#11161d] border-[#252f3e] text-slate-400 hover:text-white'
            }`}
            title="Проверить отображение на экстремально длинных и граничных значениях (break-ui)"
          >
            {isWorstCaseData ? '⚠ Стресс-тест данных (ВКЛ)' : 'Стресс-тест (break-ui)'}
          </button>
        </div>
      </div>

      {/* Critical Alarm Banner */}
      {alarmDetails && (
        <div className="p-4 bg-red-950/90 border-2 border-red-500 text-red-100 rounded-xs flex items-center justify-between gap-4 shadow-[0_0_25px_rgba(239,68,68,0.4)] animate-pulse">
          <div className="flex items-center gap-3.5">
            <ShieldAlert className="w-8 h-8 text-red-400 shrink-0" />
            <div>
              <div className="font-extrabold text-sm tracking-wide text-white uppercase">
                КРИТИЧЕСКАЯ АВАРИЯ: {alarmDetails.message}
              </div>
              <div className="text-xs text-red-200 font-mono mt-0.5">
                Время: {alarmDetails.timestamp} • Источник: {alarmDetails.component} • Силовая цепь обесточена
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('logs')}
            className="px-3.5 py-1.5 bg-red-800 hover:bg-red-700 active:scale-[0.96] text-white text-xs font-bold rounded-xs border border-red-400 cursor-pointer transition-transform"
          >
            Событие в журнале
          </button>
        </div>
      )}

      {/* 9-Cards Telemetry Grid with Micro-Meter Progress Bars */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {/* 1. RPM */}
        <div className={`p-3.5 industrial-card rounded-xs ${telemetry.sensorsValid.rpm ? '' : 'border-amber-500/80 bg-amber-950/20'}`}>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase mb-1.5">
            <span>Обороты двигателя</span>
            <RotateCw className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-1.5 leading-none">
            <span className="text-2xl font-bold font-mono font-mono-telemetry text-white">
              {telemetry.sensorsValid.rpm ? (telemetry.rpm ?? '---') : '---'}
            </span>
            <span className="text-xs font-mono text-slate-400 font-medium">об/мин</span>
          </div>
          {/* Micro-bar */}
          <div className="w-full bg-[#17202c] h-1.5 rounded-xs overflow-hidden mt-2.5">
            <div 
              className="bg-emerald-400 h-full transition-all duration-300"
              style={{ width: `${rpmPercent}%` }}
            />
          </div>
          <div className="mt-2 text-[10px] font-mono text-slate-400 flex justify-between">
            <span>Задано: {activeParams.targetRpm}</span>
            <span className={telemetry.sensorsValid.rpm ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-bold'}>
              {telemetry.sensorsValid.rpm ? 'НОРМА' : 'НЕДОСТОВЕРНО'}
            </span>
          </div>
        </div>

        {/* 2. Frequency */}
        <div className="p-3.5 industrial-card rounded-xs">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase mb-1.5">
            <span>Выходная частота</span>
            <Activity className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-1.5 leading-none">
            <span className="text-2xl font-bold font-mono font-mono-telemetry text-emerald-400">
              {telemetry.frequency.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-400 font-medium">Гц</span>
          </div>
          {/* Micro-bar */}
          <div className="w-full bg-[#17202c] h-1.5 rounded-xs overflow-hidden mt-2.5">
            <div 
              className="bg-emerald-400 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (telemetry.frequency / 50) * 100)}%` }}
            />
          </div>
          <div className="mt-2 text-[10px] font-mono text-slate-400 flex justify-between">
            <span>Задано: {activeParams.frequency}</span>
            <span className="text-emerald-400 font-semibold">НОРМА</span>
          </div>
        </div>

        {/* 3. Current (RMS + 3-Phase Breakdown by PUE/GOST) */}
        <div className={`p-3.5 industrial-card rounded-xs flex flex-col justify-between ${
          telemetry.sensorsValid.current ? '' : 'border-amber-500 bg-amber-950/30'
        }`}>
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase mb-1.5">
              <span className="truncate" title="Действующий ток статора (RMS) и фазные токи">Ток статора (RMS)</span>
              <Zap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            </div>
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className="text-2xl font-bold font-mono font-mono-telemetry text-white">
                {telemetry.sensorsValid.current ? (telemetry.current?.toFixed(1) ?? '---') : '---'}
              </span>
              <span className="text-xs font-mono text-slate-400 font-medium">А</span>
            </div>

            {/* Micro-bar */}
            <div className="w-full bg-[#17202c] h-1.5 rounded-xs overflow-hidden mt-2.5">
              <div 
                className={`h-full transition-all duration-300 ${currentPercent > 90 ? 'bg-amber-400' : 'bg-sky-400'}`}
                style={{ width: `${currentPercent}%` }}
              />
            </div>

            {/* 3-Phase Breakdown Pills (PUE colors: Phase A = Yellow/Amber, Phase B = Green/Emerald, Phase C = Red) */}
            <div className="grid grid-cols-3 gap-1 mt-2.5 pt-2 border-t border-[#1d2633] text-[10px] font-mono">
              {/* Phase A (Yellow) */}
              <div className="bg-[#0b0f14] border border-amber-500/30 rounded-xs px-1.5 py-1 flex flex-col items-center min-w-0">
                <span className="text-amber-400 font-bold text-[9px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" /> Ia
                </span>
                <span className="text-white font-mono font-mono-telemetry mt-0.5 truncate">
                  {telemetry.currentPhaseA !== null && telemetry.currentPhaseA !== undefined ? `${telemetry.currentPhaseA}` : '---'}
                </span>
              </div>

              {/* Phase B (Green) */}
              <div className={`border rounded-xs px-1.5 py-1 flex flex-col items-center min-w-0 ${
                telemetry.sensorsValid.current 
                  ? 'bg-[#0b0f14] border-emerald-500/30' 
                  : 'bg-amber-950/40 border-amber-500 animate-pulse'
              }`}>
                <span className={`font-bold text-[9px] flex items-center gap-1 ${
                  telemetry.sensorsValid.current ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${telemetry.sensorsValid.current ? 'bg-emerald-400' : 'bg-amber-400'}`} /> Ib
                </span>
                <span className="text-white font-mono font-mono-telemetry mt-0.5 truncate">
                  {telemetry.currentPhaseB !== null && telemetry.currentPhaseB !== undefined ? `${telemetry.currentPhaseB}` : 'ОБРЫВ'}
                </span>
              </div>

              {/* Phase C (Red) */}
              <div className="bg-[#0b0f14] border border-rose-500/30 rounded-xs px-1.5 py-1 flex flex-col items-center min-w-0">
                <span className="text-rose-400 font-bold text-[9px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" /> Ic
                </span>
                <span className="text-white font-mono font-mono-telemetry mt-0.5 truncate">
                  {telemetry.currentPhaseC !== null && telemetry.currentPhaseC !== undefined ? `${telemetry.currentPhaseC}` : '---'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-2 text-[10px] font-mono text-slate-400 flex justify-between items-center">
            <span className="truncate">Предел: {activeParams.maxCurrent} А</span>
            <span className={`font-semibold shrink-0 ml-1 ${
              telemetry.sensorsValid.current ? 'text-emerald-400' : 'text-amber-400 font-bold'
            }`}>
              {telemetry.sensorsValid.current ? 'НОРМА' : 'ОБРЫВ LEM-B'}
            </span>
          </div>
        </div>

        {/* 4. Voltage */}
        <div className="p-3.5 industrial-card rounded-xs">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase mb-1.5">
            <span>Напряжение шины DC</span>
            <Zap className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-1.5 leading-none">
            <span className="text-2xl font-bold font-mono font-mono-telemetry text-white">
              {telemetry.voltage}
            </span>
            <span className="text-xs font-mono text-slate-400 font-medium">В</span>
          </div>
          <div className="w-full bg-[#17202c] h-1.5 rounded-xs overflow-hidden mt-2.5">
            <div 
              className="bg-emerald-400 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (telemetry.voltage / 6000) * 100)}%` }}
            />
          </div>
          <div className="mt-2 text-[10px] font-mono text-slate-400 flex justify-between">
            <span>Номинал: 6000 В</span>
            <span className="text-emerald-400 font-semibold">НОРМА</span>
          </div>
        </div>

        {/* 5. Torque */}
        <div className="p-3.5 industrial-card rounded-xs">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase mb-1.5">
            <span>Эл.-магнитный момент</span>
            <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-1.5 leading-none">
            <span className="text-2xl font-bold font-mono font-mono-telemetry text-white">
              {telemetry.torque}
            </span>
            <span className="text-xs font-mono text-slate-400 font-medium">Н·м</span>
          </div>
          <div className="w-full bg-[#17202c] h-1.5 rounded-xs overflow-hidden mt-2.5">
            <div 
              className="bg-amber-400 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (telemetry.torque / 6366) * 100)}%` }}
            />
          </div>
          <div className="mt-2 text-[10px] font-mono text-slate-400 flex justify-between">
            <span>Номинал: 6366 Н·м</span>
            <span className="text-emerald-400 font-semibold">НОРМА</span>
          </div>
        </div>

        {/* 6. Power */}
        <div className="p-3.5 industrial-card rounded-xs">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase mb-1.5">
            <span>Активная мощность</span>
            <Cpu className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-1.5 leading-none">
            <span className="text-2xl font-bold font-mono font-mono-telemetry text-white">
              {telemetry.power}
            </span>
            <span className="text-xs font-mono text-slate-400 font-medium">кВт</span>
          </div>
          <div className="w-full bg-[#17202c] h-1.5 rounded-xs overflow-hidden mt-2.5">
            <div 
              className="bg-sky-400 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (telemetry.power / 1000) * 100)}%` }}
            />
          </div>
          <div className="mt-2 text-[10px] font-mono text-slate-400 flex justify-between">
            <span>Предел: 1000 кВт</span>
            <span className="text-emerald-400 font-semibold">НОРМА</span>
          </div>
        </div>

        {/* 7. Inverter Temp */}
        <div className={`p-3.5 industrial-card rounded-xs ${
          telemetry.inverterTemp >= 85 ? 'border-amber-500 bg-amber-950/30' : ''
        }`}>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase mb-1.5">
            <span>Температура IGBT</span>
            <Thermometer className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-1.5 leading-none">
            <span className={`text-2xl font-bold font-mono font-mono-telemetry ${
              telemetry.inverterTemp >= 85 ? 'text-amber-400 font-extrabold' : 'text-white'
            }`}>
              {telemetry.inverterTemp.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-400 font-medium">°C</span>
          </div>
          <div className="w-full bg-[#17202c] h-1.5 rounded-xs overflow-hidden mt-2.5">
            <div 
              className={`h-full transition-all duration-300 ${
                telemetry.inverterTemp >= 85 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${tempPercent}%` }}
            />
          </div>
          <div className="mt-2 text-[10px] font-mono text-slate-400 flex justify-between">
            <span>Порог: {activeParams.maxTemp} °C</span>
            <span className={telemetry.inverterTemp >= 85 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-semibold'}>
              {telemetry.inverterTemp >= 85 ? 'ПРЕДУПРЕЖДЕНИЕ' : 'НОРМА'}
            </span>
          </div>
        </div>

        {/* 8. Cooling Temp */}
        <div className="p-3.5 industrial-card rounded-xs">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase mb-1.5">
            <span>Хладагент (обратка)</span>
            <Thermometer className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-1.5 leading-none">
            <span className="text-2xl font-bold font-mono font-mono-telemetry text-cyan-400">
              {telemetry.coolingTemp.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-400 font-medium">°C</span>
          </div>
          <div className="w-full bg-[#17202c] h-1.5 rounded-xs overflow-hidden mt-2.5">
            <div 
              className="bg-cyan-400 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (telemetry.coolingTemp / 60) * 100)}%` }}
            />
          </div>
          <div className="mt-2 text-[10px] font-mono text-slate-400 flex justify-between">
            <span>Давл.: {telemetry.coolingPressure} МПа</span>
            <span className="text-emerald-400 font-semibold">НОРМА</span>
          </div>
        </div>

        {/* 9. Load % */}
        <div className="p-3.5 industrial-card rounded-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase mb-1.5">
            <span>Нагрузка на валу</span>
            <Layers className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-1.5 leading-none">
            <span className="text-2xl font-bold font-mono font-mono-telemetry text-white">
              {telemetry.loadPercent}
            </span>
            <span className="text-xs font-mono text-slate-400 font-medium">%</span>
          </div>
          <div className="w-full bg-[#17202c] h-1.5 rounded-xs overflow-hidden mt-2.5">
            <div 
              className="bg-amber-400 h-full transition-all duration-300"
              style={{ width: `${loadPercent}%` }}
            />
          </div>
          <div className="mt-2 text-[10px] font-mono text-slate-400 flex justify-between">
            <span>Задано: {activeParams.loadPercent}%</span>
            <span className="text-emerald-400 font-semibold">НОРМА</span>
          </div>
        </div>
      </div>

      {/* Interactive Telemetry Chart (Recharts) */}
      <div className="industrial-card p-4 rounded-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-2.5 border-b border-[#202834]">
          {/* Channel Selectors */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono text-slate-400 uppercase mr-1 font-semibold">КАНАЛ:</span>
            {[
              { id: 'rpm', label: 'Обороты (об/мин)' },
              { id: 'current', label: 'Ток (А)' },
              { id: 'torque', label: 'Момент (Н·м)' },
              { id: 'inverterTemp', label: 'Температура (°C)' },
              { id: 'all', label: 'Совмещённый' }
            ].map(ch => (
              <button
                key={ch.id}
                onClick={() => setActiveChartChannel(ch.id as any)}
                className={`px-3 py-1 text-xs font-mono rounded-xs border transition-[transform,background-color] duration-150 cursor-pointer enabled:active:scale-[0.96] ${
                  activeChartChannel === ch.id
                    ? 'border-cyan-500 bg-[#0d1f2d] text-cyan-300 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                    : 'border-[#202834] bg-[#0c1015] text-slate-400 hover:text-white'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>

          {/* Time Window Selectors */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase mr-1 font-semibold">ОКНО:</span>
            {[
              { sec: 30, label: '30с' },
              { sec: 60, label: '60с' },
              { sec: 180, label: '180с' },
              { sec: 0, label: 'Всё' }
            ].map(w => (
              <button
                key={w.sec}
                onClick={() => setChartTimeWindow(w.sec)}
                className={`px-2.5 py-1 text-xs font-mono rounded-xs border transition-[transform,background-color] duration-150 cursor-pointer enabled:active:scale-[0.96] ${
                  chartTimeWindow === w.sec
                    ? 'border-cyan-500 bg-cyan-950/50 text-cyan-300 font-bold shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                    : 'border-[#202834] bg-[#0c1015] text-slate-400 hover:text-white'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart View */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredHistory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRpm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorTorque" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="2 2" stroke="#1c2430" vertical={false} />
              <XAxis dataKey="timeSec" stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 10 }} tickFormatter={v => `${v}с`} />
              <YAxis stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '2px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }} />

              {/* Threshold reference lines */}
              {activeChartChannel === 'inverterTemp' && (
                <>
                  <ReferenceLine y={85} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Предупреждение 85°C', fill: '#f59e0b', fontSize: 10 }} />
                  <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Аварийный предел 90°C', fill: '#ef4444', fontSize: 10 }} />
                </>
              )}

              {/* Metric curves */}
              {(activeChartChannel === 'rpm' || activeChartChannel === 'all') && (
                <Area type="monotone" dataKey="rpm" name="Обороты (об/мин)" stroke="#10b981" fillOpacity={1} fill="url(#colorRpm)" strokeWidth={2} isAnimationActive={false} />
              )}
              {(activeChartChannel === 'current' || activeChartChannel === 'all') && (
                <Area type="monotone" dataKey="current" name="Ток (А)" stroke="#38bdf8" fillOpacity={1} fill="url(#colorCurrent)" strokeWidth={2} isAnimationActive={false} />
              )}
              {(activeChartChannel === 'torque' || activeChartChannel === 'all') && (
                <Area type="monotone" dataKey="torque" name="Момент (Н·м)" stroke="#f59e0b" fillOpacity={1} fill="url(#colorTorque)" strokeWidth={2} isAnimationActive={false} />
              )}
              {(activeChartChannel === 'inverterTemp' || activeChartChannel === 'all') && (
                <Area type="monotone" dataKey="inverterTemp" name="Температура (°C)" stroke="#ef4444" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={2} isAnimationActive={false} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Modals: Stop Confirmation & Emergency Stop */}
      {showStopModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs overscroll-contain">
          <div className="bg-[#11161d] border border-[#2d3748] rounded-xs max-w-md w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Остановка испытания</h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Вы уверены, что хотите штатно завершить выполнение программы испытаний? Текущие результаты будут зафиксированы как досрочно прерванные.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowStopModal(false)}
                className="px-4 py-1.5 bg-[#1b232e] hover:bg-[#242f3d] text-slate-300 text-xs rounded-xs cursor-pointer enabled:active:scale-[0.96]"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  setShowStopModal(false);
                  stopTest();
                }}
                className="px-4 py-1.5 bg-red-800 hover:bg-red-700 text-white text-xs font-semibold rounded-xs cursor-pointer enabled:active:scale-[0.96]"
              >
                Подтвердить остановку
              </button>
            </div>
          </div>
        </div>
      )}

      {showEStopModal && (
        <div className="fixed inset-0 z-50 bg-red-950/80 flex items-center justify-center p-4 backdrop-blur-sm overscroll-contain">
          <div className="bg-[#14080a] border-2 border-red-500 rounded-xs max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3 text-red-400">
              <ShieldAlert className="w-8 h-8" />
              <h3 className="text-lg font-bold uppercase tracking-wider text-white">
                Аварийное отключение стенда
              </h3>
            </div>
            <p className="text-xs text-red-200 mb-4 leading-relaxed">
              Внимание: Нажатие приведёт к немедленному снятию управляющих импульсов ШИМ инвертора, отключению высоковольтного выключателя ячейки 6 кВ и наложению пневматического тормоза стендового валопровода.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEStopModal(false)}
                className="px-4 py-2 bg-[#251214] hover:bg-[#341b1e] border border-red-800 text-slate-200 text-xs rounded-xs cursor-pointer enabled:active:scale-[0.96]"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  setShowEStopModal(false);
                  triggerEmergencyStop('Аварийный останов оператором (кнопка E-STOP на HMI)');
                }}
                className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-xs cursor-pointer shadow-lg enabled:active:scale-[0.96]"
              >
                ПОДТВЕРДИТЬ E-STOP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
