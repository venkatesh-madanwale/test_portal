import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/slices/authSlice';
import type { RootState } from '../redux/store';
import './Login.css';

const Login: React.FC = () => {
  const dispatch = useDispatch<any>();
  const authState = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  return (
    <div className="login-container">
      <div className="login-form-section">
        <h2>Log in to <span className="highlight">mirafra</span></h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email Id"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={authState.loading}>
            {authState.loading ? 'Logging in...' : 'Log in'}
          </button>
          {authState.error && <p className="error">{authState.error}</p>}
        </form>
      </div>
      <div className="login-image-section">
        <img src="src/assets/add-user-placeholder.png" alt="login-placeholder" className="login-graphic" />
      </div>
    </div>
  );
};

export default Login;
