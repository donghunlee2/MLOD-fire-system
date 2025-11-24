import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useThresholds } from './ThresholdContext';
import { toast } from 'sonner@2.0.3';

export function SettingsView() {
  const { thresholds, updateThresholds } = useThresholds();
  
  const [tempWarning, setTempWarning] = useState(thresholds.temperature.warning.toString());
  const [tempDanger, setTempDanger] = useState(thresholds.temperature.danger.toString());
  const [smokeWarning, setSmokeWarning] = useState(thresholds.smoke.warning.toString());
  const [smokeDanger, setSmokeDanger] = useState(thresholds.smoke.danger.toString());
  const [videoWarning, setVideoWarning] = useState(thresholds.video.warning.toString());
  const [videoDanger, setVideoDanger] = useState(thresholds.video.danger.toString());

  useEffect(() => {
    setTempWarning(thresholds.temperature.warning.toString());
    setTempDanger(thresholds.temperature.danger.toString());
    setSmokeWarning(thresholds.smoke.warning.toString());
    setSmokeDanger(thresholds.smoke.danger.toString());
    setVideoWarning(thresholds.video.warning.toString());
    setVideoDanger(thresholds.video.danger.toString());
  }, [thresholds]);

  const handleSmokeBlur = (value: string, setter: (val: string) => void, label: string) => {
    const numValue = parseFloat(value);
    if (value !== '' && numValue < 300) {
      toast.error(`${label} 연기 값은 300ppm 이상이어야 합니다.`);
      setter('300');
    }
  };

  const handleApply = () => {
    const newThresholds = {
      temperature: {
        warning: parseFloat(tempWarning) || 0,
        danger: parseFloat(tempDanger) || 0,
      },
      smoke: {
        warning: parseFloat(smokeWarning) || 0,
        danger: parseFloat(smokeDanger) || 0,
      },
      video: {
        warning: parseFloat(videoWarning) || 0,
        danger: parseFloat(videoDanger) || 0,
      },
    };

    // Validation
    if (newThresholds.temperature.warning >= newThresholds.temperature.danger) {
      toast.error('온도 경고 값은 위험 값보다 작아야 합니다.');
      return;
    }
    if (newThresholds.smoke.warning >= newThresholds.smoke.danger) {
      toast.error('연기 경고 값은 위험 값보다 작아야 합니다.');
      return;
    }
    if (newThresholds.video.warning >= newThresholds.video.danger) {
      toast.error('영상 경고 값은 위험 값보다 작아야 합니다.');
      return;
    }

    updateThresholds(newThresholds);
    toast.success('임계값이 성공적으로 적용되었습니다.');
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <h1 className="text-lg mb-3 flex-shrink-0 font-bold pt-[0px] pr-[0px] pb-[0px] pl-[5px]">설정</h1>

      <div className="flex-1 overflow-y-auto space-y-3">
        {/* 임계값 설정 */}
        <Card>
          <CardContent className="pt-3 space-y-3">
            <div className="space-y-1">
              <h2 className="text-base">임계값 설정</h2>
            </div>

            <div className="space-y-3">
              {/* 온도 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="temp-warning" className="text-xs">온도 (°C)</Label>
                  <Input
                    id="temp-warning"
                    type="number"
                    min="1"
                    placeholder="주의(Warning) 값을 입력해주세요."
                    value={tempWarning}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || Number(value) >= 1) {
                        setTempWarning(value);
                      }
                    }}
                    className="bg-[#f2f4f8] border-[#c1c7cd] h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="temp-danger" className="text-transparent select-none text-xs">.</Label>
                  <Input
                    id="temp-danger"
                    type="number"
                    min="1"
                    placeholder="위험(Danger) 값을 입력해주세요."
                    value={tempDanger}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || Number(value) >= 1) {
                        setTempDanger(value);
                      }
                    }}
                    className="bg-[#f2f4f8] border-[#c1c7cd] h-8 text-xs"
                  />
                </div>
              </div>

              {/* 연기 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="smoke-warning" className="text-xs">연기 (ppm)</Label>
                  <Input
                    id="smoke-warning"
                    type="number"
                    placeholder="주의(Warning) 값을 입력해주세요."
                    value={smokeWarning}
                    onChange={(e) => setSmokeWarning(e.target.value)}
                    onBlur={(e) => handleSmokeBlur(e.target.value, setSmokeWarning, '주의(Warning)')}
                    className="bg-[#f2f4f8] border-[#c1c7cd] h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="smoke-danger" className="text-transparent select-none text-xs">.</Label>
                  <Input
                    id="smoke-danger"
                    type="number"
                    placeholder="위험(Danger) 값을 입력해주세요."
                    value={smokeDanger}
                    onChange={(e) => setSmokeDanger(e.target.value)}
                    onBlur={(e) => handleSmokeBlur(e.target.value, setSmokeDanger, '위험(Danger)')}
                    className="bg-[#f2f4f8] border-[#c1c7cd] h-8 text-xs"
                  />
                </div>
              </div>

              {/* 영상 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="video-warning" className="text-xs">영상</Label>
                  <Input
                    id="video-warning"
                    type="number"
                    placeholder="주의(Warning) 값을 입력해주세요."
                    value={videoWarning}
                    onChange={(e) => setVideoWarning(e.target.value)}
                    className="bg-[#f2f4f8] border-[#c1c7cd] h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="video-danger" className="text-transparent select-none text-xs">.</Label>
                  <Input
                    id="video-danger"
                    type="number"
                    placeholder="위험(Danger) 값을 입력해주세요."
                    value={videoDanger}
                    onChange={(e) => setVideoDanger(e.target.value)}
                    className="bg-[#f2f4f8] border-[#c1c7cd] h-8 text-xs"
                  />
                </div>
              </div>

              {/* 적용 버튼 */}
              <div className="flex justify-start">
                <Button
                  onClick={handleApply}
                  className="px-4 h-8 text-xs"
                  style={{ backgroundColor: '#0f62fe' }}
                >
                  적용
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 사용자 알림 설정 */}
        <Card>
          <CardContent className="pt-3 space-y-3">
            <div className="space-y-1">
              <h2 className="text-base">사용자 알림 설정</h2>
            </div>
            <div className="text-gray-500 text-center py-4 text-sm">
              사용자 맞춤 알림 설정 기능은 준비 중입니다.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
