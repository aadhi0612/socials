import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { RegisterUser } from '../api/users';

const roles = ['Admin', 'Editor', 'Viewer'] as const;
type Role = typeof roles[number];

const awsCommunities = [
  "Chennai", "Coimbatore", "Bangalore", "Hyderabad", "Mumbai", "Delhi",
  "Pune", "Kolkata", "Kochi", "Jaipur", "Ahmedabad", "Lucknow"
  // ...add more as needed
];

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    mobile: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [awsCommunity, setAwsCommunity] = useState('');
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
  const validatePassword = (password: string) => password.length >= 6;

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    let profilePicUrl: string | undefined = undefined;
    let userId = '';
    try {
      // 1. Always get a user_id and presigned URL from backend
      const res = await fetch('http://localhost:8000/users/profile-pic-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const { url, key, user_id } = await res.json();
      userId = user_id;

      if (profilePic) {
        // 2. Upload image to S3
        await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': profilePic.type },
          body: profilePic,
        });
        // 3. Construct the S3 URL
        const bucket = import.meta.env.VITE_AWS_S3_BUCKET;
        const region = import.meta.env.VITE_AWS_REGION;
        profilePicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
      }

      // 4. Register user with all fields, including user_id and profile_pic_url if present
      const userData: RegisterUser & { id?: string } = {
        ...form,
        aws_community: awsCommunity,
        id: userId,
        ...(profilePicUrl ? { profile_pic_url: profilePicUrl } : {})
      };
      console.log("Registering user with data:", userData);
      await register(userData);
      console.log("Register API call finished");
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-gray-800 border-2 border-purple-600 p-8 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Register</h2>
        {error && <div className="text-red-500 text-center">{error}</div>}
        {success && <div className="text-green-400 text-center">Registration successful! Redirecting...</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-200 mb-1">Name <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Enter your name" className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-600 focus:border-purple-600" />
            </div>
            <div>
              <label className="block text-gray-200 mb-1">Email <span className="text-red-500">*</span></label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="Enter your email" className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-600 focus:border-purple-600" />
            </div>
            <div>
              <label className="block text-gray-200 mb-1">Mobile Number</label>
              <input type="number" name="mobile" value={form.mobile} onChange={handleChange} placeholder="Enter your mobile number" className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-600 focus:border-purple-600" />
            </div>
          </div>
          {/* Right column */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-200 mb-1">Password <span className="text-red-500">*</span></label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Create a password" className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-600 focus:border-purple-600" />
            </div>
            <div>
              <label className="block text-gray-200 mb-1">AWS Community</label>
              <input type="text" value={awsCommunity} onChange={e => setAwsCommunity(e.target.value)} placeholder="e.g., AWS User Group Bangalore" className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-600 focus:border-purple-600" />
            </div>
            <div>
              <label className="block text-gray-200 mb-1">Profile Picture</label>
              <div className="flex flex-col items-start gap-2">
                <label className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer">
                  {profilePic ? "Change File" : "Choose File"}
                  <input type="file" accept="image/*" onChange={handleProfilePicChange} className="hidden" />
                </label>
                {profilePicPreview && (
                  <img src={profilePicPreview} alt="Profile Preview" className="w-16 h-16 rounded-full border-2 border-purple-600 mt-2" />
                )}
              </div>
            </div>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg mt-6 transition-colors">
          {loading ? 'Registering...' : 'Register'}
        </button>
        <div className="text-center mt-4">
          <button
            type="button"
            className="text-purple-400 hover:text-purple-200 underline text-sm"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register; 