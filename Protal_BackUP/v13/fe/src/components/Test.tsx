import axios from 'axios';
import './Test.css';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';

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
  const { token, applicantId, attemptId } = useParams();
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes
  const [started, setStarted] = useState(false);

  const handle = useFullScreenHandle();

  useEffect(() => {
    if (!started || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTimeLeft) => {
        if (prevTimeLeft <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prevTimeLeft - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, submitted, questions, answers]);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!token || !applicantId || !attemptId) {
        console.error('Missing URL parameters.');
        return;
      }

      try {
        const url = `http://localhost:3000/applicant-questions/assigned/${applicantId}/${attemptId}`;
        const response = await axios.get<ApiQuestion[]>(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setQuestions(response.data);
      } catch (error) {
        console.error('Error fetching MCQs:', error);
      }
    };

    fetchQuestions();
  }, [token, applicantId, attemptId]);

  // const handleOptionChange = (questionId: string, optionId: string) => {
  //   setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  // };
  const handleOptionChange = async (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));

    try {
      console.log(applicantId,
        attemptId,
        questionId,
        optionId,)
      await axios.post(
        'http://localhost:3000/applicant-questions/answer',
        // 'http://localhost:3000/answer',
        {
          applicantId,
          attemptId,
          questionId,
          selectedOptionId: optionId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Answer saved for question:', questionId);
    } catch (error) {
      console.error('Failed to save answer:', error);
    }
  };


  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // const handleSubmit = () => {
  //   let calculatedScore = 0;
  //   questions.forEach((q) => {
  //     const selectedOptionId = answers[q.mcq_question.id];
  //     const correctOption = q.mcq_question.options.find((opt) => opt.isCorrect);
  //     if (selectedOptionId === correctOption?.id) {
  //       calculatedScore += 1;
  //     }
  //   });
  //   setScore(calculatedScore);
  //   setSubmitted(true);
  //   // setTimeout(() => {
  //   //   window.close();
  //   // }, 3000); // 3-second delay to allow user to see the result
  // };


  const handleSubmit = async () => {
    setSubmitted(true);
    try {
      const res = await axios.get(
        `http://localhost:3000/applicant-questions/evaluate/${applicantId}/${attemptId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Evaluation result:', res.data);
      setScore(res.data.correct); // set score from backend response


      
      // Optional: Show feedback or save to backend
    } catch (error) {
      console.error('Error evaluating test:', error);
    }
  };




  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartTest = () => {
    handle.enter();
    setStarted(true);
  };

  return (
    <FullScreen handle={handle}>
      <div className="main-container">

        <div className="mcq-test-container">
          {!started ? (
            <div className="instructions">
              <h2>Instructions</h2>
              <ul>
                <li>Do not switch tabs or open new windows.</li>
                <li>Test is auto-submitted after 45 minutes.</li>
                <li>Do not refresh the page once the test starts.</li>
                <li>Each question is mandatory to answer before proceeding.</li>
              </ul>
              <button className="submit-button" onClick={handleStartTest}>
                Start Test
              </button>
            </div>
          ) : questions.length === 0 ? (
            <p>Loading questions...</p>
          ) : submitted ? (
            <div className="result">
              <h3>Test Completed</h3>
              <p>Your Score: {score} / {questions.length}</p>
            </div>
          ) : (
            <>
              <div className="timer">Time Left: {formatTime(timeLeft)}</div>
              <h2>MCQ Test</h2>
              <div className="question-block">
                <p className="question-title">
                  {currentIndex + 1}. {questions[currentIndex].mcq_question.questionTitle}
                </p>
                <div className="options-list">
                  {questions[currentIndex].mcq_question.options.map((opt) => (
                    <label key={opt.id} className="option-item">
                      <input
                        type="radio"
                        name={questions[currentIndex].mcq_question.id}
                        value={opt.id}
                        checked={answers[questions[currentIndex].mcq_question.id] === opt.id}
                        onChange={() =>
                          handleOptionChange(questions[currentIndex].mcq_question.id, opt.id)
                        }
                        disabled={submitted}
                      />
                      {opt.optionText}
                    </label>
                  ))}
                </div>

                <div style={{ marginTop: '1rem' }}>
                  {currentIndex < questions.length - 1 ? (
                    <button
                      className="submit-button"
                      type="button"
                      onClick={handleNext}
                      disabled={!answers[questions[currentIndex].mcq_question.id]}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      className="submit-button"
                      type="button"
                      onClick={handleSubmit}
                      disabled={!answers[questions[currentIndex].mcq_question.id]}
                    >
                      Submit
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

    </FullScreen>
  );
};

export default Test;
