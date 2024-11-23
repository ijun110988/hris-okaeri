import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { FaUser, FaLock, FaSpinner } from 'react-icons/fa';
import Image from 'next/image';
import api from '../utils/axios';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/login', {
        username,
        password,
        role: 'employee'
      });

      if (response.data.status === 'success' && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - HRIS Okaeri</title>
      </Head>

      <div className="min-vh-100 bg-primary bg-gradient d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6 col-xl-5">
              <div className="card border-0 shadow-lg">
                <div className="card-body p-5">
                  {/* Logo */}
                  <div className="text-center mb-4">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                      <Image
                        src="/img/4400248.jpg"
                        alt="HRIS Logo"
                        width={60}
                        height={60}
                        className="img-fluid"
                      />
                    </div>
                    <h2 className="fw-bold text-primary mb-2">Welcome Back!</h2>
                    <p className="text-muted">Sign in to continue to HRIS Okaeri</p>
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      <div>{error}</div>
                    </div>
                  )}

                  {/* Login Form */}
                  <form onSubmit={handleLogin}>
                    <div className="mb-4">
                      <label htmlFor="username" className="form-label">Username</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <FaUser className="text-muted" />
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0"
                          id="username"
                          placeholder="Enter your username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="password" className="form-label">Password</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <FaLock className="text-muted" />
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control border-start-0 border-end-0 ps-0"
                          id="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="input-group-text bg-light border-start-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-3 mb-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="spinner-border spinner-border-sm me-2" />
                          Signing in...
                        </>
                      ) : (
                        'Sign in'
                      )}
                    </button>

                    <div className="text-center">
                      <small className="text-muted">
                        &copy; 2024 HRIS Okaeri. All rights reserved.
                      </small>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
