import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const roles = ['Admin', 'Editor', 'Viewer'] as const;
type Role = typeof roles[number];

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
  const validatePassword = (password: string) => password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateEmail(form.email)) {
      setError('Invalid email format');
      return;
    }
    if (!validatePassword(form.password)) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Register</h2>
        {error && <div className="text-red-600 text-center">{error}</div>}
        {success && <div className="text-green-600 text-center">Registration successful! Redirecting...</div>}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register; 