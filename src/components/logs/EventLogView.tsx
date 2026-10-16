import React, { useState } from 'react';
import { 
  ScrollText, 
  Search, 
  Filter, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  X, 
  Download, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { useBench } from '../../context/BenchContext';
import { BenchEvent, EventLevel } from '../../types';

export const EventLogView: React.FC = () => {
  const { events, acknowledgeEvent, setActiveTab } = useBench();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('all'); // all, info, warning, alarm
  const [selectedEvent, setSelectedEvent] = useState<BenchEvent | null>(null);

  const filteredEvents = events.filter(e => {
    // Level filter
    if (levelFilter !== 'all' && e.level !== levelFilter) return false;
    
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchComp = e.component.toLowerCase().includes(q);
      const matchText = e.event.toLowerCase().includes(q);
      const matchVal = e.value?.toLowerCase().includes(q);
      if (!matchComp && !matchText && !matchVal) return false;
    }
    return true;
  });

  const getLevelBadge = (level: EventLevel) => {
    switch (level) {
      case 'alarm':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-950/80 border border-red-500 text-red-300 text-[10px] font-bold font-mono rounded-xs">
            <ShieldAlert className="w-3 h-3" />
            АВАРИЯ
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-950/80 border border-amber-500/60 text-amber-300 text-[10px] font-bold font-mono rounded-xs">
            <AlertTriangle className="w-3 h-3" />
            ПРЕДУПРЕЖДЕНИЕ
          </span>
        );
      case 'info':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-950/60 border border-sky-500/40 text-sky-300 text-[10px] font-mono rounded-xs">
            <Info className="w-3 h-3" />
            ИНФО
          </span>
        );
      case 'system':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 border border-slate-600 text-slate-300 text-[10px] font-mono rounded-xs">
            СИСТЕМА
          </span>
        );
    }
  };

  const getStatusBadge = (status: BenchEvent['status']) => {
    switch (status) {
      case 'new':
        return <span className="text-[10px] font-mono text-red-400 font-bold">НОВОЕ</span>;
      case 'acknowledged':
        return <span className="text-[10px] font-mono text-amber-400">КВИТИРОВАНО</span>;
      case 'resolved':
        return <span className="text-[10px] font-mono text-emerald-400">УСТРАНЕНО</span>;
    }
  };

  const exportCSV = () => {
    const headers = ['Время', 'Уровень', 'Компонент', 'Событие', 'Значение', 'Статус'];
    const rows = filteredEvents.map(e => [
      e.timestamp,
      e.level.toUpperCase(),
      `"${e.component}"`,
      `"${e.event}"`,
      `"${e.value || '-'}"`,
      e.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ru_drive_events_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 pb-12 space-y-4 max-w-[1600px] mx-auto select-none">
      {/* Top Filter and Search Bar */}
      <div className="bg-[#10141a] border border-[#232b36] p-4 rounded-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-cyan-400" />
          <div>
            <h1 className="text-sm font-bold text-white uppercase tracking-wider">
              Системный журнал событий стенда
            </h1>
            <p className="text-xs text-slate-400">
              Всего записей в буфере: <span className="text-white font-mono">{events.length}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Level Filter Tabs */}
          <div className="flex items-center bg-[#0b0e12] border border-[#232b36] p-1 rounded-xs">
            {[
              { id: 'all', label: 'Все' },
              { id: 'info', label: 'Информация' },
              { id: 'warning', label: 'Предупреждения' },
              { id: 'alarm', label: 'Аварии' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setLevelFilter(tab.id)}
                className={`px-3 py-1 text-xs font-mono rounded-xs transition-colors cursor-pointer ${
                  levelFilter === tab.id
                    ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по тексту или компоненту..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#0b0e12] border border-[#232b36] text-xs text-slate-200 placeholder-slate-500 rounded-xs w-64 focus:border-cyan-500 outline-none font-mono"
            />
          </div>

          {/* Export Button */}
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 bg-[#141b24] hover:bg-[#1a232f] border border-[#2b3748] hover:border-cyan-500/50 hover:text-cyan-300 text-slate-300 text-xs font-mono rounded-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-[#10141a] border border-[#232b36] rounded-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b0e12] text-slate-400 font-mono uppercase text-[11px] border-b border-[#232b36]">
              <tr>
                <th className="py-2.5 px-3">Время</th>
                <th className="py-2.5 px-3">Уровень</th>
                <th className="py-2.5 px-3">Компонент</th>
                <th className="py-2.5 px-3">Событие</th>
                <th className="py-2.5 px-3">Значение</th>
                <th className="py-2.5 px-3">Статус</th>
                <th className="py-2.5 px-3 text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171f2a] font-mono">
              {filteredEvents.length > 0 ? (
                filteredEvents.map(ev => (
                  <tr
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className="hover:bg-[#131a23] cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 text-slate-400 font-mono-telemetry whitespace-nowrap">
                      {ev.timestamp}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {getLevelBadge(ev.level)}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-200 whitespace-nowrap">
                      {ev.component}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans max-w-md truncate">
                      {ev.event}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 whitespace-nowrap">
                      {ev.value || '—'}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {getStatusBadge(ev.status)}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(ev);
                        }}
                        className="text-xs text-sky-400 hover:underline cursor-pointer"
                      >
                        Подробнее
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    Событий по заданным критериям не найдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Details Drawer/Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#11161d] border border-[#2d3748] rounded-xs max-w-lg w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-[#232b36] pb-3">
              <div className="flex items-center gap-2">
                {getLevelBadge(selectedEvent.level)}
                <h3 className="text-sm font-bold text-white">Детали события {selectedEvent.id}</h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between font-mono bg-[#0b0e12] p-2.5 border border-[#1e2632] rounded-xs">
                <span className="text-slate-400">Время регистрации:</span>
                <span className="text-slate-200">{selectedEvent.timestamp}</span>
              </div>

              <div className="flex justify-between font-mono bg-[#0b0e12] p-2.5 border border-[#1e2632] rounded-xs">
                <span className="text-slate-400">Оборудование / Компонент:</span>
                <span className="text-slate-200 font-bold">{selectedEvent.component}</span>
              </div>

              <div>
                <span className="font-semibold text-slate-400 uppercase tracking-wider">Описание события:</span>
                <div className="mt-1 p-2.5 bg-[#0b0e12] border border-[#1e2632] rounded-xs text-slate-200 leading-relaxed font-sans">
                  {selectedEvent.event}
                </div>
              </div>

              {selectedEvent.value && (
                <div className="flex justify-between font-mono bg-[#0b0e12] p-2.5 border border-[#1e2632] rounded-xs">
                  <span className="text-slate-400">Зафиксированное значение:</span>
                  <span className="text-amber-400 font-bold">{selectedEvent.value}</span>
                </div>
              )}

              {selectedEvent.recommendation && (
                <div>
                  <span className="font-semibold text-amber-400 uppercase tracking-wider">Рекомендуемое действие инженера:</span>
                  <div className="mt-1 p-2.5 bg-amber-950/30 border border-amber-500/40 rounded-xs text-amber-200 leading-relaxed font-sans">
                    {selectedEvent.recommendation}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[#232b36]">
                <button
                  onClick={() => {
                    acknowledgeEvent(selectedEvent.id);
                    setSelectedEvent({ ...selectedEvent, status: 'acknowledged' });
                  }}
                  disabled={selectedEvent.status === 'acknowledged' || selectedEvent.status === 'resolved'}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xs border cursor-pointer ${
                    selectedEvent.status === 'new'
                      ? 'bg-amber-800 hover:bg-amber-700 border-amber-500 text-white'
                      : 'bg-[#1b232e] border-[#2c3746] text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {selectedEvent.status === 'new' ? 'Квитировать событие' : 'Квитировано'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedEvent(null);
                      setActiveTab('active-test');
                    }}
                    className="px-3 py-1.5 bg-[#17202b] hover:bg-[#202d3d] border border-[#2d3e52] text-sky-400 text-xs rounded-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Перейти к графику</span>
                  </button>

                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-4 py-1.5 bg-[#151c24] hover:bg-[#1a232f] text-slate-300 text-xs rounded-xs cursor-pointer"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
