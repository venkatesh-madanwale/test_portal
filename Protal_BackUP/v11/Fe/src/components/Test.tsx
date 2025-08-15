import axios from 'axios';
import './Test.css';
import { useEffect, useState } from 'react';

interface Option {
  id: string;
  optionText: string;
  isCorrect: boolean;
}

interface MCQ {
  id: string;
  questionTitle: string;
  difficulty: string;
  options: Option[];
}

interface ApiQuestion {
  id: string;
  mcq_question: MCQ;
}

const Test = () => {
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get<ApiQuestion[]>('http://localhost:3000/your-mcq-endpoint');
        setQuestions(response.data);
      } catch (error) {
        console.error('Error fetching MCQs:', error);
      }
    };

    fetchQuestions();
  }, []);

  const handleOptionChange = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = () => {
    let calculatedScore = 0;
    questions.forEach((q) => {
      const selectedOptionId = answers[q.mcq_question.id];
      const correctOption = q.mcq_question.options.find((opt) => opt.isCorrect);
      if (selectedOptionId === correctOption?.id) {
        calculatedScore += 1;
      }
    });
    setScore(calculatedScore);
    setSubmitted(true);
  };

  return (
    <div className="mcq-test-container">
      <h2>MCQ Test</h2>
      {questions.length === 0 ? (
        <p>Loading questions...</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {questions.map((q, index) => (
            <div key={q.mcq_question.id} className="question-block">
              <p className="question-title">
                {index + 1}. {q.mcq_question.questionTitle}
              </p>
              <div className="options-list">
                {q.mcq_question.options.map((opt) => (
                  <label key={opt.id} className="option-item">
                    <input
                      type="radio"
                      name={q.mcq_question.id}
                      value={opt.id}
                      checked={answers[q.mcq_question.id] === opt.id}
                      onChange={() => handleOptionChange(q.mcq_question.id, opt.id)}
                      disabled={submitted}
                    />
                    {opt.optionText}
                  </label>
                ))}
              </div>
            </div>
          ))}
          {!submitted && (
            <button className="submit-button" type="submit">
              Submit
            </button>
          )}
        </form>
      )}

      {submitted && score !== null && (
        <div className="result">
          <h3>Test Completed</h3>
          <p>Your Score: {score} / {questions.length}</p>
        </div>
      )}
    </div>
  );
};

export default Test;
