import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5555';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // The OAuth callback redirects failures back here as ?oauth_error=...
  // since it can't show a React error state itself.
  useEffect(() => {
    const oauthError = searchParams.get('oauth_error');
    if (oauthError) setError(oauthError);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/admin/login`, { username, password });
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        navigate('/admin/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid credentials');
    }
  };

  const handleGoogleLogin = () => {
    // Full page navigation, not axios - this has to leave the SPA so the
    // browser can actually go to Google's consent screen.
    window.location.href = `${API_URL}/auth/google`;
  };
  return (
    <div className="flex items-center justify-center min-h-screen">
    <div className="bg-warm-white shadow-lg p-8 rounded-lg transform hover:scale-105 transition duration-300 ease-in-out">
      <h2 className="text-2xl font-bold mb-6">Admin Login</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label className="mb-2 font-semibold">Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 font-semibold">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
        >
          Login
        </button>
      </form>
      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-gray-300" />
        <span className="mx-2 text-gray-400 text-sm">or</span>
        <div className="flex-grow border-t border-gray-300" />
      </div>
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition duration-300"
      >
        Sign in with Google
      </button>
    </div>
  </div>
  );
};

export default AdminLogin;