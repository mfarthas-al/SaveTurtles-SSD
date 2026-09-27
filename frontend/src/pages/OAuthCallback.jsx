import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Landing spot for the redirect from backend/routes/oauthRoute.js after a
// successful Google login. Stores the token the exact same way the normal
// password-login form does (AdminLogin.jsx), then goes to the dashboard.
const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('adminToken', token);
      navigate('/admin/dashboard');
    } else {
      navigate('/admin?oauth_error=No token received');
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Signing you in...</p>
    </div>
  );
};

export default OAuthCallback;
