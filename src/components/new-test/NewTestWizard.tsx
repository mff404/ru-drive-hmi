import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Play, 
  Settings2, 
  ShieldCheck, 
  FileCheck,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useBench } from '../../context/BenchContext';
import { TEST_METHODOLOGIES } from '../../mock/defaultData';
import { TestMethodology, TestParameters } from '../../types';

export const NewTestWizard: React.FC = () => {
  const { 
    activeObject, 
    activeMethodology, 
    setActiveMethodology, 
    activeParams, 
    startTest, 
    testId,
    setActiveTab
  } = useBench();

  const [step, setStep] = useState<number>(1);
  const [params, setParams] = useState<TestParameters>({ ...activeParams });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Checklist states
  const [checklist, setChecklist] = useState({
    benchChecked: true,
    vfdConnected: true,
    sensorsActive: true,
    inverterReady: true,
    coolingReady: true,
    safetyReady: true,
    paramsValidated: true
  });
  const [simulatedFailure, setSimulatedFailure] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Method selection handler
  const handleSelectMethodology = (m: TestMethodology) => {
    setActiveMethodology(m);
    setParams({ ...m.recommendedParams });
  };

  // Validation
  const validateParams = (): boolean => {
    const errors: Record<string, string> = {};
    if (params.frequency < 0.1 || params.frequency > 100) {
      errors.frequency = 'Частота должна быть в диапазоне 0.1 – 100.0 Гц';
    }
    if (params.targetRpm < 0 || params.targetRpm > 3000) {
      errors.targetRpm = 'Обороты должны быть в диапазоне 0 – 3000 об/мин';
    }
    if (params.loadPercent < 0 || params.loadPercent > 150) {
      errors.loadPercent = 'Нагрузка должна быть в диапазоне 0 – 150 %';
    }
    if (params.durationSec < 10 || params.durationSec > 3600) {
      errors.durationSec = 'Длительность должна быть от 10 до 3600 с';
    }
    if (params.maxTemp < 40 || params.maxTemp > 120) {
      errors.maxTemp = 'Температурный предел от 40 до 120 °C';
    }
    if (params.maxCurrent < 10 || params.maxCurrent > 800) {
      errors.maxCurrent = 'Допустимый ток от 10 до 800 А';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 3) {
      if (!validateParams()) return;
    }
    setStep(prev => Math.min(4, prev + 1));
  };

  const toggleSimulatedFailure = (fail: boolean) => {
    setSimulatedFailure(fail);
    setChecklist(prev => ({
      ...prev,
      coolingReady: !fail
    }));
  };

  const isReadyToLaunch = Object.values(checklist).every(v => v);

  return (
    <div className="min-h-full flex flex-col p-4 pb-12 max-w-[1200px] mx-auto select-none">
      {/* Wizard Header & Stepper */}
      <div className="bg-[#10141a] border border-[#232b36] p-4 rounded-xs mb-3 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">
              Мастер подготовки и запуска испытания ВЧРП
            </h1>
            <p className="text-xs text-slate-400">
              Идентификатор конфигурации: <span className="text-slate-200 font-mono">{testId}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[11px] font-mono text-amber-300/90 bg-[#161d26] px-3 py-1 border border-amber-500/30 rounded-xs">
              ⚠ Внимание: параметры являются демонстрационными
            </div>
            {/* Quick Next Button on Top */}
            {step < 4 ? (
              <button
                onClick={handleNextStep}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all"
              >
                <span>Далее</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={!isReadyToLaunch}
                className={`px-4 py-1.5 font-bold text-xs rounded-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  isReadyToLaunch
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Пуск</span>
              </button>
            )}
          </div>
        </div>

        {/* Stepper Tabs - Always clickable */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { num: 1, label: '1. Объект' },
            { num: 2, label: '2. Методика' },
            { num: 3, label: '3. Параметры' },
            { num: 4, label: '4. Проверка пуска' }
          ].map(s => (
            <button
              key={s.num}
              onClick={() => {
                if (step === 3 && s.num > 3) {
                  if (!validateParams()) return;
                }
                setStep(s.num);
              }}
              className={`p-2.5 border rounded-xs text-xs flex items-center justify-between transition-colors cursor-pointer text-left ${
                step === s.num
                  ? 'border-cyan-500 bg-[#0d1c28] text-white font-bold ring-1 ring-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                  : 'border-[#232b36] bg-[#0c1015] hover:bg-[#141b24] text-slate-300'
              }`}
            >
              <span>{s.label}</span>
              {step > s.num ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <span className="text-[10px] font-mono text-slate-500">Шаг {s.num}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Step Content Container */}
      <div className="flex-1 space-y-4">

      {/* STEP 1: Object Selection */}
      {step === 1 && (
        <div className="bg-[#10141a] border border-[#232b36] p-5 rounded-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#232b36] pb-3">
            <Settings2 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Шаг 1. Данные испытываемого объекта</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Модель ВЧРП:</label>
              <input
                type="text"
                disabled
                value={activeObject.model}
                className="w-full bg-[#0b0e12] border border-[#232b36] p-2 text-xs font-mono text-slate-200 rounded-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Заводской серийный номер:</label>
              <input
                type="text"
                disabled
                value={activeObject.serialNumber}
                className="w-full bg-[#0b0e12] border border-[#232b36] p-2 text-xs font-mono text-emerald-400 font-bold rounded-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Версия прикладного ПО:</label>
              <input
                type="text"
                disabled
                value={activeObject.softwareVersion}
                className="w-full bg-[#0b0e12] border border-[#232b36] p-2 text-xs font-mono text-slate-200 rounded-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Прошивка DSP / FPGA:</label>
              <input
                type="text"
                disabled
                value={activeObject.firmwareVersion}
                className="w-full bg-[#0b0e12] border border-[#232b36] p-2 text-xs font-mono text-slate-200 rounded-xs"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs text-slate-400">Алгоритм управления приводом:</label>
              <input
                type="text"
                disabled
                value={activeObject.controlAlgorithm}
                className="w-full bg-[#0b0e12] border border-[#232b36] p-2 text-xs font-mono text-slate-200 rounded-xs"
              />
            </div>
          </div>

          <div className="p-3 bg-[#0c1015] border border-[#1e2632] rounded-xs text-xs text-slate-400 flex items-center justify-between">
            <span>Паспортная мощность: <strong className="text-white">{activeObject.ratedPowerKw} кВт</strong></span>
            <span>Номинальное напряжение: <strong className="text-white">{activeObject.ratedVoltageKv} кВ</strong></span>
            <span>Номинальный ток: <strong className="text-white">{activeObject.ratedCurrentA} А</strong></span>
          </div>
        </div>
      )}

      {/* STEP 2: Methodology Selection */}
      {step === 2 && (
        <div className="bg-[#10141a] border border-[#232b36] p-5 rounded-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#232b36] pb-3">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Шаг 2. Выбор методики испытания</h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {TEST_METHODOLOGIES.map(m => {
              const isSelected = activeMethodology.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => handleSelectMethodology(m)}
                  className={`p-3.5 border rounded-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'border-cyan-500 bg-[#0c1824] ring-1 ring-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                      : 'border-[#232b36] bg-[#0c1015] hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 rounded-xs">
                        {m.code}
                      </span>
                      <span className="font-bold text-sm text-white">{m.title}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{m.category}</span>
                  </div>

                  <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                    {m.description}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#1c2430]">
                    <div className="text-[11px] text-slate-400 font-mono flex flex-wrap gap-2">
                      <span className="text-slate-500">Проверяемые параметры:</span>
                      {m.verifiedCharacteristics.slice(0, 3).map((c, i) => (
                        <span key={i} className="text-slate-300 bg-[#090d12] px-1.5 py-0.5 rounded-xs border border-[#1a2330]">
                          • {c}
                        </span>
                      ))}
                      {m.verifiedCharacteristics.length > 3 && (
                        <span className="text-slate-500">+{m.verifiedCharacteristics.length - 3} ещё</span>
                      )}
                    </div>

                    {isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextStep();
                        }}
                        className="self-end sm:self-auto px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all"
                      >
                        <span>Выбрать и далее</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: Parameters Configuration */}
      {step === 3 && (
        <div className="bg-[#10141a] border border-[#232b36] p-5 rounded-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#232b36] pb-3">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Шаг 3. Параметры испытательного режима</h2>
            </div>
            <button
              onClick={() => setParams({ ...activeMethodology.recommendedParams })}
              className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Сброс к рекомендациям методики
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Frequency */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 flex justify-between">
                <span>Заданная выходная частота</span>
                <span className="font-mono text-slate-400">[0.1 – 100.0 Гц]</span>
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  step="0.5"
                  value={params.frequency}
                  onChange={e => setParams({ ...params, frequency: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#0b0e12] border border-[#232b36] p-2 text-xs font-mono text-white rounded-l-xs focus:border-emerald-500 outline-none"
                />
                <span className="px-3 py-2 bg-[#171e27] border border-l-0 border-[#232b36] text-xs font-mono text-slate-400 rounded-r-xs">
                  Гц
                </span>
              </div>
              {validationErrors.frequency && <p className="text-[11px] text-red-400 font-mono">{validationErrors.frequency}</p>}
            </div>

            {/* Target RPM */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 flex justify-between">
                <span>Целевые обороты двигателя</span>
                <span className="font-mono text-slate-400">[0 – 3000 об/мин]</span>
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  step="50"
                  value={params.targetRpm}
                  onChange={e => setParams({ ...params, targetRpm: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#0b0e12] border border-[#232b36] p-2 text-xs font-mono text-white rounded-l-xs focus:border-emerald-500 outline-none"
                />
                <span className="px-3 py-2 bg-[#171e27] border border-l-0 border-[#232b36] text-xs font-mono text-slate-400 rounded-r-xs">
                  об/мин
                </span>
              </div>
              {validationErrors.targetRpm && <p className="text-[11px] text-red-400 font-mono">{validationErrors.targetRpm}</p>}
            </div>

            {/* Load Percent */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 flex justify-between">
                <span>Нагрузка на валу генератора</span>
                <span className="font-mono text-slate-400">[0 – 150 %]</span>
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  step="5"
                  value={params.loadPercent}
                  onChange={e => setParams({ ...params, loadPercent: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#0b0e12] border border-[#232b36] p-2 text-xs font-mono text-white rounded-l-xs focus:border-emerald-500 outline-none"
                />
                <span className="px-3 py-2 bg-[#171e27] border border-l-0 border-[#232b36] text-xs font-mono text-slate-400 rounded-r-xs">
                  %
                </span>
              </div>
              {validationErrors.loadPercent && <p className="text-[11px] text-red-400 font-mono">{validationErrors.loadPercent}</p>}
            </div>

            {/* Duration */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 flex justify-between">
                <span>Продолжительность испытания</span>
                <span className="font-mono text-slate-400">[10 – 3600 с]</span>
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  step="10"
                  value={params.durationSec}
                  onChange={e => setParams({ ...params, durationSec: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#0b0e12] border border-[#232b36] p-2 text-xs font-mono text-white rounded-l-xs focus:border-emerald-500 outline-none"
                />
                <span className="px-3 py-2 bg-[#171e27] border border-l-0 border-[#232b36] text-xs font-mono text-slate-400 rounded-r-xs">
                  с
                </span>
              </div>
              {validationErrors.durationSec && <p className="text-[11px] text-red-400 font-mono">{validationErrors.durationSec}</p>}
            </div>

            {/* Max Temp */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 flex justify-between">
                <span>Порог предупреждения температуры</span>
                <span className="font-mono text-slate-400">[40 – 120 °C]</span>
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  step="1"
                  value={params.maxTemp}
                  onChange={e => setParams({ ...params, maxTemp: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#0b0e12] border border-[#232b36] p-2 text-xs font-mono text-white rounded-l-xs focus:border-emerald-500 outline-none"
                />
                <span className="px-3 py-2 bg-[#171e27] border border-l-0 border-[#232b36] text-xs font-mono text-slate-400 rounded-r-xs">
                  °C
                </span>
              </div>
              {validationErrors.maxTemp && <p className="text-[11px] text-red-400 font-mono">{validationErrors.maxTemp}</p>}
            </div>

            {/* Max Current */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 flex justify-between">
                <span>Допустимый ток статора</span>
                <span className="font-mono text-slate-400">[10 – 800 А]</span>
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  step="10"
                  value={params.maxCurrent}
                  onChange={e => setParams({ ...params, maxCurrent: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#0b0e12] border border-[#232b36] p-2 text-xs font-mono text-white rounded-l-xs focus:border-emerald-500 outline-none"
                />
                <span className="px-3 py-2 bg-[#171e27] border border-l-0 border-[#232b36] text-xs font-mono text-slate-400 rounded-r-xs">
                  А
                </span>
              </div>
              {validationErrors.maxCurrent && <p className="text-[11px] text-red-400 font-mono">{validationErrors.maxCurrent}</p>}
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Pre-launch Verification & Safety Checklist */}
      {step === 4 && (
        <div className="bg-[#10141a] border border-[#232b36] p-5 rounded-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#232b36] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Шаг 4. Контрольный лист готовности к пуску</h2>
            </div>

            {/* Demo Simulation Toggle */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">Имитация сбоя готовности:</span>
              <button
                onClick={() => toggleSimulatedFailure(!simulatedFailure)}
                className={`px-2 py-0.5 rounded-xs border text-[11px] cursor-pointer transition-colors ${
                  simulatedFailure 
                    ? 'bg-red-950/70 border-red-500 text-red-300' 
                    : 'bg-[#151c24] border-[#2b3748] text-slate-400 hover:text-white'
                }`}
              >
                {simulatedFailure ? '● Контур охлаждения не готов' : '○ Все системы готовы'}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { key: 'benchChecked', title: 'Стенд проверен', desc: 'Агрегаты центрированы, датчики откалиброваны' },
              { key: 'vfdConnected', title: 'ВЧРП подключён', desc: 'Кабельные муфты 6 кВ затянуты, заземление надёжно' },
              { key: 'sensorsActive', title: 'Датчики доступны', desc: 'LEM, PT100, вибродатчики на связи, шумы в допуске' },
              { key: 'inverterReady', title: 'Инвертор готов', desc: 'Драйверы без ошибок десатурации, ШИМ в режиме ожидания' },
              { key: 'coolingReady', title: 'Охлаждение готово', desc: 'Давление 0.25 МПа, расход 48 л/мин, проток подтверждён' },
              { key: 'safetyReady', title: 'Защитные системы готовы', desc: 'Кнопки E-STOP взведены, ограждения заблокированы' },
              { key: 'paramsValidated', title: 'Методика и параметры проверены', desc: `${activeMethodology.code} (${params.targetRpm} об/мин, ${params.loadPercent}%)` }
            ].map(item => {
              const ok = (checklist as any)[item.key];
              return (
                <div
                  key={item.key}
                  className={`p-2.5 border rounded-xs flex items-center justify-between text-xs transition-colors ${
                    ok
                      ? 'border-[#1e2632] bg-[#0c1015]'
                      : 'border-red-500/80 bg-red-950/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {ok ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <div>
                      <div className={`font-semibold ${ok ? 'text-slate-200' : 'text-red-300'}`}>{item.title}</div>
                      <div className="text-[11px] text-slate-400">{item.desc}</div>
                    </div>
                  </div>

                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-xs border ${
                    ok 
                      ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-400' 
                      : 'border-red-500/60 bg-red-950/60 text-red-300'
                  }`}>
                    {ok ? 'ГОТОВ' : 'СБОЙ'}
                  </span>
                </div>
              );
            })}
          </div>

          {!isReadyToLaunch && (
            <div className="p-3 bg-red-950/50 border border-red-500/70 text-red-300 text-xs rounded-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <div>
                <div className="font-bold">Запуск заблокирован защитной системой</div>
                <div className="text-[11px] mt-0.5 text-red-200">
                  Обнаружено несоответствие давления в контуре охлаждения. Устраните неисправность насосной группы перед подачей силового напряжения.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </div>

      {/* Sticky Bottom Navigation Bar (Always Visible) */}
      <div className="sticky bottom-0 z-20 py-3 mt-4 border border-[#202834] flex items-center justify-between bg-[#0e1218]/95 backdrop-blur-md px-4 rounded-xs shadow-2xl">
        {step > 1 ? (
          <button
            onClick={() => setStep(prev => prev - 1)}
            className="px-4 py-2 bg-[#151c24] hover:bg-[#1a232f] border border-[#2c3746] text-slate-300 text-xs font-semibold rounded-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Назад</span>
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('overview')}
            className="px-4 py-2 bg-[#151c24] hover:bg-[#1a232f] border border-[#2c3746] text-slate-400 text-xs rounded-xs cursor-pointer hover:text-white"
          >
            К обзору стенда
          </button>
        )}

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Шаг {step} из 4</span>
        </div>

        {step < 4 ? (
          <button
            onClick={handleNextStep}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xs flex items-center gap-2 cursor-pointer transition-colors shadow-[0_0_12px_rgba(6,182,212,0.35)]"
          >
            <span>Далее</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={!isReadyToLaunch}
            className={`px-6 py-2.5 font-bold text-xs rounded-xs flex items-center gap-2 uppercase tracking-wider transition-all cursor-pointer ${
              isReadyToLaunch
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Начать испытание</span>
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#11161d] border border-cyan-500/50 rounded-xs max-w-lg w-full p-5 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <div className="flex items-center gap-2.5 mb-3 border-b border-[#232b36] pb-3">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Подтверждение запуска испытания</h3>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Вы собираетесь подать сигнал запуска на преобразователь частоты и начать выполнение программы испытаний. Убедитесь в отсутствии людей в опасной зоне стенда.
            </p>

            <div className="bg-[#0b0e12] border border-[#1e2632] p-3 rounded-xs text-xs font-mono space-y-1.5 mb-5">
              <div className="flex justify-between">
                <span className="text-slate-400">Объект:</span>
                <span className="text-slate-200 font-bold">{activeObject.model} ({activeObject.serialNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Методика:</span>
                <span className="text-cyan-400 font-semibold">{activeMethodology.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Обороты / Частота:</span>
                <span className="text-white">{params.targetRpm} об/мин / {params.frequency} Гц</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Нагрузка:</span>
                <span className="text-white">{params.loadPercent} %</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Продолжительность:</span>
                <span className="text-white">{params.durationSec} с</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-[#1b232e] hover:bg-[#242f3d] text-slate-300 text-xs font-semibold rounded-xs cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  startTest(params);
                }}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-wider rounded-xs cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Подтвердить и запустить</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
