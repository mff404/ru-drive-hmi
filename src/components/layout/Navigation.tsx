import React from 'react';
import { 
  LayoutDashboard, 
  PlaySquare, 
  Gauge, 
  ScrollText, 
  FileCheck2
} from 'lucide-react';
import { useBench, TabType } from '../../context/BenchContext';

interface TabItem {
  id: TabType;
  label: string;
  icon: React.ElementType;
  badge?: string | number | null;
  badgeColor?: string;
}

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, isTestRunning, events } = useBench();

  // Count unacknowledged warnings or alarms
  const unhandledEventsCount = events.filter(e => (e.level === 'warning' || e.level === 'alarm') && e.status === 'new').length;

  const tabs: TabItem[] = [
    {
      id: 'overview',
      label: 'Обзор стенда',
      icon: LayoutDashboard
    },
    {
      id: 'new-test',
      label: 'Новое испытание',
      icon: PlaySquare
    },
    {
      id: 'active-test',
      label: 'Текущее испытание',
      icon: Gauge,
      badge: isTestRunning ? 'В РАБОТЕ' : null,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
    },
    {
      id: 'logs',
      label: 'Журнал событий',
      icon: ScrollText,
      badge: unhandledEventsCount > 0 ? unhandledEventsCount : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/50'
    },
    {
      id: 'results',
      label: 'Результаты испытаний',
      icon: FileCheck2
    }
  ];

  return (
    <nav className="h-11 bg-[#0b0e12] border-b border-[#1e2632] px-4 flex items-center justify-start gap-1 select-none">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`h-full px-4 flex items-center gap-2 text-xs font-semibold tracking-tight transition-[background-color,color] duration-150 cursor-pointer relative ${
              isActive
                ? 'text-white bg-[#131922]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#10141b]'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
            <span>{tab.label}</span>

            {tab.badge && (
              <span className={`text-[10px] font-bold px-1.5 py-0.2 border rounded-xs ${tab.badgeColor}`}>
                {tab.badge}
              </span>
            )}

            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
