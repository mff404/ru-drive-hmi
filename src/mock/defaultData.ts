import { 
  BenchComponent, 
  TestMethodology, 
  TestObject, 
  BenchEvent, 
  TestResultRecord 
} from '../types';

export const INITIAL_TEST_OBJECT: TestObject = {
  model: 'RU-DRIVE MV-1000/6-УХЛ4',
  serialNumber: 'RD-2026-MV-0492',
  ratedPowerKw: 1000,
  ratedVoltageKv: 6.0,
  ratedCurrentA: 120,
  softwareVersion: 'v3.4.12-rc2',
  firmwareVersion: 'DSP-2.18 / FPGA-1.04',
  controlAlgorithm: 'FOC-Sensorless-v2.8 (Векторный бездатчиковый)',
  manufactureDate: '10.10.2026'
};

export const TEST_METHODOLOGIES: TestMethodology[] = [
  {
    id: 'm-basic-char',
    title: 'Проверка основных характеристик ВЧРП',
    code: 'МП-ВЧРП-01',
    description: 'Определение базовых статических характеристик, проверка диапазона регулирования частоты, проверка соответствия U/f характеристики и номинального КПД.',
    category: 'Приёмо-сдаточные',
    standards: 'ГОСТ Р 51321.1-2007, ТУ 3416-001-RU-2024',
    defaultDurationSec: 120,
    verifiedCharacteristics: [
      'Диапазон выходной частоты (0.5 – 50.0 Гц)',
      'Симметрия фазных напряжений (< 1.5%)',
      'Коэффициент гармонических искажений THD_u (< 2.5%)',
      'КПД преобразователя в номинальном режиме (> 98.2%)',
      'Стабильность поддержания заданной скорости'
    ],
    recommendedParams: {
      frequency: 50.0,
      targetRpm: 1500,
      loadPercent: 75,
      durationSec: 120,
      maxTemp: 85,
      maxCurrent: 140
    }
  },
  {
    id: 'm-dynamic',
    title: 'Проверка динамических характеристик',
    code: 'МП-ВЧРП-02',
    description: 'Исследование реакции на ступенчатый наброс и сброс нагрузки, оценка времени разгона/торможения, пульсаций электромагнитного момента и точности отслеживания траектории.',
    category: 'Исследовательские',
    standards: 'ГОСТ 18142.1-85, Программа ПНР RU-DRIVE',
    defaultDurationSec: 90,
    verifiedCharacteristics: [
      'Время реакции контура тока (< 5 мс)',
      'Динамическая просадка скорости при набросе 50% нагрузки (< 2.0%)',
      'Время восстановления скорости (< 120 мс)',
      'Отсутствие автоколебаний в контуре скорости',
      'Пульсации электромагнитного момента (< 3.0%)'
    ],
    recommendedParams: {
      frequency: 45.0,
      targetRpm: 1350,
      loadPercent: 100,
      durationSec: 90,
      maxTemp: 85,
      maxCurrent: 150
    }
  },
  {
    id: 'm-cooling',
    title: 'Проверка системы жидкостного охлаждения',
    code: 'МП-ВЧРП-03',
    description: 'Тепловые испытания при длительной нагрузке, контроль теплового сопротивления охладителей силовых модулей IGBT, давления и расхода хладагента.',
    category: 'Тепловые',
    standards: 'ГОСТ 20.57.406-81 (метод 201-1)',
    defaultDurationSec: 180,
    verifiedCharacteristics: [
      'Превышение температуры радиаторов IGBT над хладагентом (ΔT < 25°C)',
      'Гидравлическое сопротивление контура (0.22 – 0.28 МПа)',
      'Расход теплоносителя (> 45 л/мин)',
      'Равномерность распределения температур между фазными стойками',
      'Срабатывание тепловой защиты при моделировании ухудшения обдува'
    ],
    recommendedParams: {
      frequency: 50.0,
      targetRpm: 1500,
      loadPercent: 110,
      durationSec: 180,
      maxTemp: 80,
      maxCurrent: 145
    }
  },
  {
    id: 'm-control-algo',
    title: 'Проверка алгоритмов управления (FOC/DTC)',
    code: 'МП-ВЧРП-04',
    description: 'Тестирование бездатчикового наблюдателя магнитного потока ротора в режиме ослабления поля и на околонулевых скоростях с высоким моментом страгивания.',
    category: 'Алгоритмические',
    standards: 'Регламент R&D RU-DRIVE v2.4',
    defaultDurationSec: 90,
    verifiedCharacteristics: [
      'Удержание 100% момента при 0.5 Гц без датчика положения',
      'Устойчивость наблюдателя при скачкообразном изменении активного сопротивления',
      'Плавность перехода в зону ослабления поля (field weakening)',
      'Оптимальность энергопотребления алгоритма MTPA'
    ],
    recommendedParams: {
      frequency: 30.0,
      targetRpm: 900,
      loadPercent: 85,
      durationSec: 90,
      maxTemp: 85,
      maxCurrent: 135
    }
  },
  {
    id: 'm-emergency',
    title: 'Проверка аварийных защит и блокировок',
    code: 'МП-ВЧРП-05',
    description: 'Проверка аппаратных компараторов тока, оптической дуговой защиты ячеек, защиты от обрыва фазы, перенапряжения звена DC и времени снятия импульсов ШИМ.',
    category: 'Безопасность',
    standards: 'ГОСТ Р МЭК 61800-5-1, ПУЭ 7 изд.',
    defaultDurationSec: 60,
    verifiedCharacteristics: [
      'Время аппаратного гашения импульсов при КЗ (< 2.5 мкс)',
      'Срабатывание защиты от асимметрии токов фаз',
      'Срабатывание детектора дугового замыкания',
      'Корректность формирования отчёта об аварии в энергонезависимой памяти',
      'Безопасное обесточивание цепей управления'
    ],
    recommendedParams: {
      frequency: 25.0,
      targetRpm: 750,
      loadPercent: 50,
      durationSec: 60,
      maxTemp: 75,
      maxCurrent: 160
    }
  }
];

export const INITIAL_COMPONENTS: BenchComponent[] = [
  {
    id: 'comp-vfd',
    name: 'Испытываемый ВЧРП',
    role: 'Объект испытания (RU-DRIVE MV-1000/6)',
    status: 'normal',
    healthPercent: 99,
    details: 'Высоковольтный преобразователь частоты 6 кВ 1000 кВт. Стойка А1-А3 готова к подаче напряжения звена DC.',
    lastChecked: '19:48:10',
    parameters: [
      { label: 'Готовность ШИМ', value: 'ГОТОВ', status: 'ok' },
      { label: 'U звена DC', value: '5980 В', status: 'ok' },
      { label: 'Контур предзаряда', value: 'Шунтирован', status: 'ok' }
    ]
  },
  {
    id: 'comp-inverter',
    name: 'Инверторная секция',
    role: 'Силовые модули IGBT 3-Level NPC',
    status: 'normal',
    healthPercent: 98,
    temperature: 42.5,
    details: 'Драйверы ключей без ошибок десатурации. Оптические каналы управления активны, задержки симметричны.',
    lastChecked: '19:48:10',
    parameters: [
      { label: 'T_max IGBT', value: '42.5 °C', status: 'ok' },
      { label: 'Драйверы фаз U/V/W', value: 'OK (15.2 В)', status: 'ok' },
      { label: 'Оптика ШИМ', value: 'Синхронизирована', status: 'ok' }
    ]
  },
  {
    id: 'comp-motor-ind',
    name: 'Асинхронная машина стенда',
    role: 'Приводной/испытательный двигатель 1000 кВт',
    status: 'normal',
    healthPercent: 100,
    temperature: 38.0,
    details: 'Обмотки статора соединены звездой. Сопротивление изоляции > 500 МОм. Датчики вибрации откалиброваны.',
    lastChecked: '19:48:10',
    parameters: [
      { label: 'T подшипников DE/NDE', value: '38.0 / 36.5 °C', status: 'ok' },
      { label: 'Виброскорость RMS', value: '1.1 мм/с', status: 'ok' },
      { label: 'Энкодер 1024 имп/об', value: 'Сигнал 100%', status: 'ok' }
    ]
  },
  {
    id: 'comp-motor-sync',
    name: 'Синхронная машина нагрузки',
    role: 'Нагрузочный генератор стенда',
    status: 'normal',
    healthPercent: 97,
    temperature: 40.2,
    details: 'Возбудитель готов к формированию противодействующего электромагнитного момента до 6400 Н·м.',
    lastChecked: '19:48:10',
    parameters: [
      { label: 'Ток возбуждения', value: '18.4 А', status: 'ok' },
      { label: 'Момент сопротивления', value: '0 Н·м (Х.Х.)', status: 'ok' },
      { label: 'T статора', value: '40.2 °C', status: 'ok' }
    ]
  },
  {
    id: 'comp-brake',
    name: 'Тормозной механизм',
    role: 'Чоппер сброса энергии и колодочный тормоз',
    status: 'normal',
    healthPercent: 100,
    temperature: 31.0,
    details: 'Тормозной резистивный блок разгружен. Аварийный пневматический дисковый тормоз взведён, давление в норме.',
    lastChecked: '19:48:10',
    parameters: [
      { label: 'Давление пневмотормоза', value: '0.62 МПа', status: 'ok' },
      { label: 'T чоппера', value: '31.0 °C', status: 'ok' },
      { label: 'Ключи торможения', value: 'Дежурный режим', status: 'ok' }
    ]
  },
  {
    id: 'comp-cooling',
    name: 'Система охлаждения',
    role: 'Двухконтурная насосная станция вода/гликоль',
    status: 'normal',
    healthPercent: 96,
    temperature: 24.8,
    pressure: 0.25,
    details: 'Основной циркуляционный насос №1 включён. Расход теплоносителя 48.2 л/мин. Давление в контуре стабильно.',
    lastChecked: '19:48:10',
    parameters: [
      { label: 'Давление контура', value: '0.25 МПа', status: 'ok' },
      { label: 'Расход хладагента', value: '48.2 л/мин', status: 'ok' },
      { label: 'T подачи / обратки', value: '21.5 / 24.8 °C', status: 'ok' }
    ]
  },
  {
    id: 'comp-sensors',
    name: 'Система датчиков телеметрии',
    role: 'Измерительный комплекс (LEM, PT100, вибро)',
    status: 'normal',
    healthPercent: 100,
    details: 'Датчики тока Холла LEM, датчики напряжения шины DC, термосопротивления PT100 и вибродатчики в допуске.',
    lastChecked: '19:48:10',
    parameters: [
      { label: 'LEM Phase U/V/W', value: 'Калибровка OK', status: 'ok' },
      { label: 'Шина CAN/Modbus', value: 'Ошибок: 0', status: 'ok' },
      { label: 'Цикл опроса АЦП', value: '50 мкс', status: 'ok' }
    ]
  },
  {
    id: 'comp-safety',
    name: 'Защитные системы стенда',
    role: 'Реле безопасности PILZ, ограждение, оптика',
    status: 'normal',
    healthPercent: 100,
    details: 'Периметр испытательного бокса заблокирован электромагнитными замками. Кнопки E-STOP взведены, шлейфы замкнуты.',
    lastChecked: '19:48:10',
    parameters: [
      { label: 'Шлейф E-STOP', value: 'Замкнут (Норма)', status: 'ok' },
      { label: 'Двери бокса', value: 'Заблокированы', status: 'ok' },
      { label: 'Дуговая защита ячеек', value: 'Активна', status: 'ok' }
    ]
  }
];

export const INITIAL_EVENTS: BenchEvent[] = [
  {
    id: 'ev-101',
    timestamp: '19:45:12',
    level: 'system',
    component: 'ПЛК Стенда',
    event: 'Инициализация стендовой системы управления TEST BENCH 01',
    status: 'resolved'
  },
  {
    id: 'ev-102',
    timestamp: '19:46:05',
    level: 'info',
    component: 'Система охлаждения',
    event: 'Запуск насоса основного контура хладагента (норма расхода достигнута)',
    value: '48.2 л/мин',
    status: 'resolved'
  },
  {
    id: 'ev-103',
    timestamp: '19:47:30',
    level: 'info',
    component: 'Защитные системы',
    event: 'Блокировка доступа в высоковольтный отсек. Шлейфы безопасности замкнуты.',
    status: 'resolved'
  },
  {
    id: 'ev-104',
    timestamp: '19:48:10',
    level: 'system',
    component: 'Стенд',
    event: 'Автоматическая самодиагностика компонентов успешно завершена (8/8 в норме)',
    status: 'resolved'
  }
];

export const HISTORIC_RESULTS: TestResultRecord[] = [
  {
    id: 'res-prev-01',
    testId: 'TST-2026-1015-07',
    date: '15.10.2026 18:20',
    durationSec: 120,
    object: {
      ...INITIAL_TEST_OBJECT,
      serialNumber: 'RD-2026-MV-0491'
    },
    methodology: TEST_METHODOLOGIES[0],
    parameters: {
      frequency: 50.0,
      targetRpm: 1500,
      loadPercent: 75,
      durationSec: 120,
      maxTemp: 85,
      maxCurrent: 140
    },
    finalStatus: 'success',
    statusComment: 'Все параметры соответствуют техническим условиям ТУ 3416-001-RU-2024. Замечаний нет.',
    verdict: 'ВЧРП соответствует критериям приёмо-сдаточных испытаний по методике МП-ВЧРП-01',
    peakRpm: 1502,
    peakCurrent: 104.5,
    peakInverterTemp: 68.4,
    averagePower: 742,
    characteristics: [
      {
        name: 'Диапазон выходной частоты',
        normative: '0.5 – 50.0 Гц',
        measured: '50.01 Гц',
        unit: 'Гц',
        tolerance: '±0.05 Гц',
        passed: true
      },
      {
        name: 'Симметрия фазных напряжений',
        normative: '< 1.5 %',
        measured: '0.78 %',
        unit: '%',
        tolerance: 'макс. 1.5%',
        passed: true
      },
      {
        name: 'Коэффициент THD_u',
        normative: '< 2.5 %',
        measured: '1.82 %',
        unit: '%',
        tolerance: 'макс. 2.5%',
        passed: true
      },
      {
        name: 'КПД преобразователя в номинале',
        normative: '> 98.2 %',
        measured: '98.64 %',
        unit: '%',
        tolerance: 'мин. 98.2%',
        passed: true
      },
      {
        name: 'Стабильность частоты вращения',
        normative: '± 0.2 %',
        measured: '± 0.08 %',
        unit: '%',
        tolerance: '±0.2%',
        passed: true
      }
    ],
    deviations: [],
    telemetryHistory: [],
    events: [
      {
        id: 'ev-h1',
        timestamp: '18:20:00',
        level: 'info',
        component: 'Стенд',
        event: 'Старт испытания TST-2026-1015-07',
        status: 'resolved'
      },
      {
        id: 'ev-h2',
        timestamp: '18:22:00',
        level: 'system',
        component: 'Стенд',
        event: 'Штатное завершение испытания',
        status: 'resolved'
      }
    ],
    operatorName: 'Смирнов А. В. (Инженер-испытатель)',
    leadEngineer: 'Ковалёв Д. М. (Ведущий разработчик привода)'
  },
  {
    id: 'res-prev-02',
    testId: 'TST-2026-1015-06',
    date: '15.10.2026 16:45',
    durationSec: 85,
    object: {
      ...INITIAL_TEST_OBJECT,
      serialNumber: 'RD-2026-MV-0490'
    },
    methodology: TEST_METHODOLOGIES[1],
    parameters: {
      frequency: 45.0,
      targetRpm: 1350,
      loadPercent: 100,
      durationSec: 90,
      maxTemp: 85,
      maxCurrent: 150
    },
    finalStatus: 'deviations',
    statusComment: 'Зафиксировано повышенное время реакции контура тока при ступенчатом набросе нагрузки (6.4 мс при норме < 5.0 мс). Требуется калибровка ПИ-регулятора q-оси.',
    verdict: 'ВЧРП требует корректировки коэффициентов регулятора тока в прошивке DSP',
    peakRpm: 1362,
    peakCurrent: 122.0,
    peakInverterTemp: 74.2,
    averagePower: 890,
    characteristics: [
      {
        name: 'Время реакции контура тока',
        normative: '< 5.0 мс',
        measured: '6.4 мс',
        unit: 'мс',
        tolerance: 'макс. 5.0 мс',
        passed: false,
        notes: 'Превышение нормы на 1.4 мс'
      },
      {
        name: 'Динамическая просадка скорости',
        normative: '< 2.0 %',
        measured: '1.45 %',
        unit: '%',
        tolerance: 'макс. 2.0%',
        passed: true
      },
      {
        name: 'Пульсации момента',
        normative: '< 3.0 %',
        measured: '2.6 %',
        unit: '%',
        tolerance: 'макс. 3.0%',
        passed: true
      }
    ],
    deviations: [
      'Превышение времени реакции контура тока: 6.4 мс вместо положенных < 5.0 мс (отклонение +28%)'
    ],
    telemetryHistory: [],
    events: [],
    operatorName: 'Смирнов А. В. (Инженер-испытатель)',
    leadEngineer: 'Ковалёв Д. М. (Ведущий разработчик привода)'
  }
];
