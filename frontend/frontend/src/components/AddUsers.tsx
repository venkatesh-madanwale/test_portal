import React, { useState } from 'react';
import './AddUsers.css';

const AddUser: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    password: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // API Logic
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
          />
          <input
            type="email"
            name="email"
            placeholder="Email Id:"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone No.:"
            value={formData.phone}
            onChange={handleChange}
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="">Select Role</option>
            <option value="TA">TA</option>
            <option value="TM">TM</option>
          </select>

          <input
            type="password"
            name="password"
            placeholder="Password:"
            value={formData.password}
            onChange={handleChange}
          />
          <button type="submit">Register</button>
        </form>
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
