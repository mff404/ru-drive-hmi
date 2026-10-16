export type BenchStatus = 'ready' | 'running' | 'warning' | 'alarm' | 'maintenance';

export type ComponentStatus = 'normal' | 'warning' | 'error' | 'untested';

export interface BenchComponent {
  id: string;
  name: string;
  role: string;
  status: ComponentStatus;
  healthPercent: number;
  temperature?: number;
  pressure?: number;
  details: string;
  lastChecked: string;
  parameters: {
    label: string;
    value: string;
    status: 'ok' | 'warn' | 'crit';
  }[];
  errorMessage?: string;
  recommendedAction?: string;
}

export type TestStage = 
  | 'readiness'     // 1. Проверка готовности
  | 'ramp_up'       // 2. Разгон
  | 'stabilization' // 3. Выход на режим
  | 'load_test'     // 4. Испытание под нагрузкой
  | 'completion';   // 5. Завершение

export interface TestMethodology {
  id: string;
  title: string;
  code: string;
  description: string;
  category: string;
  standards: string;
  defaultDurationSec: number;
  verifiedCharacteristics: string[];
  recommendedParams: {
    frequency: number;
    targetRpm: number;
    loadPercent: number;
    durationSec: number;
    maxTemp: number;
    maxCurrent: number;
  };
}

export interface TestObject {
  model: string;
  serialNumber: string;
  ratedPowerKw: number;
  ratedVoltageKv: number;
  ratedCurrentA: number;
  softwareVersion: string;
  firmwareVersion: string;
  controlAlgorithm: string;
  manufactureDate: string;
}

export interface TestParameters {
  frequency: number;      // Гц (0.1 - 100)
  targetRpm: number;      // об/мин (0 - 3000)
  loadPercent: number;    // % (0 - 150)
  durationSec: number;    // с (10 - 3600)
  maxTemp: number;        // °C (40 - 120)
  maxCurrent: number;     // А (10 - 800)
}

export interface TelemetryPoint {
  timestamp: string;      // HH:mm:ss
  timeSec: number;        // Секунды от старта
  rpm: number | null;     // об/мин
  frequency: number;      // Гц
  current: number | null; // А (среднеквадратичный)
  currentPhaseA?: number | null; // Фаза A (Жёлтый по ПУЭ)
  currentPhaseB?: number | null; // Фаза B (Зелёный по ПУЭ)
  currentPhaseC?: number | null; // Фаза C (Красный по ПУЭ)
  voltage: number;        // В
  torque: number;         // Н·м
  power: number;          // кВт
  inverterTemp: number;   // °C
  coolingTemp: number;    // °C
  coolingPressure: number;// МПа
  loadPercent: number;    // %
  // Флаги валидности датчиков
  sensorsValid: {
    rpm: boolean;
    current: boolean;
    voltage: boolean;
    torque: boolean;
    temp: boolean;
  };
}

export type EventLevel = 'info' | 'warning' | 'alarm' | 'system';
export type EventStatus = 'new' | 'acknowledged' | 'resolved';

export interface BenchEvent {
  id: string;
  timestamp: string;
  level: EventLevel;
  component: string;
  event: string;
  value?: string;
  threshold?: string;
  status: EventStatus;
  recommendation?: string;
  relatedMetric?: string;
  relatedTimeSec?: number;
}

export type TestFinalStatus = 'success' | 'deviations' | 'aborted' | 'alarm';

export interface VerifiedCharacteristic {
  name: string;
  normative: string;
  measured: string;
  unit: string;
  tolerance: string;
  passed: boolean;
  notes?: string;
}

export interface TestResultRecord {
  id: string;
  testId: string;
  date: string;
  durationSec: number;
  object: TestObject;
  methodology: TestMethodology;
  parameters: TestParameters;
  finalStatus: TestFinalStatus;
  statusComment: string;
  verdict: string;
  peakRpm: number;
  peakCurrent: number;
  peakInverterTemp: number;
  averagePower: number;
  characteristics: VerifiedCharacteristic[];
  deviations: string[];
  telemetryHistory: TelemetryPoint[];
  events: BenchEvent[];
  operatorName: string;
  leadEngineer: string;
}

export type SimulationScenario = 
  | 'normal'        // Нормальный цикл
  | 'temp_warning'  // Предупреждение о температуре (87°C > 85°C)
  | 'sensor_loss'   // Потеря сигнала датчика тока фазы B
  | 'critical_trip';// Критическая авария (КЗ / Перегрузка по току)
