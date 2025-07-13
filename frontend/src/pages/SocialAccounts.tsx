import React, { useEffect, useState } from 'react';
import SocialAccountCard from '../components/UI/SocialAccountCard';

interface PlatformStatus {
  name: string;
  iconUrl: string;
  connected: boolean;
}

const PLATFORMS: { name: string; iconUrl: string }[] = [
  {
    name: 'LinkedIn',
    iconUrl: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/linkedin.svg',
  },
  {
    name: 'Twitter',
    iconUrl: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/twitter.svg',
  },
  {
    name: 'Instagram',
    iconUrl: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg',
  },
];

const SocialAccounts: React.FC = () => {
  const [platforms, setPlatforms] = useState<PlatformStatus[]>([]);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<{ [key: string]: string | null }>({});
  const [globalLoading, setGlobalLoading] = useState(true);

  // Fetch connection status from backend
  useEffect(() => {
    const fetchStatus = async () => {
      setGlobalLoading(true);
      try {
        const res = await fetch('/api/social-accounts', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch social account status');
        const data = await res.json();
        // data should be: { LinkedIn: true/false, Twitter: true/false, Instagram: true/false }
        setPlatforms(
          PLATFORMS.map((p) => ({
            ...p,
            connected: !!data[p.name],
          }))
        );
      } catch (err: any) {
        setPlatforms(
          PLATFORMS.map((p) => ({
            ...p,
            connected: false,
          }))
        );
      } finally {
        setGlobalLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleConnect = async (name: string) => {
    setLoading((prev) => ({ ...prev, [name]: true }));
    setError((prev) => ({ ...prev, [name]: null }));
    try {
      // Open OAuth login in a new window (use full backend URL)
      const backendBase = 'http://localhost:8000';
      const oauthUrl = `${backendBase}/auth/${name.toLowerCase()}/login`;
      const win = window.open(oauthUrl, '_blank', 'width=600,height=700');
      // Poll for connection status update
      const poll = setInterval(async () => {
        const res = await fetch('/api/social-accounts', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data[name]) {
            setPlatforms((prev) =>
              prev.map((p) => (p.name === name ? { ...p, connected: true } : p))
            );
            setLoading((prev) => ({ ...prev, [name]: false }));
            clearInterval(poll);
            if (win) win.close();
          }
        }
      }, 2000);
      // Optionally, timeout after 2 minutes
      setTimeout(() => {
        clearInterval(poll);
        setLoading((prev) => ({ ...prev, [name]: false }));
        setError((prev) => ({ ...prev, [name]: 'Connection timed out.' }));
        if (win) win.close();
      }, 120000);
    } catch (err: any) {
      setError((prev) => ({ ...prev, [name]: err.message || 'Failed to connect.' }));
      setLoading((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleDisconnect = async (name: string) => {
    setLoading((prev) => ({ ...prev, [name]: true }));
    setError((prev) => ({ ...prev, [name]: null }));
    try {
      const res = await fetch(`/api/social-accounts/${name.toLowerCase()}/disconnect`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to disconnect');
      setPlatforms((prev) =>
        prev.map((p) => (p.name === name ? { ...p, connected: false } : p))
      );
    } catch (err: any) {
      setError((prev) => ({ ...prev, [name]: err.message || 'Failed to disconnect.' }));
    } finally {
      setLoading((prev) => ({ ...prev, [name]: false }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Social Accounts</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Connect your social media accounts to enable publishing and scheduling directly from this platform.
      </p>
      {globalLoading ? (
        <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-6">
          {platforms.map((platform) => (
            <SocialAccountCard
              key={platform.name}
              name={platform.name}
              iconUrl={platform.iconUrl}
              connected={platform.connected}
              loading={!!loading[platform.name]}
              onConnect={() => handleConnect(platform.name)}
              onDisconnect={() => handleDisconnect(platform.name)}
              error={error[platform.name]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SocialAccounts; 