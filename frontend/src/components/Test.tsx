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
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [started, setStarted] = useState(false);

  const handle = useFullScreenHandle();

  useEffect(() => {
    if (!started || submitted) return;

    const onFullScreenChange = () => {
      if (!document.fullscreenElement) {
        alert('You exited fullscreen.');
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        alert('Tab switching is not allowed.');
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave the test?';
    };

    document.addEventListener('fullscreenchange', onFullScreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('fullscreenchange', onFullScreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [started, submitted]);

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
  }, [started, submitted]);

  const handleOptionChange = async (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));

    try {
      await axios.post(
        'http://localhost:3000/applicant-questions/answer',
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
    } catch (error) {
      console.error('Failed to save answer:', error);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

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
      setScore(res.data.correct);
    } catch (error) {
      console.error('Error evaluating test:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;s
  };

  const handleStartTest = async () => {
    try {
      // Try to resume first
      const resumeUrl = `http://localhost:3000/applicant-questions/resume/${applicantId}/${attemptId}`;
      const resumeResponse = await axios.get(resumeUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const allQuestions: ApiQuestion[] = resumeResponse.data.questions;
      const lastSeen = resumeResponse.data.lastSeenQuestion;

      // Resume from last answered + 1
      let resumeIndex = 0;
      if (lastSeen) {
        const idx = allQuestions.findIndex(
          (q) => q.mcq_question.id === lastSeen.id
        );
        if (idx !== -1) {
          resumeIndex = Math.min(idx + 1, allQuestions.length - 1);
        }
      }

      setQuestions(allQuestions);
      setCurrentIndex(resumeIndex);
      handle.enter();
      setStarted(true);
    } catch (error: any) {
      if (
        axios.isAxiosError(error) &&
        error.response?.data?.message === 'Max resume attempts exceeded'
      ) {
        alert('Resume limit exceeded');
      } else if (
        axios.isAxiosError(error) &&
        error.response?.data?.message === 'Test attempt not found'
      ) {
        alert('Invalid link or attempt');
      } else if (
        axios.isAxiosError(error) &&
        (error.response?.data?.message === 'Test has already been submitted' ||
          error.response?.data?.message === 'You have already attended the test')
      ) {
        setSubmitted(true);
      } else {
        // First-time fallback: assigned
        try {
          const assignedUrl = `http://localhost:3000/applicant-questions/assigned/${applicantId}/${attemptId}`;
          const assignedResponse = await axios.get<ApiQuestion[]>(assignedUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setQuestions(assignedResponse.data);
          setCurrentIndex(0);
          handle.enter();
          setStarted(true);
        } catch (innerErr) {
          console.error('Unable to fetch questions:', innerErr);
          alert('Something went wrong while starting the test.');
        }
      }
    }
  };

  return (
    <FullScreen handle={handle}>
      <div className="main-container">
        <div className="mcq-test-container">
          {!started && !submitted ? (
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
          ) : submitted && !started ? (
            <div className="result">
              <h3>Test Already Completed</h3>
              <p>You have already completed this test. You cannot retake it.</p>
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
                      onClick={handleNext}
                      disabled={!answers[questions[currentIndex].mcq_question.id]}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      className="submit-button"
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
