import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User } from '../types';

const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
const validatePassword = (password: string) => password.length >= 6;

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted', form.email, form.password);
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
      await login(form.email, form.password);
      console.log('login() from AuthContext completed');
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Login</h2>
        {error && <div className="text-red-600 text-center">{error}</div>}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p className="text-center text-sm mt-4">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-yellow-600 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login; 