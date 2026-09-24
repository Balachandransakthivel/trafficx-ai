// TRAFFICX AI — Traffic Context Hook
import { useContext } from 'react';
import { TrafficContext } from '@/contexts/TrafficContext';

export function useTraffic() {
  const context = useContext(TrafficContext);
  if (!context) throw new Error('useTraffic must be used within TrafficProvider');
  return context;
}
