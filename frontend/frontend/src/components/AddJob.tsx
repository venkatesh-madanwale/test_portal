import React, { useState } from 'react';
import './AddJob.css';

const AddJob: React.FC = () => {
  const [formData, setFormData] = useState({
    job: '',
    client: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Job submitted:', formData);
    // API logic
  };

  const handleUpload = () => {

    alert('Upload XLSX clicked');
  };

  return (
    <div className="add-job-container">
      <div className="upload-btn-container">
        <button className="upload-btn" onClick={handleUpload}>Upload xlsx</button>
      </div>
      <h2 className="add-job-title">Add Job...</h2>

      <form className="job-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="job"
          placeholder="Job:"
          value={formData.job}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="client"
          placeholder="Client:"
          value={formData.client}
          onChange={handleChange}
          required
        />
        <button type="submit" className="submit-btn">Add</button>
      </form>
    </div>

  );
};

export default AddJob;
