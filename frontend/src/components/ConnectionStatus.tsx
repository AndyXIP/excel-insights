import { useEffect, useState } from 'react';
import { API_BASE } from '../config';

export default function ConnectionStatus() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [endpoint, setEndpoint] = useState<string>(API_BASE);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`);
        if (!cancelled) setStatus(res.ok ? 'online' : 'offline');
      } catch {
        if (!cancelled) setStatus('offline');
      }
    };
    check();
    return () => { cancelled = true; };
  }, []);

  const dot = status === 'online' ? '🟢' : status === 'offline' ? '🔴' : '🟡';
  const label = status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : 'Checking...';

  return (
    <div style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: '#555' }}>
      <span style={{ marginRight: 8 }}>{dot}</span>
      API: <code style={{ color: '#6C3BAA' }}>{endpoint}</code> — {label}
    </div>
  );
}
