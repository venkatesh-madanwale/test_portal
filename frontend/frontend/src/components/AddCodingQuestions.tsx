import React, { useState } from 'react';
import './AddCodingQuestions.css';

interface FunctionName {
  langId: number | string;
  name: string;
}

interface FunctionSignature {
  langId: number | string;
  signature: string;
}

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface CodingQuestion {
  title: string;
  Description: string;
  difficulty: string;
  tags: string[];
  functionNames: FunctionName[];
  signatures: FunctionSignature[];
  sampleTests: TestCase[];
  hiddenTests: TestCase[];
}

const AddCodingQuestions: React.FC = () => {
  const [question, setQuestion] = useState<CodingQuestion>({
    title: '',
    Description: '',
    difficulty: '',
    tags: [''],
    functionNames: [{ langId: '', name: '' }],
    signatures: [{ langId: '', signature: '' }],
    sampleTests: [{ input: '', expectedOutput: '' }],
    hiddenTests: [{ input: '', expectedOutput: '' }],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: keyof CodingQuestion) => {
    setQuestion({ ...question, [field]: e.target.value });
  };

  const handleFnNameChange = (index: number, field: keyof FunctionName, value: string) => {
    const newFn = [...question.functionNames];
    if (field === 'langId') {
      newFn[index][field] = value;
    } else {
      newFn[index][field] = value as string;
    }
    setQuestion({ ...question, functionNames: newFn });
  };

  const addFnName = () => {
    setQuestion({ ...question, functionNames: [...question.functionNames, { langId: '', name: '' }] });
  };

  const handleSigChange = (index: number, field: keyof FunctionSignature, value: string) => {
    const newSig = [...question.signatures];
    if (field === 'langId') {
      newSig[index][field] = value;
    } else {
      newSig[index][field] = value as string;
    }
    setQuestion({ ...question, signatures: newSig });
  };

  const addSig = () => {
    setQuestion({ ...question, signatures: [...question.signatures, { langId: '', signature: '' }] });
  };

  const handleTestCaseChange = (
    type: 'sampleTests' | 'hiddenTests',
    index: number,
    field: keyof TestCase,
    value: string
  ) => {
    const testCases = [...question[type]];
    testCases[index][field] = value;
    setQuestion({ ...question, [type]: testCases });
  };

  const addTestCase = (type: 'sampleTests' | 'hiddenTests') => {
    setQuestion({ ...question, [type]: [...question[type], { input: '', expectedOutput: '' }] });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted question:', question);
  };

  return (
    <div className="add-coding-container">
      <h2>ADD CODING QUESTION</h2>

      <form className="coding-form" onSubmit={handleSubmit}>
        <fieldset>
          <legend>Problem Details</legend>

          <label>Title:</label>
          <input type="text" value={question.title} onChange={(e) => handleChange(e, 'title')} />

          <label>Description:</label>
          <input type="text" value={question.Description} onChange={(e) => handleChange(e, 'Description')} />

          <label>Difficulty Level:</label>
          <select value={question.difficulty} onChange={(e) => handleChange(e, 'difficulty')}>
            <option value="">Select</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </fieldset>

        <fieldset>
          <legend>Function Name - per Language</legend>
          {question.functionNames.map((fn, i) => (
            <div key={i}>
              <input
                type="text"
                placeholder="Language ID"
                value={fn.langId}
                onChange={(e) => handleFnNameChange(i, 'langId', e.target.value)}
              />
              <input
                type="text"
                placeholder="Function Name"
                value={fn.name}
                onChange={(e) => handleFnNameChange(i, 'name', e.target.value)}
              />
            </div>
          ))}
          <button type="button" onClick={addFnName}>+ Add</button>
        </fieldset>

        <fieldset>
          <legend>Function Signature - per Language</legend>
          {question.signatures.map((sig, i) => (
            <div key={i}>
              <input
                type="text"
                placeholder="Language ID"
                value={sig.langId}
                onChange={(e) => handleSigChange(i, 'langId', e.target.value)}
              />
              <input
                type="text"
                placeholder="Function Signature"
                value={sig.signature}
                onChange={(e) => handleSigChange(i, 'signature', e.target.value)}
              />
            </div>
          ))}
          <button type="button" onClick={addSig}>+ Add</button>
        </fieldset>

        <fieldset>
          <legend>Sample Test Cases (Visible to users)</legend>
          {question.sampleTests.map((t, i) => (
            <div key={i}>
              <input
                type="text"
                placeholder="Input"
                value={t.input}
                onChange={(e) => handleTestCaseChange('sampleTests', i, 'input', e.target.value)}
              />
              <input
                type="text"
                placeholder="Expected Output"
                value={t.expectedOutput}
                onChange={(e) => handleTestCaseChange('sampleTests', i, 'expectedOutput', e.target.value)}
              />
            </div>
          ))}
          <button type="button" onClick={() => addTestCase('sampleTests')}>+ Add</button>
        </fieldset>

        <fieldset>
          <legend>Hidden Test Cases (Used for grading)</legend>
          {question.hiddenTests.map((t, i) => (
            <div key={i}>
              <input
                type="text"
                placeholder="Input"
                value={t.input}
                onChange={(e) => handleTestCaseChange('hiddenTests', i, 'input', e.target.value)}
              />
              <input
                type="text"
                placeholder="Expected Output"
                value={t.expectedOutput}
                onChange={(e) => handleTestCaseChange('hiddenTests', i, 'expectedOutput', e.target.value)}
              />
            </div>
          ))}
          <button type="button" onClick={() => addTestCase('hiddenTests')}>+ Add</button>
        </fieldset>

        <div className="submit-container">
          <button type="submit" className="submit-btn">Submit Question</button>
        </div>
      </form>
    </div>
  );
};

export default AddCodingQuestions;
