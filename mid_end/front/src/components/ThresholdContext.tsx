import { createContext, useContext, useState, ReactNode } from 'react';

interface ThresholdSettings {
  temperature: {
    warning: number;
    danger: number;
  };
  smoke: {
    warning: number;
    danger: number;
  };
  video: {
    warning: number;
    danger: number;
  };
}

interface ThresholdContextType {
  thresholds: ThresholdSettings;
  updateThresholds: (newThresholds: ThresholdSettings) => void;
}

const defaultThresholds: ThresholdSettings = {
  temperature: {
    warning: 45,
    danger: 70,
  },
  smoke: {
    warning: 300,
    danger: 10000,
  },
  video: {
    warning: 50,
    danger: 80,
  },
};

const ThresholdContext = createContext<ThresholdContextType | undefined>(undefined);

export function ThresholdProvider({ children }: { children: ReactNode }) {
  const [thresholds, setThresholds] = useState<ThresholdSettings>(defaultThresholds);

  const updateThresholds = (newThresholds: ThresholdSettings) => {
    setThresholds(newThresholds);
  };

  return (
    <ThresholdContext.Provider value={{ thresholds, updateThresholds }}>
      {children}
    </ThresholdContext.Provider>
  );
}

export function useThresholds() {
  const context = useContext(ThresholdContext);
  if (context === undefined) {
    throw new Error('useThresholds must be used within a ThresholdProvider');
  }
  return context;
}
