import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LogEntry {
  id: string;
  time: string;
  type: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
}

export function SystemLogView() {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Mock log data
  const logs: LogEntry[] = [
    { id: '1', time: '2025-10-16 19:00:00', type: 'INFO', message: '[SensorHub] AI 모델 추론 완료' },
    { id: '2', time: '2025-10-16 19:00:00', type: 'INFO', message: '[SensorHub] 네트워크 상태 점검 완료' },
    { id: '3', time: '2025-10-16 19:00:00', type: 'WARNING', message: '[QT2] 가스 감지 (300ppm)' },
    { id: '4', time: '2025-10-16 19:00:00', type: 'INFO', message: '[SensorHub] AI 모델 추론 완료' },
    { id: '5', time: '2025-10-16 19:00:00', type: 'INFO', message: '[SensorHub] AI 모델 추론 완료' },
    { id: '6', time: '2025-10-16 19:00:00', type: 'INFO', message: '[SensorHub] AI 모델 추론 완료' },
    { id: '7', time: '2025-10-16 19:00:00', type: 'INFO', message: '[SensorHub] AI 모델 추론 완료' },
    { id: '8', time: '2025-10-16 19:00:00', type: 'INFO', message: '[SensorHub] AI 모델 추론 완료' },
  ];

  const totalPages = 11;

  const getLogBadgeColor = (type: string) => {
    switch (type) {
      case 'INFO':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'WARNING':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'ERROR':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (currentPage <= 3) {
      for (let i = 1; i <= Math.min(maxVisible, totalPages); i++) {
        pages.push(i);
      }
      if (totalPages > maxVisible) {
        pages.push(-1);
        pages.push(totalPages);
      }
    } else if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push(-1);
      for (let i = totalPages - 4; i <= totalPages; i++) {
        if (i > 1) pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push(-1);
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push(-1);
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <h1 className="text-lg mb-3 flex-shrink-0 font-bold pt-[0px] pr-[0px] pb-[0px] pl-[5px]">시스템 로그</h1>
      
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="pt-3 flex-1 flex flex-col overflow-hidden">
          <div className="space-y-2 flex-1 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 py-1.5 border-b last:border-b-0">
                <span className="text-xs text-gray-600 w-32 flex-shrink-0">{log.time}</span>
                <Badge className={`${getLogBadgeColor(log.type)} text-xs px-2 py-0`}>
                  {log.type}
                </Badge>
                <span className="text-xs flex-1">{log.message}</span>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-center gap-1 mt-3 pt-3 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-3 h-3 mr-0.5" />
              Previous
            </Button>
            
            {renderPageNumbers().map((page, index) => (
              page === -1 ? (
                <span key={`ellipsis-${index}`} className="px-1 text-xs">...</span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="sm"
                  className={`h-7 px-2 text-xs ${currentPage === page ? "bg-blue-500 hover:bg-blue-600" : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            ))}
            
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
