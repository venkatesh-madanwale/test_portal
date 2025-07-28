import React, { useState, useEffect } from 'react';
import './AddUsers.css';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../redux/slices/authSlice';
import { fetchRoles } from '../redux/slices/rolesSlice';
import type { RootState } from '../redux/store';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AddUser: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate()
  // const { roles, loading: roleLoading, error } = useSelector((state: RootState) => state.roles);
  const { roles, loading: roleLoading } = useSelector((state: RootState) => state.roles);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    roleId: '', // role id
    password: '',
    status: ''
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

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.roleId) {
    toast.error('Please select a role');
    return;
  }

  try {
    const result = await dispatch(registerUser(formData));

    if (registerUser.fulfilled.match(result)) {
      toast.success('User registered successfully!');
      navigate('/');
    } else {
      toast.error('Registration failed: ' + (result.payload || 'Unknown error'));
    }
  } catch (error) {
    alert('An unexpected error occurred');
    console.error(error);
  }
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
            name="name"
            placeholder="Full Name:"
            value={formData.name}
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
          <select name="roleId" value={formData.roleId} onChange={handleChange} required>
            <option value="">Select Role</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          <select name="status" value={formData.status} onChange={handleChange} required>
            <option value="">Select Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inctive</option>
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
        {/* {error && <p className="error">{error}</p>} */}
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
