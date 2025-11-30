import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';
import svgPaths from '../imports/svg-ky8ajppq4y';

const buildDateTime = (date: Date, timeStr: string) => {
  const [hStr, mStr] = timeStr.split(":");
  const h = parseInt(hStr ?? "0", 10);
  const m = parseInt(mStr ?? "0", 10);
  const d = new Date(date); // 원본 보존
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
};

// ✅ 추가: Date -> 'YYYY-MM-DDTHH:MM:SS' (로컬 기준) 문자열
const toLocalTimestampString = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// Helper function to format date
const formatDate = (date: Date | undefined) => {
  if (!date) return '';
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

// Helper function to format date for chart (MM/DD)
const formatChartDate = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}`;
};

// Generate mock data based on date range
const generateMockData = (startDate: Date | undefined, endDate: Date | undefined) => {
  if (!startDate || !endDate) return [];
  
  const data = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Generate data for each day between start and end
  for (let i = 0; i < daysDiff; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    
    data.push({
      date: formatChartDate(currentDate),
      fullDate: currentDate.toLocaleDateString('ko-KR'),
      temperature: 20 + Math.random() * 80,
      smoke: 300 + Math.random() * 9700,
    });
  }
  
  return data;
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#c1c7cd] rounded-lg shadow-lg p-3">
        <p className="text-sm text-[#21272a] mb-2">{payload[0].payload.fullDate}</p>
        <p className="text-sm text-[#697077]">
          온도: <span className="font-medium text-[#21272a]">{payload[0].value?.toFixed(1)}°C</span>
        </p>
        <p className="text-sm text-[#697077]">
          연기: <span className="font-medium text-[#21272a]">{payload[1].value?.toFixed(0)}ppm</span>
        </p>
      </div>
    );
  }
  return null;
};

export function DataRetrievalView() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [chartData, setChartData] = useState<any[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");

  const [videoFrames, setVideoFrames] = useState<{ timestamp: string; url: string }[]>([]);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackFps, setPlaybackFps] = useState(3);  // 화면에서 3fps 정도로 재생  

  const toDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isAvailableDate = (date: Date) => {
    const key = toDateKey(date);
    return availableDates.includes(key);
  };

  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/available-dates");
        const data = await res.json();
        // data.dates: ["2025-11-20", "2025-11-21", ...]
        setAvailableDates(data.dates || []);
      } catch (err) {
        console.error("failed to fetch available dates", err);
      }
    };
    fetchAvailableDates();
  }, []);

   // ✅ 추가: 가짜 영상 재생용 타이머
  useEffect(() => {
    if (!isPlaying || videoFrames.length === 0) return;

    const interval = 1000 / playbackFps;
    const id = window.setInterval(() => {
      setSelectedFrameIndex((prev) => {
        if (videoFrames.length === 0) return 0;
        return (prev + 1) % videoFrames.length; // 끝까지 가면 다시 처음으로
      });
    }, interval);

    return () => window.clearInterval(id);
  }, [isPlaying, playbackFps, videoFrames.length]);

const handleSearch = async () => {
  if (!startDate || !endDate) return;

  const start = buildDateTime(startDate, startTime);
  const end = buildDateTime(endDate, endTime);

  // ✅ KST 기준 로컬 문자열로 변환 (백엔드 DB timestamp와 같은 포맷)
  const startStr = toLocalTimestampString(start);
  const endStr = toLocalTimestampString(end);

  try {
    // 1) 센싱 데이터 조회
    const res = await fetch(
      `http://localhost:8000/api/data?start_dt=${encodeURIComponent(
        startStr,
      )}&end_dt=${encodeURIComponent(endStr)}`
    );
    const json = await res.json();
    const rows = json.data || [];

    const mapped = rows.map((row: any) => {
      const tsStr: string = row.timestamp ?? "";
      if (!tsStr) {
        return null;
      }

      // 'YYYY-MM-DDTHH:MM:SS'를 로컬 시간으로 해석
      const d = new Date(tsStr);

      return {
        date: d.toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        fullDate: d.toLocaleString("ko-KR"),
        temperature: row.temperature ?? 0,
        smoke: row.gas ?? 0,
      };
    }).filter((x) => x !== null);

    setChartData(mapped);

    // 2) 영상 프레임 조회
    const vRes = await fetch(
      `http://localhost:8000/api/video_frames?start_dt=${encodeURIComponent(
        startStr,
      )}&end_dt=${encodeURIComponent(endStr)}`
    );
    const vJson = await vRes.json();
    const frames = (vJson.frames || []).map((f: any) => ({
      timestamp: f.timestamp,
      url: `http://localhost:8000${f.url}`,  // 백엔드에서 준 상대 경로 앞에 붙이기
    }));

    setVideoFrames(frames);
    setSelectedFrameIndex(0);
    setIsPlaying(false)
  } catch (err) {
    console.error("failed to fetch data or video frames", err);
    setChartData([]);
    setVideoFrames([]);
  }
};

  return (
    <div className="bg-white rounded-lg p-3 h-full flex flex-col overflow-hidden">
      {/* Headline */}
      <div className="mb-2 flex-shrink-0">
        <h1 className="font-['Roboto'] font-bold text-lg leading-[1.1] text-[#21272a]" style={{ fontVariationSettings: "'wdth' 100" }}>
          센싱 데이터 조회
        </h1>
      </div>

      {/* Date Fields */}
      <div className="flex items-center gap-0 mb-3 flex-shrink-0">
        <Popover>
          <PopoverTrigger asChild>
            <div className="bg-white border-b border-[#c1c7cd] flex items-center px-2 py-1.5 h-[32px] cursor-pointer hover:bg-gray-50">
              <p className="font-['Roboto'] font-normal text-xs leading-[1.4] text-[#697077] w-[90px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                {startDate ? formatDate(startDate) : 'Start date'}
              </p>
              <div className="ml-1 w-[16px] h-[16px]">
                <div className="w-full h-full">
                  <svg className="block w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 18">
                    <path d={svgPaths.p12f70500} fill="#697077" />
                  </svg>
                </div>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
              disabled={(date) => 
                // 아직 서버에서 날짜 목록을 못 받았을 때는 모두 선택 가능
                availableDates.length > 0 && !isAvailableDate(date)
              }
            />
          </PopoverContent>
        </Popover>

        {/* Arrow Icon */}
        <div className="bg-[#dde1e6] border-b border-[#c1c7cd] h-[32px] w-[32px] flex items-center justify-center">
          <div className="w-[16px] h-[16px]">
            <svg className="block w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
              <path d={svgPaths.pf6d0c00} fill="#697077" />
            </svg>
          </div>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <div className="bg-white border-b border-[#c1c7cd] flex items-center px-2 py-1.5 h-[32px] cursor-pointer hover:bg-gray-50">
              <p className="font-['Roboto'] font-normal text-xs leading-[1.4] text-[#697077] w-[90px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                {endDate ? formatDate(endDate) : 'End date'}
              </p>
              <div className="ml-1 w-[16px] h-[16px]">
                <div className="w-full h-full">
                  <svg className="block w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 18">
                    <path d={svgPaths.p12f70500} fill="#697077" />
                  </svg>
                </div>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
              disabled={(date) =>
                availableDates.length > 0 && !isAvailableDate(date)
              }
            />
          </PopoverContent>
        </Popover>

        <Button
          onClick={handleSearch}
          className="ml-2 px-4 h-8 text-xs"
          style={{ backgroundColor: '#0f62fe' }}
          disabled={!startDate || !endDate}
        >
          조회
        </Button>
      </div>

      {/* Time Fields */}
      <div className="flex items-center gap-4 mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="time"
            className="border border-[#c1c7cd] rounded-md px-2 py-1 text-xs bg-white h-[28px]"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="time"
            className="border border-[#c1c7cd] rounded-md px-2 py-1 text-xs bg-white h-[28px]"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-2 gap-3 flex-1 overflow-hidden">
        {/* Left: Chart */}
        <Card className="border border-[#dde1e6] flex flex-col overflow-hidden">
          <CardContent className="p-2 flex flex-col h-full overflow-hidden">
            <div className="mb-2 flex-shrink-0">
              <h2 className="font-['Roboto'] font-bold text-sm leading-[1.1] text-[#21272a] mb-2" style={{ fontVariationSettings: "'wdth' 100" }}>
                화재 데이터
              </h2>
              
              {/* Legend */}
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-0.5">
                  <div className="w-3 h-3">
                    <svg className="block w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
                      <path d={svgPaths.p299c4700} fill="#697077" />
                    </svg>
                  </div>
                  <p className="font-['Roboto'] font-normal text-xs leading-[1.4] text-[#697077]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    온도
                  </p>
                </div>
                <div className="flex items-center gap-0.5">
                  <div className="w-3 h-3">
                    <svg className="block w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
                      <path d={svgPaths.p299c4700} fill="#DDE1E6" />
                    </svg>
                  </div>
                  <p className="font-['Roboto'] font-normal text-xs leading-[1.4] text-[#697077]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    연기
                  </p>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="flex-1 min-h-0">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="0" stroke="#DDE1E6" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fill: '#697077', fontFamily: 'Inter' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      yAxisId="left"
                      domain={[0, 100]}
                      ticks={[0, 20, 40, 60, 80, 100]}
                      tick={{ fontSize: 12, fill: '#697077', fontFamily: 'Inter' }}
                      axisLine={false}
                      tickLine={false}
                      width={48}
                      label={{ value: '°C', position: 'insideTop', offset: 10, style: { fontSize: 12, fill: '#697077', fontFamily: 'Inter' } }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 10000]}
                      ticks={[300, 10000]}
                      tick={{ fontSize: 12, fill: '#697077', fontFamily: 'Inter' }}
                      axisLine={false}
                      tickLine={false}
                      width={60}
                      label={{ value: 'ppm', position: 'insideTop', offset: 10, style: { fontSize: 12, fill: '#697077', fontFamily: 'Inter' } }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#878D96" 
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={true}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="smoke" 
                      stroke="#C1C7CD" 
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                  날짜를 선택하고 조회 버튼을 눌러주세요
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: Video/Image Area */}
        <div className="h-full bg-[#dde1e6] relative flex items-center justify-center rounded-lg overflow-hidden">
          {videoFrames.length > 0 ? (
            <>
              <img
                src={videoFrames[selectedFrameIndex].url}
                alt="조회 구간 영상 프레임"
                className="w-full h-full object-contain"
              />

              {/* 하단 컨트롤 바 */}
              <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1 text-[11px] text-gray-100">
                {/* 타임라인 슬라이더 */}
                <input
                  type="range"
                  min={0}
                  max={Math.max(videoFrames.length - 1, 0)}
                  value={selectedFrameIndex}
                  onChange={(e) => {
                    setSelectedFrameIndex(Number(e.target.value));
                  }}
                  className="w-full"
                />

                {/* 버튼들 */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {/* 재생 / 일시정지 */}
                    <button
                      className="px-2 py-0.5 rounded bg-[rgba(0,0,0,0.4)]"
                      onClick={() => setIsPlaying((prev) => !prev)}
                      disabled={videoFrames.length === 0}
                    >
                      {isPlaying ? "⏸" : "▶"}
                    </button>

                    {/* 프레임 이동 */}
                    <button
                      className="px-2 py-0.5 rounded bg-[rgba(0,0,0,0.4)] disabled:opacity-40"
                      disabled={selectedFrameIndex === 0}
                      onClick={() => {
                        setIsPlaying(false);
                        setSelectedFrameIndex((idx) => Math.max(0, idx - 1));
                      }}
                    >
                      ◀
                    </button>
                    <button
                      className="px-2 py-0.5 rounded bg-[rgba(0,0,0,0.4)] disabled:opacity-40"
                      disabled={selectedFrameIndex === videoFrames.length - 1}
                      onClick={() => {
                        setIsPlaying(false);
                        setSelectedFrameIndex((idx) =>
                          Math.min(videoFrames.length - 1, idx + 1),
                        );
                      }}
                    >
                      ▶
                    </button>
                  </div>

                  {/* 현재 위치 & 재생 속도 */}
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[rgba(0,0,0,0.4)]">
                      {selectedFrameIndex + 1} / {videoFrames.length}
                    </span>

                    <select
                      className="bg-[rgba(0,0,0,0.4)] px-2 py-0.5 rounded"
                      value={playbackFps}
                      onChange={(e) => setPlaybackFps(Number(e.target.value))}
                    >
                      <option value={1}>1x</option>
                      <option value={2}>2x</option>
                      <option value={3}>3x</option>
                      <option value={5}>5x</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-[120px] h-[120px] bg-[#dde1e6] flex flex-col items-center justify-center text-xs text-gray-500">
              <div className="mb-2">
                {/* 기존 X 아이콘 그대로 써도 되고 생략해도 됨 */}
                <svg
                  className="w-10 h-10 text-white"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="20" y="20" width="160" height="160" fill="#dde1e6" rx="8" />
                  <line
                    x1="40"
                    y1="40"
                    x2="160"
                    y2="160"
                    stroke="white"
                    strokeWidth="12"
                  />
                  <line
                    x1="160"
                    y1="40"
                    x2="40"
                    y2="160"
                    stroke="white"
                    strokeWidth="12"
                  />
                </svg>
              </div>
              {chartData.length === 0 ? (
                <span>날짜를 선택하고 조회를 수행하면</span>
              ) : (
                <span>해당 기간에 저장된 영상이 없습니다</span>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
