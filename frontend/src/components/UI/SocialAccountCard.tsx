import React from 'react';

interface SocialAccountCardProps {
  name: string;
  iconUrl: string;
  connected: boolean;
  loading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  error?: string | null;
}

const getPlatformBg = (name: string) => {
  if (name === 'LinkedIn') return '#0077B5';
  if (name === 'Twitter') return '#1DA1F2';
  if (name === 'Instagram') {
    return 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)';
  }
  return '#333';
};

const SocialAccountCard: React.FC<SocialAccountCardProps> = ({
  name,
  iconUrl,
  connected,
  loading,
  onConnect,
  onDisconnect,
  error,
}) => {
  const iconBg = getPlatformBg(name);

  return (
    <div
      className="flex items-center space-x-4 p-4 rounded-lg shadow border transition-all duration-200 hover:scale-[1.02] hover:shadow-lg bg-white dark:bg-gray-800"
      style={{
        borderColor: connected ? iconBg : '#e5e7eb',
        borderLeftWidth: 6,
      }}
    >
      <div
        className="w-12 h-12 flex items-center justify-center rounded-full mb-0"
        style={{
          background: iconBg,
        }}
      >
        <img
          src={iconUrl}
          alt={`${name} logo`}
          className="w-7 h-7"
          style={{ filter: 'invert(1)' }}
        />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-lg text-gray-900 dark:text-white">{name}</div>
        <div className={`text-sm mt-1 ${connected ? 'text-green-600' : 'text-gray-500'}`}>
          {connected ? 'Connected' : 'Not Connected'}
        </div>
        {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
      </div>
      {connected ? (
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 transition"
          onClick={onDisconnect}
          disabled={loading}
        >
          {loading ? 'Disconnecting...' : 'Disconnect'}
        </button>
      ) : (
        <button
          className="px-4 py-2 text-white rounded hover:opacity-90 disabled:opacity-50 transition"
          style={{ background: iconBg }}
          onClick={onConnect}
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect'}
        </button>
      )}
    </div>
  );
};

export default SocialAccountCard; 