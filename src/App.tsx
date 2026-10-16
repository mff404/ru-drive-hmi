import React from 'react';
import { BenchProvider, useBench } from './context/BenchContext';
import { TopBar } from './components/layout/TopBar';
import { Navigation } from './components/layout/Navigation';
import { BenchOverview } from './components/overview/BenchOverview';
import { NewTestWizard } from './components/new-test/NewTestWizard';
import { ActiveTestView } from './components/active-test/ActiveTestView';
import { EventLogView } from './components/logs/EventLogView';
import { TestResultsView } from './components/results/TestResultsView';

const MainWorkspace: React.FC = () => {
  const { activeTab } = useBench();

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0b0d10] text-[#e2e8f0] overflow-hidden">
      {/* Top Header */}
      <TopBar />

      {/* Navigation Tabs */}
      <Navigation />

      {/* Dynamic Screen Content */}
      <main className="flex-1 overflow-y-auto relative overscroll-contain">
        {activeTab === 'overview' && <BenchOverview />}
        {activeTab === 'new-test' && <NewTestWizard />}
        {activeTab === 'active-test' && <ActiveTestView />}
        {activeTab === 'logs' && <EventLogView />}
        {activeTab === 'results' && <TestResultsView />}
      </main>

      {/* Industrial Bottom Status Bar */}
      <footer className="h-7 bg-[#090c0f] border-t border-[#1a212b] px-4 flex items-center justify-between text-[11px] font-mono text-slate-500 select-none shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-400">RU-DRIVE HMI v2.4-PROD</span>
          <span>•</span>
          <span className="text-slate-400">Цикл ПЛК: <strong className="text-slate-300 font-semibold">50 мкс</strong></span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Modbus TCP 100 Mbps (OK)
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Оптика ШИМ синхронизирована
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <span>Сенсорный терминал Full HD</span>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <BenchProvider>
      <MainWorkspace />
    </BenchProvider>
  );
}

export default App;
