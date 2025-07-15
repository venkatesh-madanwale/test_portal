import React, { useState } from 'react';
import './SendTest.css';

const SendTest = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    job: '',
    experience: '',
    skillA: '',
    skillB: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    // API logic
  };

  return (
    <div className="send-link-container">
      <h2>Send Test Link</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email Id:" onChange={handleChange} required />
        <input type="text" name="name" placeholder="Name:" onChange={handleChange} required />
        <input type="tel" name="phone" placeholder="Phone. no." onChange={handleChange} required />
        <input type="text" name="job" placeholder="Job:" onChange={handleChange} required />
        <input type="text" name="experience" placeholder="Experience Level:" onChange={handleChange} required />
        <input type="text" name="skillA" placeholder="Primary skill(a):" onChange={handleChange} required />
        <input type="text" name="skillB" placeholder="Primary skill(b):     (Optional)" onChange={handleChange} />
        <button type="submit">Send Link</button>
      </form>
    </div>
  );
};

export default SendTest;
