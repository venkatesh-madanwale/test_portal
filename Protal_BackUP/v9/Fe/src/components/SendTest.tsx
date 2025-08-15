import React, { useState } from 'react';
import './SendTest.css'; // Updated and scoped version

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
    // API logic here
  };

  return (
    <div className="send-link-container">
      <h2>Send Test Link</h2>
      <form className="send-link-form" onSubmit={handleSubmit}>
        <input className="send-link-input" type="email" name="email" placeholder="Email Id:" onChange={handleChange} required />
        <input className="send-link-input" type="text" name="name" placeholder="Name:" onChange={handleChange} required />
        <input className="send-link-input" type="tel" name="phone" placeholder="Phone no." onChange={handleChange} required />
        <input className="send-link-input" type="text" name="job" placeholder="Job:" onChange={handleChange} required />
        <input className="send-link-input" type="text" name="experience" placeholder="Experience Level:" onChange={handleChange} required />
        <input className="send-link-input" type="text" name="skillA" placeholder="Primary skill (a):" onChange={handleChange} required />
        <input className="send-link-input" type="text" name="skillB" placeholder="Primary skill (b): (Optional)" onChange={handleChange} />
        <button className="send-link-button" type="submit">Send Link</button>
      </form>
    </div>
  );
};

export default SendTest;
