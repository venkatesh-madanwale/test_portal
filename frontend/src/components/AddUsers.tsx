import React, { useState, useEffect } from 'react';
import './AddUsers.css';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../redux/slices/authSlice';
import { fetchRoles } from '../redux/slices/rolesSlice';
import type { RootState } from '../redux/store';

const AddUser: React.FC = () => {
  const dispatch = useDispatch<any>();

  const { roles, loading: roleLoading, error } = useSelector((state: RootState) => state.roles);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '', // role name
    password: '',
  });

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedRole = roles.find(r => r.name === formData.role);
    if (!selectedRole) {
      alert('Invalid role selected.');
      return;
    }

    dispatch(
      registerUser({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: selectedRole.id, // send UUID
      })
    );
  };

  return (
    <div className="add-user-container">
      <div className="form-section">
        <h2>
          Add users <span className="highlight">mirafra</span>
        </h2>
        <form className="user-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name:"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Id:"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone No.:"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <select name="role" value={formData.role} onChange={handleChange} required>
            <option value="">Select Role</option>
            {roles.map(role => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>

          <input
            type="password"
            name="password"
            placeholder="Password:"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Register</button>
        </form>
        {roleLoading && <p>Loading roles...</p>}
        {error && <p className="error">{error}</p>}
      </div>

      <div className="image-section">
        <img
          src="src/assets/add-user-placeholder.png"
          alt="add-user-placeholder"
          className="illustration"
        />
      </div>
    </div>
  );
};

export default AddUser;
