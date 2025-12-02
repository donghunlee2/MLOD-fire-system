import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { AlertTriangle, Flame, Cloud, CheckCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { useThresholds } from './ThresholdContext';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import alertIcon from 'figma:asset/dbb89de7172aace23a6f296e68a4212f6ad1c129.png';

interface AlertMessage {
  id: number;
  type: 'danger' | 'warning';
  message: string;
  time: string;
  confirmed?: boolean;
}

export function DashboardView() {
  const { thresholds } = useThresholds();
  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity]       = useState<number | null>(null);
  const [smoke, setSmoke] = useState<number | null>(null);
  const [videoFlame, setVideoFlame] = useState<number | null>(null);
  const [videoSmoke, setVideoSmoke] = useState<number | null>(null);
  const [deviceId, setDeviceId]       = useState<string | null>(null);
  const [timestamp, setTimestamp]     = useState<string | null>(null);
  
  const [showFireDialog, setShowFireDialog] = useState(false);
  const [fireDetectionTime, setFireDetectionTime] = useState('');
  const [fireDetectionImage, setFireDetectionImage] = useState<string>('');
  const [hasSpokenAlert, setHasSpokenAlert] = useState(false);
  
  const [lastEventType, setLastEventType] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);

  const [prevVideoFlameStatus, setPrevVideoFlameStatus] = useState<string>('정상');
  const [prevVideoSmokeStatus, setPrevVideoSmokeStatus] = useState<string>('정상');

  // 🔥 알람 시점 근처의 프레임 가져오기
  const fetchFireFrame = async (eventTimestamp?: string | null) => {
    try {
      // 이벤트 시각(센서 timestamp) 기준 ±60초 범위 검색
      const baseTime = eventTimestamp ? new Date(eventTimestamp) : new Date();
      const start = new Date(baseTime.getTime() - 60_000);
      const end   = new Date(baseTime.getTime() + 60_000);

      const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T` +
        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;

      const startStr = fmt(start);
      const endStr   = fmt(end);

      // 백엔드에서 프레임 목록 조회
      const backendBase = 'http://localhost:8000'; // DataRetrievalView에서 쓰던 것과 동일하게 사용
      const res = await fetch(
        `${backendBase}/api/video_frames?start_dt=${encodeURIComponent(startStr)}&end_dt=${encodeURIComponent(endStr)}`
      );

      if (!res.ok) {
        console.error('failed to fetch video_frames', res.status);
        setFireDetectionImage('');
        return;
      }

      const json = await res.json();

      if (json.frames && json.frames.length > 0) {
        // 가장 마지막(가장 최근) 프레임 사용
        const frame = json.frames[json.frames.length - 1];
        setFireDetectionImage(`${backendBase}${frame.url}`);
      } else {
        setFireDetectionImage('');
      }
    } catch (e) {
      console.error('fire frame fetch error', e);
      setFireDetectionImage('');
    }
  };

  // 실시간 데이터 구독
  useEffect(() => {
    const API = "/api"; // 프록시 사용 중. 아니면 "http://localhost:8000"
    const es = new EventSource(`${API}/stream`);

    es.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        // json 스키마에 맞춰 매핑
        if (d.temperature !== undefined) setTemperature(d.temperature);
        if (d.humidity !== undefined)    setHumidity(d.humidity);
        if (d.gas !== undefined)         setSmoke(d.gas);
        if (d.device_id !== undefined)   setDeviceId(d.device_id);
        if (d.timestamp !== undefined)   setTimestamp(d.timestamp);
        if (d.confidence_flame !== undefined) {
          setVideoFlame(Number(d.confidence_flame));
        }
        if (d.confidence_gas !== undefined) {
          setVideoSmoke(Number(d.confidence_gas));
        }

        // 🔥 event_sensor / event_video 기반 경고 & AlertDialog
        const eventSensor = d.event_sensor ?? null;
        const eventVideo  = d.event_video ?? null;

        const hasSensorEvent = typeof d.event_sensor === "string" && d.event_sensor !== "none";
        const hasVideoEvent  = typeof d.event_video === "string" && d.event_video !== "none";

        // 둘 중 하나라도 이벤트가 있으면 경고 리스트에 추가
        if (hasSensorEvent || hasVideoEvent) {
          const nowStr = new Date().toLocaleTimeString('ko-KR');

          // event 타입 정리: 'both' | 'sensor' | 'video'
          let eventType: string;
          if (hasSensorEvent && hasVideoEvent) eventType = 'both';
          else if (hasSensorEvent) eventType = 'sensor';
          else eventType = 'video';

          setLastEventType(eventType);

          // ✅ 여기서 "alert 창" 조건: sensor + video 둘 다 있을 때만 true
          const isFire = hasSensorEvent && hasVideoEvent;

          const type: AlertMessage['type'] = isFire ? 'danger' : 'warning';
          const message = isFire
            ? '화재 위험이 감지되었습니다.'
            : hasSensorEvent
              ? '센서 데이터에서 이상 징후가 감지되었습니다.'
              : '영상 분석에서 이상 징후가 감지되었습니다.';

          // ⚠️ 오른쪽 경고 리스트에 추가
          setAlerts(prev => [
            {
              id: Date.now(),
              type,
              message,
              time: nowStr,
            },
            ...prev,
          ]);

          // ✅ 🔔 "alert 창(모달) + TTS"는 sensor & video 둘 다 있을 때만
          if (isFire) {
            const now = new Date();
            const formattedTime =
              `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ` +
              `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

            setFireDetectionTime(formattedTime);
            setShowFireDialog(true);

            setFireDetectionImage('');
            fetchFireFrame(d.timestamp ?? null);

            if ("speechSynthesis" in window) {
              const msg = new SpeechSynthesisUtterance("화재가 감지되었습니다. 즉시 대피하세요.");
              msg.lang = "ko-KR";
              msg.rate = 1.0;
              msg.pitch = 1.0;
              window.speechSynthesis.speak(msg);
            }
          }
        }

      } catch (err) {
        console.error("SSE parse error", err);
      }
    };


    es.onerror = (e) => console.warn("SSE error", e);
    return () => es.close();
  }, []);

  // 🔥 영상 화염 confidence 기반 경고 메시지
  useEffect(() => {
    // ✅ event가 'both'면 개별 영상 경고는 생성하지 않음
    if (lastEventType === 'both') return;

    const status = getVideoFlameStatus(); // '정상' | '주의' | '위험'

    if (status !== prevVideoFlameStatus) {
      if (status === '주의' || status === '위험') {
        const nowStr = new Date().toLocaleTimeString('ko-KR');
        setAlerts(prev => [
          {
            id: Date.now(),
            type: status === '위험' ? 'danger' : 'warning',
            message: `영상 기반 화염 감지: ${videoFlame !== null ? videoFlame.toFixed(1) : '0'}%`,
            time: nowStr,
          },
          ...prev,
        ]);
      }
      setPrevVideoFlameStatus(status);
    }
  }, [videoFlame, thresholds.video.warning, thresholds.video.danger, lastEventType]);

  // ☁️ 영상 연기 confidence 기반 경고 메시지
  useEffect(() => {
    // ✅ event가 'both'면 개별 영상 경고는 생성하지 않음
    if (lastEventType === 'both') return;

    const status = getVideoSmokeStatus(); // '정상' | '주의' | '위험'

    if (status !== prevVideoSmokeStatus) {
      if (status === '주의' || status === '위험') {
        const nowStr = new Date().toLocaleTimeString('ko-KR');
        setAlerts(prev => [
          {
            id: Date.now() + 1,
            type: status === '위험' ? 'danger' : 'warning',
            message: `영상 기반 연기 감지: ${videoSmoke !== null ? videoSmoke.toFixed(1) : '0'}%`,
            time: nowStr,
          },
          ...prev,
        ]);
      }
      setPrevVideoSmokeStatus(status);
    }
  }, [videoSmoke, thresholds.video.warning, thresholds.video.danger, lastEventType]);

  const getTempStatus = () => {
    if (temperature < thresholds.temperature.warning) return '정상';
    if (temperature < thresholds.temperature.danger) return '주의';
    return '위험';
  };

  const getSmokeStatus = () => {
    if (smoke < thresholds.smoke.warning) return '정상';
    if (smoke < thresholds.smoke.danger) return '주의';
    return '위험';
  };

  const getVideoFlameStatus = () => {
    const v = videoFlame ?? 0;
    if (videoFlame < thresholds.video.warning) return '정상';
    if (videoFlame < thresholds.video.danger) return '주의';
    return '위험';
  };

  const getVideoSmokeStatus = () => {
    const v = videoSmoke ?? 0;
    if (videoSmoke < thresholds.video.warning) return '정상';
    if (videoSmoke < thresholds.video.danger) return '주의';
    return '위험';
  };

  const getVideoIconColor = (status: string) => {
    switch (status) {
      case '정상':
        return 'text-gray-400';
      case '주의':
        return 'text-yellow-400';
      case '위험':
        return 'text-red-700';
      default:
        return 'text-gray-400';
    }
  };

  const removeAlert = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const confirmAlert = (id: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, confirmed: true } : alert
    ));
  };

  const getAlertColor = (type: string, confirmed?: boolean) => {
    if (confirmed) {
      return 'bg-[#25A249]/10 border-l-[3px] border-l-[#25A249]';
    }
    switch (type) {
      case 'danger':
        return 'bg-[#DA1E28]/10 border-l-[3px] border-l-[#DA1E28]';
      case 'warning':
        return 'bg-[#F1C21B]/10 border-l-[3px] border-l-[#F1C21B]';
      default:
        return 'bg-gray-50 border-l-[3px] border-l-gray-500';
    }
  };

  const getAlertIcon = (type: string, confirmed?: boolean) => {
    if (confirmed) {
      return <CheckCircle className="w-4 h-4" style={{ color: '#25A249' }} />;
    }
    switch (type) {
      case 'danger':
        return <AlertTriangle className="w-4 h-4" style={{ color: '#DA1E28' }} />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" style={{ color: '#F1C21B' }} />;
      default:
        return null;
    }
  };
  
  const getAlertBadgeText = (type: string, confirmed?: boolean) => {
    if (confirmed) {
      return '[확인됨]';
    }
    switch (type) {
      case 'danger':
        return '[Danger]';
      case 'warning':
        return '[Warning]';
      default:
        return '';
    }
  };
  
  const getAlertBadgeColor = (type: string, confirmed?: boolean) => {
    if (confirmed) {
      return '#25A249';
    }
    switch (type) {
      case 'danger':
        return '#DA1E28';
      case 'warning':
        return '#F1C21B';
      default:
        return '#gray';
    }
  };

  return (
    <div className="relative w-full h-full grid grid-cols-3 gap-3">
      {/* Left Column - Main Dashboard */}
      <div className="col-span-2 space-y-3 overflow-hidden flex flex-col">
        {/* Fire Risk Card */}
        <Card className="flex-shrink-0">
          <CardHeader className="flex flex-row items-center justify-between pb-[0px] pt-[12px] px-3 pr-[12px] pl-[12px]">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" style={{ color: '#DA1E28' }} />
              <CardTitle className="text-sm">화재 위험도</CardTitle>
            </div>
            <Badge style={{ backgroundColor: '#F1C21B' }} className="hover:opacity-90 text-xs px-2 py-0">주의</Badge>
          </CardHeader>
          <CardContent className="px-3 pt-[0px] pr-[12px] pb-[24px] pl-[12px]">
            <div className="space-y-2">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-bold">화재 감지 설정값</span>
                </div>
              </div>
              
              {/* Temperature Bar */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs">온도</span>
                </div>
                <div className="flex h-6 gap-0">
                  <div className="bg-green-500 flex-1 flex items-center justify-center text-white text-[10px]">
                    {thresholds.temperature.warning}°C 미만
                  </div>
                  <div className="bg-yellow-400 flex-1 flex items-center justify-center text-white text-[10px]">
                    {thresholds.temperature.warning}°C 이상
                  </div>
                  <div className="bg-red-500 flex-1 flex items-center justify-center text-white text-[10px]">
                    {thresholds.temperature.danger}°C 이상
                  </div>
                </div>
              </div>

              {/* Smoke Bar */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs">연기</span>
                </div>
                <div className="flex h-6 gap-0">
                  <div className="bg-green-500 flex-1 flex items-center justify-center text-white text-[10px]">
                    {thresholds.smoke.warning}ppm 미만
                  </div>
                  <div className="bg-yellow-400 flex-1 flex items-center justify-center text-white text-[10px]">
                    {thresholds.smoke.warning}ppm 경고
                  </div>
                  <div className="bg-red-500 flex-1 flex items-center justify-center text-white text-[10px]">
                    {thresholds.smoke.danger}ppm 이상
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Data */}
        <Card className="flex-1 overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-[0px] pt-[12px] px-3 flex-shrink-0 pr-[12px] pl-[12px]">
            <CardTitle className="text-sm">실시간 데이터 현황</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-2 flex-1 overflow-hidden">
            <div className="grid grid-cols-3 gap-2 h-full">
              {/* Temperature */}
              <div className="bg-gray-50 rounded-lg p-2 space-y-2 flex flex-col">
                <div className="text-center text-gray-600 text-xs">온도</div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px]">0°C</span>
                  <span className="text-[10px]">{thresholds.temperature.danger}°C</span>
                </div>
                <Progress
                  value={(( (temperature ?? 0) / thresholds.temperature.danger) * 100)}
                  className="h-1.5"
                />
                <div
                  className={`rounded py-1.5 px-2 text-center text-xs ${
                    (temperature ?? 0) < thresholds.temperature.warning
                      ? 'bg-green-100 text-green-700'
                      : (temperature ?? 0) < thresholds.temperature.danger
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {(temperature ?? 0) < thresholds.temperature.warning
                    ? '정상'
                    : (temperature ?? 0) < thresholds.temperature.danger
                    ? '주의'
                    : '위험'}
                </div>
                <div className="text-center text-sm">
                  {temperature !== null ? `${parseFloat(temperature.toFixed(2)).toString()}°C` : '—'}
                </div>
              </div>

              {/* Smoke (gas 값을 smoke 상태에 매핑해 사용) */}
              <div className="bg-gray-50 rounded-lg p-2 space-y-2 flex flex-col">
                <div className="text-center text-gray-600 text-xs">연기</div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px]">300ppm</span>
                  <span className="text-[10px]">{thresholds.smoke.danger}ppm</span>
                </div>
                <Progress
                  value={((( (smoke ?? 300) - 300) / (thresholds.smoke.danger - 300)) * 100)}
                  className="h-1.5"
                />
                <div
                  className={`rounded py-1.5 px-2 text-center text-xs ${
                    (smoke ?? 300) < thresholds.smoke.warning
                      ? 'bg-green-100 text-green-700'
                      : (smoke ?? 300) < thresholds.smoke.danger
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {(smoke ?? 300) < thresholds.smoke.warning
                    ? '정상'
                    : (smoke ?? 300) < thresholds.smoke.danger
                    ? '주의'
                    : '위험'}
                </div>
                <div className="text-center text-sm">
                  {smoke !== null ? `${parseFloat(smoke.toFixed(2)).toString()}ppm` : '—'}
                </div>
              </div>

              {/* Light Sensor */}
              <div className="bg-gray-50 rounded-lg p-2 space-y-2 flex flex-col justify-between">
                <div className="text-center text-gray-600 text-xs">영상</div>
                <div className="flex justify-center gap-4 flex-1">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Flame className={`w-8 h-8 ${getVideoIconColor(getVideoFlameStatus())}`} />
                    <span className="text-xs">
                      {videoFlame !== null ? `${parseFloat(videoFlame.toFixed(2)).toString()}%` : '0%'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Cloud className={`w-8 h-8 ${getVideoIconColor(getVideoSmokeStatus())}`} />
                    <span className="text-xs">
                      {videoSmoke !== null ? `${parseFloat(videoSmoke.toFixed(2)).toString()}%` : '0%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Alerts */}
      <div className="h-full flex flex-col overflow-hidden">
        <Card className="h-full flex flex-col overflow-hidden">
          <CardHeader className="pb-2 pt-3 px-3 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" style={{ color: '#DA1E28' }} />
              <CardTitle className="text-sm">경고 메시지</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-8 pt-0 flex-1 overflow-y-auto space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-2 rounded ${getAlertColor(alert.type, alert.confirmed)} relative`}>
                <div className="flex items-start gap-2">
                  {getAlertIcon(alert.type, alert.confirmed)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px]" style={{ color: getAlertBadgeColor(alert.type, alert.confirmed) }}>
                        {getAlertBadgeText(alert.type, alert.confirmed)}
                      </span>
                      <span className="text-[10px] text-gray-700">{alert.time}</span>
                    </div>
                    <p className="text-xs text-gray-700">{alert.message}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 hover:bg-transparent flex-shrink-0"
                    onClick={() => removeAlert(alert.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                {!alert.confirmed && (
                  <div className="mt-2 pl-6">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full h-6 text-xs"
                      style={{ 
                        borderColor: '#0F62FE', 
                        color: '#0F62FE', 
                        borderWidth: '1px',
                        backgroundColor: 'transparent'
                      }}
                      onClick={() => confirmAlert(alert.id)}
                    >
                      확인
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Fire Alert Dialog */}
      <AlertDialog open={showFireDialog} onOpenChange={setShowFireDialog}>
        <AlertDialogContent className="max-w-[700px] p-0 gap-0 overflow-hidden rounded-[16px] border-[#DDE1E6]">
          {/* Image Section */}
          <div className="w-full h-[300px] bg-[#DDE1E6] flex items-center justify-center overflow-hidden">
            {fireDetectionImage ? (
              <img 
                src={fireDetectionImage} 
                alt="화재 감지 이미지" 
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <AlertTriangle className="w-16 h-16 text-[#DA1E28]" />
                <span className="text-gray-500 text-sm">영상 감지 이미지 대기중</span>
              </div>
            )}
          </div>
          
          {/* Content Section */}
          <div className="relative h-[230px] px-8 pt-8 pb-6 flex flex-col items-center">
            <AlertDialogTitle className="text-center text-[24px] mb-4" style={{ fontFamily: 'Roboto', fontWeight: '700', lineHeight: '1.2', color: '#21272A' }}>
              화재가 감지되었습니다.
            </AlertDialogTitle>
            
            <div className="w-full max-w-[600px] mb-6">
              <div className="flex justify-center gap-6 text-[16px]" style={{ fontFamily: 'Roboto', lineHeight: '1.5', color: '#21272A' }}>
                <div className="text-left" style={{ width: '70px' }}>
                  <div>발생시간</div>
                  <div>감지된 값</div>
                </div>
                <div className="text-left" style={{ width: '200px' }}>
                  <div>{fireDetectionTime}</div>
                  <div>{Math.round(temperature)}°C, {Math.round(smoke)}ppm</div>
                </div>
              </div>
            </div>
            
            <AlertDialogFooter className="w-full max-w-[600px] pt-2">
              <Button
                onClick={() => setShowFireDialog(false)}
                className="w-full h-[44px] text-[16px]"
                style={{ 
                  backgroundColor: '#DA1E28',
                  color: 'white',
                  fontFamily: 'Roboto',
                  fontWeight: '500',
                  letterSpacing: '0.5px',
                  outline: '2px #DA1E28 solid',
                  outlineOffset: '-2px'
                }}
              >
                화재 신고
              </Button>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
