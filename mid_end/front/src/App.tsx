import { useState } from 'react';
import { Monitor, Database, FileText, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { DashboardView } from './components/DashboardView';
import { DataRetrievalView } from './components/DataRetrievalView';
import { SystemLogView } from './components/SystemLogView';
import { SettingsView } from './components/SettingsView';
import { ThresholdProvider } from './components/ThresholdContext';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <ThresholdProvider>
      <div className="h-screen overflow-hidden flex flex-col" style={{ backgroundColor: '#F2F4F8', width: '1146px', height: '645px' }}>
      {/* Header */}
      <header className="text-white p-2 flex-shrink-0" style={{ backgroundColor: '#878D96' }}>
        <div className="flex items-center gap-2 p-0">
          <Monitor className="w-5 h-5" />
        </div>
      </header>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b flex-shrink-0">
          <div className="p-[0px]">
            <TabsList className="h-10 bg-transparent border-b-0 rounded-none justify-start p-0">
              <TabsTrigger 
                value="dashboard" 
                className="rounded-none border-b-3 border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 h-full pb-0 text-sm"
                style={{ 
                  borderBottomColor: activeTab === 'dashboard' ? '#001D6C' : 'transparent',
                  color: activeTab === 'dashboard' ? '#001D6C' : '#21272A'
                }}
              >
                <Monitor className="w-3.5 h-3.5 mr-1.5" />
                통합 분석
              </TabsTrigger>
              <TabsTrigger 
                value="data-retrieval" 
                className="rounded-none border-b-3 border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 h-full pb-0 text-sm"
                style={{ 
                  borderBottomColor: activeTab === 'data-retrieval' ? '#001D6C' : 'transparent',
                  color: activeTab === 'data-retrieval' ? '#001D6C' : '#21272A'
                }}
              >
                <Database className="w-3.5 h-3.5 mr-1.5" />
                데이터 조회
              </TabsTrigger>
              <TabsTrigger 
                value="logs" 
                className="rounded-none border-b-3 border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 h-full pb-0 text-sm"
                style={{ 
                  borderBottomColor: activeTab === 'logs' ? '#001D6C' : 'transparent',
                  color: activeTab === 'logs' ? '#001D6C' : '#21272A'
                }}
              >
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                로그
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="rounded-none border-b-3 border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 h-full pb-0 text-sm"
                style={{ 
                  borderBottomColor: activeTab === 'settings' ? '#001D6C' : 'transparent',
                  color: activeTab === 'settings' ? '#001D6C' : '#21272A'
                }}
              >
                <Settings className="w-3.5 h-3.5 mr-1.5" />
                설정
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="flex-1 overflow-hidden px-4 py-3 pt-[0px] pr-[10px] pb-[10px] pl-[10px]">
          <TabsContent value="dashboard" className="m-0 h-full">
            <DashboardView />
          </TabsContent>
          
          <TabsContent value="data-retrieval" className="m-0 h-full">
            <DataRetrievalView />
          </TabsContent>
          
          <TabsContent value="logs" className="m-0 h-full">
            <SystemLogView />
          </TabsContent>
          
          <TabsContent value="settings" className="m-0 h-full">
            <SettingsView />
          </TabsContent>
        </div>
      </Tabs>
      <Toaster />
    </div>
    </ThresholdProvider>
  );
}
