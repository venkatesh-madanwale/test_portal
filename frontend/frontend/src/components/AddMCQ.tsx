import React, { useState } from 'react';
import './AddMCQ.css';

const AddMCQ = () => {
  const [formData, setFormData] = useState({
    skill: '',
    difficulty: '',
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    answerKey: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted Question:', formData);
    // API Logic
  };

  const handleUploadClick = () => {
    alert('Upload XLSX clicked (dummy)');
  };

  return (
    <div className="mcq-container">
      <h2>Add MCQ Question...</h2>

      <div className="upload-button">
        <button onClick={handleUploadClick}>Upload xlsx</button>
      </div>

      <form onSubmit={handleSubmit}>
        <input type="text" name="skill" placeholder="Skill" onChange={handleChange} required />

        <select name="difficulty" value={formData.difficulty} onChange={handleChange} required>
          <option value="" disabled>Difficulty:</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <input type="text" name="question" placeholder="Question" onChange={handleChange} required />
        <input type="text" name="optionA" placeholder="Options (a)" onChange={handleChange} required />
        <input type="text" name="optionB" placeholder="Options (b)" onChange={handleChange} required />
        <input type="text" name="optionC" placeholder="Options (c)" onChange={handleChange} required />
        <input type="text" name="optionD" placeholder="Options (d)" onChange={handleChange} required />
        <input type="text" name="answerKey" placeholder="Answer key" onChange={handleChange} required />

        <button type="submit">Add</button>
      </form>
    </div>
  );
};

export default AddMCQ;
