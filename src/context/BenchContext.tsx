import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  BenchStatus,
  BenchComponent,
  TestMethodology,
  TestObject,
  TestParameters,
  TelemetryPoint,
  BenchEvent,
  TestResultRecord,
  TestStage,
  SimulationScenario,
  TestFinalStatus
} from '../types';
import {
  INITIAL_COMPONENTS,
  INITIAL_TEST_OBJECT,
  TEST_METHODOLOGIES,
  INITIAL_EVENTS,
  HISTORIC_RESULTS
} from '../mock/defaultData';

export type TabType = 'overview' | 'new-test' | 'active-test' | 'logs' | 'results';

interface BenchContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  benchStatus: BenchStatus;
  components: BenchComponent[];
  activeObject: TestObject;
  setActiveObject: (obj: TestObject) => void;
  activeMethodology: TestMethodology;
  setActiveMethodology: (m: TestMethodology) => void;
  activeParams: TestParameters;
  setActiveParams: (p: TestParameters) => void;
  
  // Test execution state
  testId: string;
  isTestRunning: boolean;
  isTestPaused: boolean;
  testStage: TestStage;
  elapsedSec: number;
  progressPercent: number;
  
  // Simulation
  scenario: SimulationScenario;
  setScenario: (s: SimulationScenario) => void;
  telemetry: TelemetryPoint;
  telemetryHistory: TelemetryPoint[];
  events: BenchEvent[];
  
  // Actions
  startTest: (params?: TestParameters) => void;
  pauseTest: () => void;
  resumeTest: () => void;
  stopTest: () => void;
  triggerEmergencyStop: (reason?: string) => void;
  resetToIdle: () => void;
  runSelfTest: () => Promise<void>;
  isSelfTesting: boolean;
  selfTestProgress: number;
  
  // Events and Results
  acknowledgeEvent: (id: string) => void;
  results: TestResultRecord[];
  activeResultId: string;
  setActiveResultId: (id: string) => void;
  resetAlarm: () => void;
  alarmDetails: { message: string; timestamp: string; component: string } | null;

  // Stress-test data toggle (break-ui)
  isWorstCaseData: boolean;
  toggleWorstCaseData: () => void;
}

const BenchContext = createContext<BenchContextType | null>(null);

export const BenchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [components, setComponents] = useState<BenchComponent[]>(INITIAL_COMPONENTS);
  const [activeObject, setActiveObject] = useState<TestObject>(INITIAL_TEST_OBJECT);
  const [activeMethodology, setActiveMethodology] = useState<TestMethodology>(TEST_METHODOLOGIES[0]);
  const [activeParams, setActiveParams] = useState<TestParameters>(TEST_METHODOLOGIES[0].recommendedParams);
  
  const [testId, setTestId] = useState<string>('TST-2026-1015-08');
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  const [isTestPaused, setIsTestPaused] = useState<boolean>(false);
  const [testStage, setTestStage] = useState<TestStage>('readiness');
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  
  const [scenario, setScenario] = useState<SimulationScenario>('normal');
  const [events, setEvents] = useState<BenchEvent[]>(INITIAL_EVENTS);
  const [results, setResults] = useState<TestResultRecord[]>(HISTORIC_RESULTS);
  const [activeResultId, setActiveResultId] = useState<string>(HISTORIC_RESULTS[0].id);
  
  const [isSelfTesting, setIsSelfTesting] = useState<boolean>(false);
  const [selfTestProgress, setSelfTestProgress] = useState<number>(0);
  const [alarmDetails, setAlarmDetails] = useState<{ message: string; timestamp: string; component: string } | null>(null);
  const [isWorstCaseData, setIsWorstCaseData] = useState<boolean>(false);

  const toggleWorstCaseData = () => {
    setIsWorstCaseData(prev => {
      const next = !prev;
      if (next) {
        setActiveObject({
          ...INITIAL_TEST_OBJECT,
          model: 'RU-DRIVE MV-1000/6-УХЛ4-СЕЙСМО-ВЗРЫВОЗАЩИТА-EXD-IIB-T4-СЕВЕР-МОДИФИКАЦИЯ-СПЕЦЗАКАЗ-АРКТИКА-2026-X',
          serialNumber: 'RD-2026-MV-0492/EXTRA-LONG-SERIAL-SUFFIX-SPECIAL-BATCH-009',
          softwareVersion: 'v3.4.12-rc2-experimental-heavy-duty-patch-level-4',
          firmwareVersion: 'DSP-2.18.99-RC-BUILD-99421 / FPGA-1.04-HARDENED-CRYPTO',
          controlAlgorithm: 'FOC-Sensorless-v2.8 (Бездатчиковый векторный с адаптивным наблюдателем потока Luenberger)'
        });
      } else {
        setActiveObject(INITIAL_TEST_OBJECT);
      }
      return next;
    });
  };

  // Initial baseline telemetry
  const [telemetry, setTelemetry] = useState<TelemetryPoint>({
    timestamp: '00:00:00',
    timeSec: 0,
    rpm: 0,
    frequency: 0,
    current: 0,
    voltage: 0,
    torque: 0,
    power: 0,
    inverterTemp: 26.5,
    coolingTemp: 21.2,
    coolingPressure: 0.25,
    loadPercent: 0,
    sensorsValid: { rpm: true, current: true, voltage: true, torque: true, temp: true }
  });

  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>([]);
  const simTimerRef = useRef<any>(null);

  // Calculate overall bench status
  const benchStatus: BenchStatus = alarmDetails 
    ? 'alarm' 
    : isTestRunning 
      ? (scenario === 'temp_warning' ? 'warning' : 'running') 
      : 'ready';

  const addEvent = (event: Omit<BenchEvent, 'id'>) => {
    const newEv: BenchEvent = {
      ...event,
      id: `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    setEvents(prev => [newEv, ...prev]);
  };

  // Self-test execution
  const runSelfTest = async () => {
    setIsSelfTesting(true);
    setSelfTestProgress(0);
    addEvent({
      timestamp: new Date().toLocaleTimeString('ru-RU'),
      level: 'system',
      component: 'Стендовый комплекс',
      event: 'Инициация полной самодиагностики подсистем стенда',
      status: 'resolved'
    });

    for (let step = 1; step <= 8; step++) {
      await new Promise(r => setTimeout(r, 350));
      setSelfTestProgress(Math.round((step / 8) * 100));
      setComponents(prev => prev.map((c, idx) => {
        if (idx === step - 1) {
          return { ...c, status: 'normal', lastChecked: new Date().toLocaleTimeString('ru-RU') };
        }
        return c;
      }));
    }

    setIsSelfTesting(false);
    addEvent({
      timestamp: new Date().toLocaleTimeString('ru-RU'),
      level: 'info',
      component: 'Стендовый комплекс',
      event: 'Самодиагностика завершена успешно. Все 8 подсистем готовы к пуску.',
      status: 'resolved'
    });
  };

  // Start test
  const startTest = (params?: TestParameters) => {
    const finalParams = params || activeParams;
    setActiveParams(finalParams);
    const newTestId = `TST-2026-1015-${Math.floor(Math.random() * 90 + 10)}`;
    setTestId(newTestId);
    setElapsedSec(0);
    setProgressPercent(0);
    setTestStage('readiness');
    setIsTestRunning(true);
    setIsTestPaused(false);
    setAlarmDetails(null);
    setTelemetryHistory([]);
    setActiveTab('active-test');

    addEvent({
      timestamp: new Date().toLocaleTimeString('ru-RU'),
      level: 'info',
      component: 'СУ Стенда',
      event: `Запуск испытания ${newTestId} (${activeMethodology.title})`,
      status: 'resolved'
    });
  };

  const pauseTest = () => {
    setIsTestPaused(true);
    addEvent({
      timestamp: new Date().toLocaleTimeString('ru-RU'),
      level: 'warning',
      component: 'Оператор',
      event: 'Испытание приостановлено оператором',
      status: 'acknowledged'
    });
  };

  const resumeTest = () => {
    setIsTestPaused(false);
    addEvent({
      timestamp: new Date().toLocaleTimeString('ru-RU'),
      level: 'info',
      component: 'Оператор',
      event: 'Испытание возобновлено оператором',
      status: 'resolved'
    });
  };

  const stopTest = () => {
    setIsTestRunning(false);
    setIsTestPaused(false);
    finalizeTest('aborted', 'Испытание прервано оператором досрочно.');
  };

  const triggerEmergencyStop = (reason = 'Аварийный останов оператором (кнопка E-STOP)') => {
    setIsTestRunning(false);
    setIsTestPaused(false);
    const timeStr = new Date().toLocaleTimeString('ru-RU');
    setAlarmDetails({
      message: reason,
      timestamp: timeStr,
      component: 'Кнопка Аварийного Останова E-STOP'
    });
    addEvent({
      timestamp: timeStr,
      level: 'alarm',
      component: 'Аварийная защита',
      event: `АВАРИЙНЫЙ ОСТАНОВ: ${reason}`,
      status: 'new',
      recommendation: 'Осмотреть силовую часть, убедиться в отсутствии напряжения на шине DC перед сбросом.'
    });
    finalizeTest('alarm', `Аварийное прерывание: ${reason}`);
  };

  const resetAlarm = () => {
    setAlarmDetails(null);
    setScenario('normal');
    addEvent({
      timestamp: new Date().toLocaleTimeString('ru-RU'),
      level: 'system',
      component: 'Оператор',
      event: 'Квитирование и сброс аварийного состояния стенда подтверждены оператором',
      status: 'resolved'
    });
  };

  const resetToIdle = () => {
    setIsTestRunning(false);
    setIsTestPaused(false);
    setAlarmDetails(null);
    setElapsedSec(0);
    setProgressPercent(0);
    setScenario('normal');
    setTelemetry({
      timestamp: '00:00:00',
      timeSec: 0,
      rpm: 0,
      frequency: 0,
      current: 0,
      voltage: 0,
      torque: 0,
      power: 0,
      inverterTemp: 28.0,
      coolingTemp: 21.0,
      coolingPressure: 0.25,
      loadPercent: 0,
      sensorsValid: { rpm: true, current: true, voltage: true, torque: true, temp: true }
    });
  };

  const finalizeTest = (status: TestFinalStatus, comment: string) => {
    const isSuccess = status === 'success';
    const newRecord: TestResultRecord = {
      id: `res-${Date.now()}`,
      testId,
      date: new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      durationSec: elapsedSec,
      object: activeObject,
      methodology: activeMethodology,
      parameters: activeParams,
      finalStatus: status,
      statusComment: comment,
      verdict: isSuccess 
        ? `ВЧРП ${activeObject.model} успешно выдержал испытания по методике ${activeMethodology.code}`
        : `Испытание завершено со статусом: ${status.toUpperCase()}. Требуется инженерный анализ.`,
      peakRpm: Math.round(telemetry.rpm || activeParams.targetRpm),
      peakCurrent: Math.round((telemetry.current || activeParams.maxCurrent * 0.8) * 10) / 10,
      peakInverterTemp: Math.round(telemetry.inverterTemp * 10) / 10,
      averagePower: Math.round(telemetry.power),
      characteristics: activeMethodology.verifiedCharacteristics.map((c, i) => ({
        name: c,
        normative: 'По ГОСТ/ТУ',
        measured: isSuccess ? 'Соответствует' : (i === 1 ? 'Отклонение' : 'В допуске'),
        unit: 'усл.',
        tolerance: 'ГОСТ',
        passed: isSuccess || i !== 1
      })),
      deviations: isSuccess ? [] : [comment],
      telemetryHistory: [...telemetryHistory],
      events: events.slice(0, 10),
      operatorName: 'Смирнов А. В. (Инженер-испытатель)',
      leadEngineer: 'Ковалёв Д. М. (Ведущий разработчик привода)'
    };

    setResults(prev => [newRecord, ...prev]);
    setActiveResultId(newRecord.id);
  };

  const acknowledgeEvent = (id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'acknowledged' } : e));
  };

  // Main simulation tick loop
  useEffect(() => {
    if (!isTestRunning || isTestPaused) {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
      return;
    }

    simTimerRef.current = setInterval(() => {
      setElapsedSec(prevSec => {
        const nextSec = prevSec + 1;
        const totalDuration = activeParams.durationSec;
        const progress = Math.min(100, Math.round((nextSec / totalDuration) * 100));
        setProgressPercent(progress);

        // Stage progression calculation
        let stage: TestStage = 'readiness';
        if (progress < 10) {
          stage = 'readiness';
        } else if (progress < 30) {
          stage = 'ramp_up';
        } else if (progress < 50) {
          stage = 'stabilization';
        } else if (progress < 90) {
          stage = 'load_test';
        } else {
          stage = 'completion';
        }
        setTestStage(stage);

        // Simulation parameters calculation
        const targetRpm = activeParams.targetRpm;
        const targetFreq = activeParams.frequency;
        const targetLoad = activeParams.loadPercent;

        let curRpm = 0;
        let curFreq = 0;
        let curLoad = 0;
        let curCurrent = 0;
        let curTorque = 0;
        let curPower = 0;
        let curInvTemp = 32.0;

        if (stage === 'readiness') {
          curRpm = 0;
          curFreq = 0;
          curLoad = 0;
          curCurrent = 8.5; // ток намагничивания при предпуске
          curTorque = 0;
          curPower = 3.2;
          curInvTemp = 32.0 + nextSec * 0.1;
        } else if (stage === 'ramp_up') {
          const ratio = (progress - 10) / 20;
          curRpm = Math.round(targetRpm * ratio);
          curFreq = Number((targetFreq * ratio).toFixed(1));
          curLoad = Math.round(targetLoad * 0.15 * ratio);
          curCurrent = Number((40 + ratio * 45).toFixed(1));
          curTorque = Math.round(450 * ratio);
          curPower = Math.round((curTorque * curRpm) / 9550);
          curInvTemp = 35.0 + nextSec * 0.25;
        } else if (stage === 'stabilization') {
          curRpm = targetRpm + Math.floor(Math.sin(nextSec) * 3);
          curFreq = targetFreq;
          curLoad = Math.round(targetLoad * 0.25);
          curCurrent = Number((72 + Math.sin(nextSec * 2) * 2).toFixed(1));
          curTorque = 1200 + Math.floor(Math.cos(nextSec) * 25);
          curPower = Math.round((curTorque * curRpm) / 9550);
          curInvTemp = 44.0 + nextSec * 0.2;
        } else if (stage === 'load_test') {
          curRpm = targetRpm - 4 + Math.floor(Math.sin(nextSec) * 5);
          curFreq = targetFreq;
          curLoad = targetLoad;
          curCurrent = Number((105 + Math.sin(nextSec) * 3.5).toFixed(1));
          curTorque = Math.round(5200 * (targetLoad / 100));
          curPower = Math.round((curTorque * curRpm) / 9550);
          curInvTemp = 58.0 + (nextSec - 25) * 0.35;
        } else {
          // Completion
          const ratio = Math.max(0, 1 - (progress - 90) / 10);
          curRpm = Math.round(targetRpm * ratio);
          curFreq = Number((targetFreq * ratio).toFixed(1));
          curLoad = 0;
          curCurrent = Number((20 * ratio).toFixed(1));
          curTorque = Math.round(300 * ratio);
          curPower = Math.round((curTorque * curRpm) / 9550);
          curInvTemp = 68.0 - (nextSec - 50) * 0.2;
        }

        // Scenario modifications
        let sensorsValid = { rpm: true, current: true, voltage: true, torque: true, temp: true };

        if (scenario === 'temp_warning') {
          // Inverter temp exceeds 85°C warning limit (reaches 87.4°C)
          curInvTemp = Math.min(88.2, 70.0 + nextSec * 0.35);
          if (curInvTemp >= 85.0 && !events.some(e => e.event.includes('85°C'))) {
            addEvent({
              timestamp: new Date().toLocaleTimeString('ru-RU'),
              level: 'warning',
              component: 'Инвертор IGBT',
              event: `Превышение порога предупреждения температуры охладителя IGBT (${curInvTemp.toFixed(1)} °C > 85.0 °C)`,
              value: `${curInvTemp.toFixed(1)} °C`,
              threshold: '85.0 °C',
              status: 'new',
              recommendation: 'Проверить расход хладагента в контуре охлаждения стойки А2. При приближении к 90°C сбросить нагрузку.',
              relatedMetric: 'inverterTemp',
              relatedTimeSec: nextSec
            });
          }
        } else if (scenario === 'sensor_loss') {
          // Sensor loss simulation: Current sensor lost
          sensorsValid.current = false;
          if (!events.some(e => e.event.includes('Потеря сигнала'))) {
            addEvent({
              timestamp: new Date().toLocaleTimeString('ru-RU'),
              level: 'warning',
              component: 'Датчик LEM фазы B',
              event: 'Потеря аналогового сигнала датчика тока фазы B (Шлейф 4-20 мА разомкнут)',
              value: 'НЕДОСТОВЕРНО',
              threshold: 'ERR_OPEN_LOOP',
              status: 'new',
              recommendation: 'Проверить целостность кабельной трассы к измерительному трансформатору LEM фазы B.',
              relatedMetric: 'current',
              relatedTimeSec: nextSec
            });
          }
        } else if (scenario === 'critical_trip') {
          // Critical alarm simulation
          if (nextSec >= 12 && !alarmDetails) {
            triggerEmergencyStop('Аппаратная защита: Сверхток звена инвертора (десатурация ключа IGBT фазы W, I > 240 А)');
            return nextSec;
          }
        }

        // 3-phase currents according to GOST/PUE (A, B, C)
        const currentPhaseA = Number((curCurrent * 0.995).toFixed(1));
        const currentPhaseB = sensorsValid.current ? Number((curCurrent * 1.006).toFixed(1)) : null;
        const currentPhaseC = Number((curCurrent * 0.999).toFixed(1));

        const point: TelemetryPoint = {
          timestamp: new Date().toLocaleTimeString('ru-RU'),
          timeSec: nextSec,
          rpm: sensorsValid.rpm ? curRpm : null,
          frequency: curFreq,
          current: sensorsValid.current ? curCurrent : null,
          currentPhaseA,
          currentPhaseB,
          currentPhaseC,
          voltage: curFreq > 5 ? 6000 : Math.round(curFreq * 120),
          torque: curTorque,
          power: curPower,
          inverterTemp: Number(curInvTemp.toFixed(1)),
          coolingTemp: Number((22.0 + curInvTemp * 0.15).toFixed(1)),
          coolingPressure: 0.25,
          loadPercent: curLoad,
          sensorsValid
        };

        setTelemetry(point);
        setTelemetryHistory(prev => [...prev.slice(-180), point]);

        // Auto finish when duration reached
        if (nextSec >= totalDuration) {
          setIsTestRunning(false);
          addEvent({
            timestamp: new Date().toLocaleTimeString('ru-RU'),
            level: 'info',
            component: 'СУ Стенда',
            event: `Испытание ${testId} успешно завершено в полном объёме`,
            status: 'resolved'
          });
          finalizeTest('success', 'Все этапы методики пройдены штатно. Данные сохранены в архив протоколов.');
          setActiveTab('results');
        }

        return nextSec;
      });
    }, 1000);

    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, [isTestRunning, isTestPaused, activeParams, scenario, testId]);

  return (
    <BenchContext.Provider
      value={{
        activeTab,
        setActiveTab,
        benchStatus,
        components,
        activeObject,
        setActiveObject,
        activeMethodology,
        setActiveMethodology,
        activeParams,
        setActiveParams,
        testId,
        isTestRunning,
        isTestPaused,
        testStage,
        elapsedSec,
        progressPercent,
        scenario,
        setScenario,
        telemetry,
        telemetryHistory,
        events,
        startTest,
        pauseTest,
        resumeTest,
        stopTest,
        triggerEmergencyStop,
        resetToIdle,
        runSelfTest,
        isSelfTesting,
        selfTestProgress,
        acknowledgeEvent,
        results,
        activeResultId,
        setActiveResultId,
        resetAlarm,
        alarmDetails,
        isWorstCaseData,
        toggleWorstCaseData
      }}
    >
      {children}
    </BenchContext.Provider>
  );
};

export const useBench = () => {
  const ctx = useContext(BenchContext);
  if (!ctx) throw new Error('useBench must be used within a BenchProvider');
  return ctx;
};
