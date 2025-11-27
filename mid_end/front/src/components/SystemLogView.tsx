import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LogEntry {
  id: number;
  device_id: string | null;
  temperature: number | null;
  humidity: number | null;
  gas: number | null;
  event_sensor: string | null;
  event_video: string | null;
  confidence_flame: number | null;
  confidence_gas: number | null;
  timestamp: string | null;
  received_at: string | null;
}

type LogType = 'INFO' | 'WARNING' | 'DANGER' | 'ERROR';

function getLogType(entry: LogEntry): LogType {
  // 필요하면 조건을 더 세분화 가능
  if (entry.event_video || entry.event_sensor) {
    return 'WARNING';
  }
  return 'INFO';
}

function formatTimestamp(ts: string | null): string {
  if (!ts) return '-';
  // ISO 형식이면 "YYYY-MM-DDTHH:MM:SS" → "YYYY-MM-DD HH:MM:SS"
  return ts.replace('T', ' ').slice(0, 19);
}

function buildMessage(entry: ApiLogEntry): string {
  const dev = entry.device_id ?? 'Unknown';
  const parts: string[] = [`[${dev}]`];

  if (entry.event_sensor) {
    parts.push(
      `센서 이벤트: ${entry.event_sensor}` +
      ` (T=${entry.temperature ?? '-'}°C, Gas=${entry.gas ?? '-'}ppm, 가스 conf=${entry.confidence_gas ?? '-'}%)`
    );
  }

  if (entry.event_video) {
    parts.push(
      `영상 이벤트: ${entry.event_video}` +
      ` (불꽃 conf=${entry.confidence_flame ?? '-'}%)`
    );
  }

  if (!entry.event_sensor && !entry.event_video) {
    parts.push('정상 동작');
  }

  return parts.join(' | ');
}

function getLogBadgeColor(type: LogType) {
  switch (type) {
    case 'INFO':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'WARNING':
      return 'bg-yellow-500 hover:bg-yellow-600';
    case 'ERROR':
      return 'bg-red-500 hover:bg-red-600';
    case 'DANGER':
      return 'bg-red-500 hover:bg-red-600';
    default:
      return 'bg-gray-500 hover:bg-gray-600';
  }
}

const PAGE_SIZE = 20;

export function SystemLogView() {
  const [currentPage, setCurrentPage] = useState(1);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        const res = await fetch(`/api/logs?page=${currentPage}&page_size=${PAGE_SIZE}`);

        if (!res.ok) {
          // 백엔드 에러 메시지를 그대로 찍어보면 디버깅에 도움 됨
          const text = await res.text();
          console.error('Failed to fetch logs:', res.status, text);
          return;
        }

        const data = await res.json();

        setLogs(data.logs);
        setTotalPages(data.total_pages || 1);
      } catch (err) {
        console.error('fetchLogs error', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [currentPage]);

  const renderPageNumbers = () => {
    const pages: (number | -1)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

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
      <h1 className="text-lg mb-3 flex-shrink-0 font-bold pt-[0px] pr-[0px] pb-[0px] pl-[5px]">
        시스템 로그
      </h1>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="pt-3 flex-1 flex flex-col overflow-hidden">
          <div className="space-y-2 flex-1 overflow-y-auto">
            {loading && (
              <div className="text-xs text-gray-500 py-2">
                로그 불러오는 중...
              </div>
            )}
            {!loading && logs.length === 0 && (
              <div className="text-xs text-gray-500 py-2">
                로그가 없습니다.
              </div>
            )}
            {!loading &&
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 py-1.5 border-b last:border-b-0"
                >
                  <span className="text-xs text-gray-600 w-32 flex-shrink-0">
                    {log.time ?? '-'}
                  </span>
                  <Badge
                    className={`${getLogBadgeColor(log.type)} text-xs px-2 py-0`}
                  >
                    {log.type}
                  </Badge>
                  <span className="text-xs flex-1">
                    {log.message}
                  </span>
                </div>
              ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-1 mt-3 pt-3 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-3 h-3 mr-0.5" />
              Previous
            </Button>

            {renderPageNumbers().map((page, index) =>
              page === -1 ? (
                <span key={`ellipsis-${index}`} className="px-1 text-xs">
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-7 px-2 text-xs ${
                    currentPage === page
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : ''
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
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
