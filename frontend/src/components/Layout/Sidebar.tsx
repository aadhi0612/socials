import React, { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PenTool, 
  Image, 
  Settings, 
  Target,
  Zap,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Sidebar: React.FC = () => {
  const { user, logout, token, setUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Handler for file input change
  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!token) {
      alert('You must be logged in to update your profile picture.');
      return;
    }
    console.log('Using token for profile update:', token);
    // 1. Get presigned S3 upload URL from backend
    const res = await fetch(`${API_BASE}/users/profile-pic-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user?.user_id }),
    });
    const { url, key } = await res.json();
    // 2. Upload image to S3
    await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    // 3. Construct the S3 URL
    const bucket = import.meta.env.VITE_AWS_S3_BUCKET;
    const region = import.meta.env.VITE_AWS_REGION;
    const profilePicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    // 4. Update profile_pic_url in backend
    const updateRes = await fetch('`${API_BASE}/users/me/profile-pic`', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ profile_pic_url: profilePicUrl }),
    });
    if (updateRes.status === 401) {
      alert('Session expired or unauthorized. Please log in again.');
      return;
    }
    const updatedUser = await updateRes.json();
    // 5. Update user in context/sessionStorage
    if (updatedUser) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
      }
      if (typeof setUser === 'function') setUser(updatedUser);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/create', icon: PenTool, label: 'Content Creation' },
    { path: '/media', icon: Image, label: 'Media Library' },
    { path: '/campaigns', icon: Target, label: 'Campaign Manager' },
    { path: '/admin', icon: Settings, label: 'Admin Dashboard' }
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-black">AI</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">socials AI</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">AI-powered social media platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive 
                ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-r-2 border-yellow-600 dark:border-yellow-400' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }
            `}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <label style={{ cursor: 'pointer' }}>
            <img
              src={user?.profile_pic_url && user.profile_pic_url.startsWith('http') ? user.profile_pic_url : '/default-user-icon.png'}
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover bg-gray-200"
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (!token) {
                  alert('You must be logged in to update your profile picture.');
                  return;
                }
                // 1. Get presigned S3 upload URL from backend
                const res = await fetch(`${API_BASE}/users/profile-pic-upload`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ user_id: user?.user_id }),
                });
                const { url, key } = await res.json();
                // 2. Upload image to S3
                await fetch(url, {
                  method: 'PUT',
                  headers: { 'Content-Type': file.type },
                  body: file,
                });
                // 3. Construct the S3 URL
                const bucket = import.meta.env.VITE_AWS_S3_BUCKET;
                const region = import.meta.env.VITE_AWS_REGION;
                const profilePicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
                // 4. Update profile_pic_url in backend
                const updateRes = await fetch('`${API_BASE}/users/me/profile-pic`', {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                  body: JSON.stringify({ profile_pic_url: profilePicUrl }),
                });
                if (updateRes.status === 401) {
                  alert('Session expired or unauthorized. Please log in again.');
                  return;
                }
                const updatedUser = await updateRes.json();
                // 5. Update user in context/sessionStorage
                if (updatedUser) {
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem('user', JSON.stringify(updatedUser));
                  }
                  if (typeof setUser === 'function') setUser(updatedUser);
                }
                // 6. Reset file input so user can re-upload the same file if needed
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            />
          </label>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.role} • socials AI
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;