import './Test.css';
import '../ConfirmModal.css';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmModal from '../ConfirmModal';
import Result from './Results';
import QuestionBlock from './QuestionBlock';
import Sidebar from './Sidebar';
import { formatTime } from './Utils';
import type { ApiQuestion } from "../Test";
import axios from 'axios';
import ProctalApp from '../Proctal/ProctalApp';

const TestPage = () => {
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

  const [capturedImage, setCapturedImageState] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string>("");

  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [isFaceVerified, setIsFaceVerified] = useState(false);

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

  const updateQuestionStatus = (index: number, status: 'answered' | 'skipped', editable: boolean) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, status, editable } : q))
    );
  };

  const handleOptionSelect = (questionId: string, optionId: string) => {
    const question = questions[currentIndex];
    if (!question.editable) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
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
          { applicantId, attemptId, questionId: q.mcq_question.id, selectedOptionId: selected },
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
      setUnlockedIndex((prev) => Math.max(prev, nextIndex));
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
      setUnlockedIndex((prev) => Math.max(prev, nextIndex));
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

      const initialAnswers: { [key: string]: string } = {};
      all.forEach((q: ApiQuestion) => {
        if (q.selectedOptionId) {
          initialAnswers[q.mcq_question.id] = q.selectedOptionId;
        }
      });
      setAnswers(initialAnswers);
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

  function setCapturedImage(image: string): void {
    setCapturedImageState(image);
  }

  function onMalpracticeDetected(message: string, imageUrl: string) {
    toast.warn(`Malpractice Detected: ${message}`);
    console.warn("Malpractice image:", imageUrl);
  }

  function handleFaceVerified() {
    setIsFaceVerified(true);
  }

  const answeredCount = questions.filter((q) => q.status === 'answered').length;


  return (
  <div className="main-container">
    <ToastContainer />
    {loading ? (
      <div className="spinner">Loading test...</div>
    ) : (
      <div className="mcq-test-container">
        {/* ✅ Always Render Proctoring */}
        <ProctalApp
          handleStartTest={handleStartTest}
          isTestStarted={started}
          applicantId={applicantId ?? ""}
          setCapturedImage={setCapturedImage}
          setAlertMessage={setAlertMessage}
          onMalpracticeDetected={onMalpracticeDetected}
          isTestCompleted={submitted}
          setIsTestCompleted={setIsTestCompleted}
          onFaceVerified={handleFaceVerified}
          isFaceVerified={isFaceVerified}
        />

        {/* ✅ Conditional Test Render */}
        {submitted ? (
          <Result score={score} total={questions.length} />
        ) : started ? (
          <>
            <QuestionBlock
              currentQuestion={questions[currentIndex]}
              currentIndex={currentIndex}
              answers={answers}
              handleOptionSelect={handleOptionSelect}
              handleNext={handleNext}
              handleSkip={handleSkip}
            />
            <Sidebar
              questions={questions}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              answeredCount={answeredCount}
              timeLeft={timeLeft}
              formatTime={formatTime}
              setShowConfirmModal={setShowConfirmModal}
            />
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
        ) : null}
      </div>
    )}
  </div>
);


};

export default TestPage;
