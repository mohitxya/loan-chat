import React from 'react';
import { SessionProvider, useSession } from './state/sessionStore';
import { Header } from './components/Header';
import { ChatPanel } from './components/ChatPanel';
import { OutputsPanel } from './components/OutputsPanel';
import { NegotiationCard } from './components/NegotiationCard';
import { MobileSummaryStrip } from './components/MobileSummaryStrip';
import { DebugPathViewer } from './components/DebugPathViewer';

const AppContent: React.FC = () => {
  const { activeView, mobileTab } = useSession();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-20 lg:pb-8">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'negotiation_card' ? (
          <NegotiationCard />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Desktop Left (45%) / Mobile Tab 1: Conversational Chat Interface */}
            <div
              className={`lg:col-span-5 ${
                mobileTab === 'question' ? 'block' : 'hidden lg:block'
              }`}
            >
              <div className="sticky top-24">
                <ChatPanel />
              </div>
            </div>

            {/* Desktop Right (55%) / Mobile Tab 2: Live Computed Outputs */}
            <div
              className={`lg:col-span-7 ${
                mobileTab === 'numbers' ? 'block' : 'hidden lg:block'
              }`}
            >
              <OutputsPanel />
            </div>
          </div>
        )}
      </main>

      {/* Mobile Sticky Summary Bar */}
      <MobileSummaryStrip />

      {/* Logic Tree Modal */}
      <DebugPathViewer />
    </div>
  );
};

export default function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}
