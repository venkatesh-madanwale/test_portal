import axios from 'axios';
import './Test.css';
import './ConfirmModal.css';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmModal from './ConfirmModal';

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

export interface ApiQuestion {
  id: string;
  status: 'not_visited' | 'skipped' | 'answered';
  selectedOptionId: string | null;
  editable: boolean;
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
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submittingFinal, setSubmittingFinal] = useState(false);
  const [unlockedIndex, setUnlockedIndex] = useState(0);

  const handle = useFullScreenHandle();

  useEffect(() => {
    const saved = localStorage.getItem(`timer-${attemptId}`);
    if (saved) setTimeLeft(Number(saved));
  }, [attemptId]);

  useEffect(() => {
    if (!started || submitted) return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) toast.warning('You exited fullscreen.');
    };

    const handleTabChange = () => {
      if (document.hidden) toast.warning('Tab switching is not allowed.');
    };

    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave?';
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleTabChange);
    window.addEventListener('beforeunload', beforeUnload);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleTabChange);
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, [started, submitted]);

  useEffect(() => {
    if (!started || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        localStorage.setItem(`timer-${attemptId}`, newTime.toString());
        if (newTime <= 0) {
          clearInterval(timer);
          handleFinalSubmit();
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, submitted, attemptId]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleOptionSelect = (questionId: string, optionId: string) => {
    const question = questions[currentIndex];
    if (!question.editable) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const updateQuestionStatus = (index: number, status: 'answered' | 'skipped', editable: boolean) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, status, editable } : q))
    );
  };




  const handleNext = async () => {
    const q = questions[currentIndex];
    const selected = answers[q.mcq_question.id];

    if (!selected && q.status !== 'answered') {
      toast.warning('Please select an option or click Skip to proceed.');
      return;
    }

    if (q.status !== 'answered') {
      try {
        await axios.post(
          'http://localhost:3000/applicant-questions/answer',
          {
            applicantId,
            attemptId,
            questionId: q.mcq_question.id,
            selectedOptionId: selected,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        updateQuestionStatus(currentIndex, 'answered', false);
      } catch {
        toast.error('Failed to save answer');
        return;
      }
    }

    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setUnlockedIndex((prev) => Math.max(prev, nextIndex)); // unlock next question
    }
  };




  const handleSkip = async () => {
    const q = questions[currentIndex];
    if (q.status === 'answered') return;
    try {
      await axios.patch(
        'http://localhost:3000/applicant-questions/skip',
        { applicantId, attemptId, questionId: q.mcq_question.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateQuestionStatus(currentIndex, 'skipped', true);
      const nextIndex = Math.min(currentIndex + 1, questions.length - 1);
      setCurrentIndex(nextIndex);
      setUnlockedIndex((prev) => Math.max(prev, nextIndex)); // Unlock next
    } catch {
      toast.error('Error skipping question');
    }
  };

  const handleFinalSubmit = async () => {
    setSubmittingFinal(true);
    try {
      for (const q of questions) {
        const selected = answers[q.mcq_question.id];
        if (selected && q.status !== 'answered') {
          await axios.post(
            'http://localhost:3000/applicant-questions/answer',
            {
              applicantId,
              attemptId,
              questionId: q.mcq_question.id,
              selectedOptionId: selected
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }

      localStorage.removeItem(`timer-${attemptId}`);

      const res = await axios.get(
        `http://localhost:3000/applicant-questions/evaluate/${applicantId}/${attemptId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSubmitted(true);
      setScore(res.data.correct);
      toast.success('Test submitted successfully!');
    } catch {
      toast.error('Submission failed');
    } finally {
      setShowConfirmModal(false);
      setSubmittingFinal(false);
    }
  };

  const handleStartTest = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:3000/applicant-questions/resume/${applicantId}/${attemptId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const all = res.data.questions;
      const lastSeen = res.data.lastSeenQuestion;
      const index = lastSeen
        ? all.findIndex((q: ApiQuestion) => q.mcq_question.id === lastSeen.id)
        : 0;

      setQuestions(all);

      //  Pre-fill selected options into answers state
      const initialAnswers: { [key: string]: string } = {};
      all.forEach((q: ApiQuestion) => {
        if (q.selectedOptionId) {
          initialAnswers[q.mcq_question.id] = q.selectedOptionId;
        }
      });
      setAnswers(initialAnswers);

      console.log("✅ Initial answers state:", initialAnswers);
      setCurrentIndex(index >= 0 ? index : 0);
      handle.enter();
      setStarted(true);
      toast.info(`Attempts left: ${3 - (res.data.attemptCount ?? 0)}`);
    } catch {
      toast.error('Unable to resume test');
    } finally {
      setLoading(false);
    }
  };


  const answeredCount = questions.filter((q) => q.status === 'answered').length;
  console.log('🟢 answers:', answers);
  console.log('🟢 currentIndex:', currentIndex);
  console.log('🟢 currentQ ID:', questions[currentIndex]?.mcq_question.id);
  console.log('🟢 selected from answers:', answers[questions[currentIndex]?.mcq_question.id]);


  return (
    <FullScreen handle={handle}>
      <div className="main-container">
        <ToastContainer />
        {loading ? (
          <div className="spinner">Loading test...</div>
        ) : (
          <div className="mcq-test-container">
            {!started && !submitted ? (
              <div className="instructions">
                <h2>Instructions</h2>
                <ul>
                  <li>Do not switch tabs or exit fullscreen.</li>
                  <li>Test auto-submits after 45 minutes.</li>
                  <li>Each question must be answered or skipped.</li>
                </ul>
                <button className="submit-button" onClick={handleStartTest}>
                  Start Test
                </button>
              </div>
            ) : submitted ? (
              <div className="result">
                <h3>Test Completed</h3>
                <p>Your Score: {score} / {questions.length}</p>
              </div>
            ) : (
              <>
                <div className="question-block">
                  <h2 className="test-title">MCQ Test</h2>
                  <p className="question-title">
                    {currentIndex + 1}. {questions[currentIndex].mcq_question.questionTitle}
                  </p>
                  {!questions[currentIndex].editable && (
                    <div className="edit-warning">
                      ⚠️ You’ve already submitted this answer. You cannot edit it.
                    </div>
                  )}
                  <div className="options-list">
                    {questions[currentIndex].mcq_question.options.map((opt) => (

                      <label key={opt.id} className="option-item">
                        <input
                          type="radio"
                          name={questions[currentIndex].mcq_question.id}
                          value={opt.id}
                          checked={String(answers[questions[currentIndex].mcq_question.id]) === String(opt.id)}
                          onChange={() =>
                            handleOptionSelect(questions[currentIndex].mcq_question.id, opt.id)
                          }
                          disabled={!questions[currentIndex].editable}
                        />

                        {opt.optionText}
                      </label>
                    ))}
                  </div>

                  <div style={{ marginTop: '1.5rem' }}>
                    <button className="skip-button" onClick={handleSkip} disabled={questions[currentIndex].status === 'answered'}>
                      Skip
                    </button>
                    &nbsp;&nbsp;
                    <button className="submit-button" onClick={handleNext}>
                      {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
                    </button>
                  </div>
                </div>

                <div className="sidebar">
                  <div className="sidebar-header">
                    <div className="timer">Time Left: {formatTime(timeLeft)}</div>
                    <div className="progress">
                      Answered: {answeredCount} / {questions.length}
                    </div>
                  </div>
                  <div className="question-nav">
                    {questions.map((q, idx) => {
                      const isCurrent = idx === currentIndex;

                      const firstUnansweredIndex = questions.findIndex(
                        (q) => q.status === 'not_visited'
                      );

                      const allAttempted = questions.every(
                        (q) => q.status === 'answered' || q.status === 'skipped'
                      );

                      const allow =
                        allAttempted ||
                        isCurrent ||
                        idx <= firstUnansweredIndex ||
                        (idx < currentIndex &&
                          (questions[idx].status === 'answered' || questions[idx].status === 'skipped'));

                      return (
                        <div
                          key={q.id}
                          className={`question-number ${q.status} ${isCurrent ? 'active' : ''
                            } ${!allow ? 'no-pointer disabled' : ''}`}
                          onClick={() => {
                            if (allow) setCurrentIndex(idx);
                          }}
                        >
                          {idx + 1}
                        </div>
                      );
                    })}
                  </div>


                  {questions.length > 0 &&
                    questions.every(q => q.status === 'answered' || q.status === 'skipped') && (
                      <button className="submit-button" style={{ marginTop: '20px' }} onClick={() => setShowConfirmModal(true)}>
                        Submit Test
                      </button>
                    )}
                </div>

                {showConfirmModal && (
                  <ConfirmModal
                    answeredCount={answeredCount}
                    totalQuestions={questions.length}
                    onCancel={() => setShowConfirmModal(false)}
                    onConfirm={handleFinalSubmit}
                    isSubmitting={submittingFinal}
                  />
                )}

              </>
            )}
          </div>
        )}
      </div>
    </FullScreen>
  );
};

export default Test;
