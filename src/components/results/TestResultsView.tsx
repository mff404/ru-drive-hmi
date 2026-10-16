import React, { useState } from 'react';
import { 
  FileCheck2, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Calendar, 
  SlidersHorizontal, 
  GitCompare, 
  ChevronRight,
  FileText,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { useBench } from '../../context/BenchContext';
import { TestResultRecord, TestFinalStatus } from '../../types';
import jsPDF from 'jspdf';

export const TestResultsView: React.FC = () => {
  const { results, activeResultId, setActiveResultId, setActiveTab } = useBench();
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [compareResultId, setCompareResultId] = useState<string>(results[1]?.id || results[0]?.id);
  const [showProtocolModal, setShowProtocolModal] = useState<boolean>(false);

  const activeResult = results.find(r => r.id === activeResultId) || results[0];
  const compareResult = results.find(r => r.id === compareResultId) || results[1];

  const getStatusBadge = (status: TestFinalStatus) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/70 border border-emerald-500/60 text-emerald-400 text-xs font-bold font-mono rounded-xs">
            <CheckCircle2 className="w-4 h-4" />
            УСПЕШНО ЗАВЕРШЕНО
          </span>
        );
      case 'deviations':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/80 border border-amber-500/70 text-amber-300 text-xs font-bold font-mono rounded-xs">
            <AlertTriangle className="w-4 h-4" />
            ЗАВЕРШЕНО С ОТКЛОНЕНИЯМИ
          </span>
        );
      case 'aborted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-600 text-slate-300 text-xs font-bold font-mono rounded-xs">
            ПРЕРВАНО ОПЕРАТОРОМ
          </span>
        );
      case 'alarm':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/90 border border-red-500 text-red-300 text-xs font-bold font-mono rounded-xs">
            <XCircle className="w-4 h-4" />
            ЗАВЕРШЕНО АВАРИЙНО
          </span>
        );
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('RU-DRIVE - TEST PROTOCOL', 20, 20);
    doc.setFontSize(10);
    doc.text(`Test ID: ${activeResult.testId}`, 20, 30);
    doc.text(`Object: ${activeResult.object.model} (S/N: ${activeResult.object.serialNumber})`, 20, 38);
    doc.text(`Methodology: ${activeResult.methodology.code} - ${activeResult.methodology.title}`, 20, 46);
    doc.text(`Date: ${activeResult.date} | Duration: ${activeResult.durationSec}s`, 20, 54);
    doc.text(`Final Status: ${activeResult.finalStatus.toUpperCase()}`, 20, 62);
    doc.text(`Peak RPM: ${activeResult.peakRpm} rpm | Max Temp: ${activeResult.peakInverterTemp} C`, 20, 70);
    doc.text(`Peak Current: ${activeResult.peakCurrent} A | Avg Power: ${activeResult.averagePower} kW`, 20, 78);
    doc.text(`Operator: ${activeResult.operatorName}`, 20, 90);
    doc.text(`Lead Engineer: ${activeResult.leadEngineer}`, 20, 98);
    doc.save(`RU-DRIVE-Protocol-${activeResult.testId}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!activeResult) {
    return (
      <div className="p-8 text-center text-slate-500">
        Нет доступных протоколов испытаний
      </div>
    );
  }

  return (
    <div className="p-4 pb-12 space-y-4 max-w-[1600px] mx-auto select-none">
      {/* Top Header & Selector */}
      <div className="bg-[#10141a] border border-[#232b36] p-4 rounded-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileCheck2 className="w-5 h-5 text-cyan-400" />
          <div>
            <h1 className="text-sm font-bold text-white uppercase tracking-wider">
              Результаты испытаний и паспортизация
            </h1>
            <p className="text-xs text-slate-400">
              Архив испытаний ВЧРП на стенде TEST BENCH 01
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* History Selector Dropdown */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Испытание:</span>
            <select
              value={activeResultId}
              onChange={e => setActiveResultId(e.target.value)}
              className="bg-[#0b0e12] border border-[#232b36] text-white py-1 px-2.5 rounded-xs outline-none focus:border-cyan-500 font-mono text-xs cursor-pointer"
            >
              {results.map(r => (
                <option key={r.id} value={r.id}>
                  {r.testId} ({r.methodology.code}) — {r.finalStatus.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Comparison Mode */}
          <button
            onClick={() => setIsCompareMode(!isCompareMode)}
            className={`px-3 py-1.5 text-xs font-mono rounded-xs border transition-colors flex items-center gap-1.5 cursor-pointer ${
              isCompareMode
                ? 'border-cyan-500 bg-cyan-950/50 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                : 'border-[#232b36] bg-[#0c1015] text-slate-400 hover:text-white'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Сравнение двух тестов</span>
          </button>

          {/* Protocol Modal Trigger */}
          <button
            onClick={() => setShowProtocolModal(true)}
            className="px-3.5 py-1.5 bg-[#17202b] hover:bg-[#202d3d] border border-[#2e3e52] hover:border-cyan-500/50 text-white text-xs font-semibold rounded-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Протокол испытания</span>
          </button>
        </div>
      </div>

      {/* Main Single Result View or Compare View */}
      {!isCompareMode ? (
        <div className="space-y-4">
          {/* Summary Card */}
          <div className="bg-[#10141a] border border-[#232b36] p-5 rounded-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#232b36] pb-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-xl font-bold font-mono text-white tracking-wider">{activeResult.testId}</span>
                  {getStatusBadge(activeResult.finalStatus)}
                </div>
                <div className="text-xs text-slate-400">
                  Методика: <strong className="text-slate-200">{activeResult.methodology.code} ({activeResult.methodology.title})</strong> • Стандарт: {activeResult.methodology.standards}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {activeResult.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {activeResult.durationSec} с
                </span>
              </div>
            </div>

            {/* Verdict Box */}
            <div className={`p-3.5 rounded-xs border mb-4 text-xs ${
              activeResult.finalStatus === 'success'
                ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                : 'bg-amber-950/30 border-amber-500/50 text-amber-200'
            }`}>
              <div className="font-bold uppercase tracking-wider mb-0.5">Инженерное заключение:</div>
              <div>{activeResult.verdict}</div>
              {activeResult.statusComment && (
                <div className="mt-1 text-[11px] text-slate-300 opacity-90">{activeResult.statusComment}</div>
              )}
            </div>

            {/* Key Peak Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-[#0b0e12] border border-[#1e2632] rounded-xs font-mono">
                <div className="text-[10px] text-slate-400 uppercase">Макс. обороты</div>
                <div className="text-lg font-bold text-white mt-0.5">{activeResult.peakRpm} об/мин</div>
              </div>
              <div className="p-3 bg-[#0b0e12] border border-[#1e2632] rounded-xs font-mono">
                <div className="text-[10px] text-slate-400 uppercase">Пиковый ток статора</div>
                <div className="text-lg font-bold text-white mt-0.5">{activeResult.peakCurrent} А</div>
              </div>
              <div className="p-3 bg-[#0b0e12] border border-[#1e2632] rounded-xs font-mono">
                <div className="text-[10px] text-slate-400 uppercase">Макс. температура IGBT</div>
                <div className="text-lg font-bold text-white mt-0.5">{activeResult.peakInverterTemp} °C</div>
              </div>
              <div className="p-3 bg-[#0b0e12] border border-[#1e2632] rounded-xs font-mono">
                <div className="text-[10px] text-slate-400 uppercase">Средняя мощность</div>
                <div className="text-lg font-bold text-white mt-0.5">{activeResult.averagePower} кВт</div>
              </div>
            </div>
          </div>

          {/* Verified Characteristics Table */}
          <div className="bg-[#10141a] border border-[#232b36] p-5 rounded-xs">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Проверенные характеристики и допуски
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0b0e12] text-slate-400 text-[10px] uppercase border-b border-[#232b36]">
                  <tr>
                    <th className="py-2.5 px-3">Параметр</th>
                    <th className="py-2.5 px-3">Норматив ТУ/ГОСТ</th>
                    <th className="py-2.5 px-3">Измерено на стенде</th>
                    <th className="py-2.5 px-3">Допуск</th>
                    <th className="py-2.5 px-3 text-right">Результат</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#171f2a]">
                  {activeResult.characteristics.map((c, i) => (
                    <tr key={i} className="hover:bg-[#131a23]">
                      <td className="py-2.5 px-3 text-slate-200 font-sans">{c.name}</td>
                      <td className="py-2.5 px-3 text-slate-400">{c.normative}</td>
                      <td className="py-2.5 px-3 font-bold text-white">{c.measured}</td>
                      <td className="py-2.5 px-3 text-slate-400">{c.tolerance}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                          c.passed ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {c.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {c.passed ? 'В НОРМЕ' : 'ОТКЛОНЕНИЕ'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Comparison Mode (Two Tests Side by Side) */
        <div className="bg-[#10141a] border border-[#232b36] p-5 rounded-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#232b36] pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-sky-400" />
              Сравнение результатов испытаний (Diff-анализ)
            </h2>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">Сравнить с:</span>
              <select
                value={compareResultId}
                onChange={e => setCompareResultId(e.target.value)}
                className="bg-[#0b0e12] border border-[#232b36] text-white py-1 px-2.5 rounded-xs outline-none font-mono text-xs"
              >
                {results.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.testId} ({r.date})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Test A */}
            <div className="p-4 bg-[#0c1015] border border-[#1e2632] rounded-xs space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[#1f2835] pb-2">
                <span className="font-bold text-white text-sm">{activeResult.testId}</span>
                <span className="text-slate-400">{activeResult.date}</span>
              </div>
              <div>Объект: <strong className="text-slate-200">{activeResult.object.serialNumber}</strong></div>
              <div>Методика: <strong className="text-slate-200">{activeResult.methodology.code}</strong></div>
              <div>Пиковые обороты: <strong className="text-emerald-400">{activeResult.peakRpm} об/мин</strong></div>
              <div>Пиковый ток: <strong className="text-white">{activeResult.peakCurrent} А</strong></div>
              <div>Макс. T IGBT: <strong className={activeResult.peakInverterTemp > 80 ? 'text-amber-400' : 'text-white'}>{activeResult.peakInverterTemp} °C</strong></div>
              <div>Статус: <strong className="text-emerald-400">{activeResult.finalStatus.toUpperCase()}</strong></div>
            </div>

            {/* Test B */}
            <div className="p-4 bg-[#0c1015] border border-[#1e2632] rounded-xs space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[#1f2835] pb-2">
                <span className="font-bold text-white text-sm">{compareResult.testId}</span>
                <span className="text-slate-400">{compareResult.date}</span>
              </div>
              <div>Объект: <strong className="text-slate-200">{compareResult.object.serialNumber}</strong></div>
              <div>Методика: <strong className="text-slate-200">{compareResult.methodology.code}</strong></div>
              <div>Пиковые обороты: <strong className="text-emerald-400">{compareResult.peakRpm} об/мин</strong></div>
              <div>Пиковый ток: <strong className="text-white">{compareResult.peakCurrent} А</strong></div>
              <div>Макс. T IGBT: <strong className={compareResult.peakInverterTemp > 80 ? 'text-amber-400' : 'text-white'}>{compareResult.peakInverterTemp} °C</strong></div>
              <div>Статус: <strong className={compareResult.finalStatus === 'success' ? 'text-emerald-400' : 'text-amber-400'}>{compareResult.finalStatus.toUpperCase()}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Formal Factory Test Protocol Modal */}
      {showProtocolModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#11161d] border border-[#2d3748] rounded-xs max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto printable-protocol">
            {/* Protocol Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-600 pb-4 mb-4">
              <div>
                <div className="text-[11px] font-mono font-bold tracking-widest text-slate-400">RU-DRIVE POWER ELECTRONICS</div>
                <h2 className="text-lg font-bold text-white">ПРОТОКОЛ ЗАВОДСКИХ ИСПЫТАНИЙ ВЧРП</h2>
                <div className="text-xs text-slate-300 font-mono mt-0.5">
                  № {activeResult.testId} от {activeResult.date}
                </div>
              </div>
              <div className="text-right text-xs font-mono text-slate-400">
                <div>Стендовый комплекс: TEST BENCH 01</div>
                <div>Аттестат поверки стенда: № АТТ-2026/04</div>
              </div>
            </div>

            {/* Protocol Body */}
            <div className="space-y-4 text-xs font-mono">
              <div className="bg-[#0b0e12] p-3 border border-[#1e2632] rounded-xs space-y-1">
                <div>Объект испытаний: <strong className="text-white">{activeResult.object.model}</strong></div>
                <div>Заводской номер изделия: <strong className="text-emerald-400">{activeResult.object.serialNumber}</strong></div>
                <div>Версия встроенного ПО: <strong className="text-white">{activeResult.object.softwareVersion}</strong> ({activeResult.object.firmwareVersion})</div>
                <div>Методика испытаний: <strong className="text-white">{activeResult.methodology.code}</strong> — {activeResult.methodology.title}</div>
              </div>

              <div>
                <div className="font-bold text-slate-200 uppercase mb-2">1. Зафиксированные режимы и телеметрия</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 border border-[#1e2632] bg-[#0b0e12]">
                    <span className="text-[10px] text-slate-400">Частота вращения:</span>
                    <div className="font-bold text-white">{activeResult.peakRpm} об/мин</div>
                  </div>
                  <div className="p-2 border border-[#1e2632] bg-[#0b0e12]">
                    <span className="text-[10px] text-slate-400">Ток нагрузки:</span>
                    <div className="font-bold text-white">{activeResult.peakCurrent} А</div>
                  </div>
                  <div className="p-2 border border-[#1e2632] bg-[#0b0e12]">
                    <span className="text-[10px] text-slate-400">Температура IGBT:</span>
                    <div className="font-bold text-white">{activeResult.peakInverterTemp} °C</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-200 uppercase mb-2">2. Заключение испытательной комиссии</div>
                <p className="p-3 bg-[#0b0e12] border border-[#1e2632] rounded-xs font-sans text-slate-200 leading-relaxed">
                  {activeResult.verdict}. Параметры соответствуют ГОСТ Р 51321.1 и техническим условиям ТУ 3416-001-RU-2024.
                </p>
              </div>

              {/* Signatures block */}
              <div className="pt-4 border-t border-[#232b36] grid grid-cols-2 gap-6">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Испытания провёл (Инженер):</div>
                  <div className="text-slate-200 font-bold mt-1">{activeResult.operatorName}</div>
                  <div className="text-[10px] text-slate-500 mt-2">Подпись: ______________________</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Проверил (Ведущий разработчик):</div>
                  <div className="text-slate-200 font-bold mt-1">{activeResult.leadEngineer}</div>
                  <div className="text-[10px] text-slate-500 mt-2">Подпись: ______________________</div>
                </div>
              </div>
            </div>

            {/* Protocol Actions */}
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#232b36] no-print">
              <button
                onClick={() => setShowProtocolModal(false)}
                className="px-4 py-1.5 bg-[#171e27] hover:bg-[#202936] text-slate-300 text-xs rounded-xs cursor-pointer"
              >
                Закрыть
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 bg-[#1b232e] hover:bg-[#253040] border border-[#2d3a4d] text-slate-200 text-xs rounded-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Печать</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.35)]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Экспорт в PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
