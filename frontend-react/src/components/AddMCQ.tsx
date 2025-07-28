import React, { useState } from 'react';
import './AddMCQ.css';
import axios from 'axios';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const createdBy = user?.id || '';
    const payload = {
      skill: formData.skill,
      difficulty: formData.difficulty,
      questionTitle: formData.question,
      createdBy: createdBy,
      options: [
        {
          optionText: formData.optionA,
          isCorrect: formData.answerKey.toLowerCase() === 'a',
        },
        {
          optionText: formData.optionB,
          isCorrect: formData.answerKey.toLowerCase() === 'b',
        },
        {
          optionText: formData.optionC,
          isCorrect: formData.answerKey.toLowerCase() === 'c',
        },
        {
          optionText: formData.optionD,
          isCorrect: formData.answerKey.toLowerCase() === 'd',
        },
      ],
    };

    try {
      const res = await axios.post('http://localhost:3000/mcq-questions', payload);
      if (res.data.statuscode === '201') {
        // alert('MCQ Created! ID: ' + res.data.data.questionId);
        toast.success("MCQ Created! ID:" + res.data.data.questionId)
      }
    } catch (err) {
      console.error('Error adding MCQ:', err);
      alert('Error adding question!');
    }
  };



  const handleUploadClick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      console.log(worksheet)

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const createdBy = user?.id || '';

      const mcqPayloads = (jsonData as any[]).map((row) => {
        const answerKeys = String(row.answerKey).split(',').map((key) => key.trim().toLowerCase());
        return {
          skill: row.skill,
          difficulty: row.difficulty,
          questionTitle: row.questionTitle,
          createdBy,
          options: [
            {
              optionText: row.optionA,
              isCorrect: answerKeys.includes('a'),
            },
            {
              optionText: row.optionB,
              isCorrect: answerKeys.includes('b'),
            },
            {
              optionText: row.optionC,
              isCorrect: answerKeys.includes('c'),
            },
            {
              optionText: row.optionD,
              isCorrect: answerKeys.includes('d'),
            },
          ],
        };
      });

      // POST each question
      try {
        const responses = await Promise.all(
          mcqPayloads.map((payload) =>
            axios.post('http://localhost:3000/mcq-questions', payload)
          )
        );
        toast.success(`${responses.length} questions uploaded successfully!`);
      } catch (err) {
        console.error('Upload failed:', err);
        toast.error('Failed to upload questions.');
      }
    };

    reader.readAsBinaryString(file);
  };


  return (
    <div className="mcq-container">
      <h2>Add MCQ Question</h2>
      <div className="btnn">
          <label htmlFor="xlsxUpload" className="upload-label">Upload XLSX</label>
          <input
            id="xlsxUpload"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleUploadClick}
            hidden
          />
        <a href="src/assets/template.xlsx" download>
          <button type="button" className="upload-label">Download Template</button>
        </a>
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
        <input type="text" name="answerKey" placeholder="Correct option (a/b/c/d)" onChange={handleChange} required />

        <button type="submit">Add</button>
      </form>
    </div>
  );
};

export default AddMCQ;
