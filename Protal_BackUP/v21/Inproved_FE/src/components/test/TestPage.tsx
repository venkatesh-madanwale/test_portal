// Updated TestPage.tsx using Redux Toolkit and createAsyncThunk
import "../css/TestPage.css";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useFullScreenHandle } from "react-full-screen";
import { ToastContainer, toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import ConfirmModal from "../test/ConfirmModal";
import QuestionBlock from "./QuestionBlock";
import Sidebar from "./Sidebar";

import {
  fetchTestData,
  submitAnswer,
  skipQuestion,
  evaluateTest
} from "../../redux/slices/test/testThunks";
import {
  type RootState
} from "../../redux/store";
import {
  setStarted,
  setCurrentIndex,
  setAnswer,
  decrementTime
} from "../../redux/slices/test/testSlice";

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const TestPage = () => {
  const { token, applicantId, attemptId } = useParams();
  const dispatch = useDispatch<any>();
  const handle = useFullScreenHandle();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submittingFinal, setSubmittingFinal] = useState(false);

  const {
    questions,
    answers,
    currentIndex,
    submitted,
    score,
    timeLeft,
    started,
    loading
  } = useSelector((state: RootState) => state.test);

  useEffect(() => {
    const saved = localStorage.getItem(`timer-${attemptId}`);
    if (saved) {
      // timer restoration if needed
    }
  }, [attemptId]);

  useEffect(() => {
    if (!started || submitted) return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) toast.warning("You exited fullscreen.");
    };
    const handleTabChange = () => {
      if (document.hidden) toast.warning("Tab switching is not allowed.");
    };
    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave?";
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleTabChange);
    window.addEventListener("beforeunload", beforeUnload);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleTabChange);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [started, submitted]);

  useEffect(() => {
    if (!started || submitted) return;
    const timer = setInterval(() => {
      dispatch(decrementTime());
    }, 1000);
    return () => clearInterval(timer);
  }, [started, submitted, dispatch]);

  // Handler Functions
  const handleOptionSelect = (questionId: string, optionId: string) => {
    const question = questions[currentIndex];
    if (!question.editable) return;
    dispatch(setAnswer({ questionId, optionId }));
  };

  const handleNext = async () => {
    const q = questions[currentIndex];
    const selected = answers[q.mcq_question.id];
    if (!selected && q.status !== "answered") {
      toast.warning("Please select an option or click Skip to proceed.");
      return;
    }
    if (q.status !== "answered") {
      await dispatch(
        submitAnswer({ token, applicantId, attemptId, questionId: q.mcq_question.id, selectedOptionId: selected })
      );
    }
    if (currentIndex < questions.length - 1) {
      dispatch(setCurrentIndex(currentIndex + 1));
    }
  };

  const handleSkip = async () => {
    const q = questions[currentIndex];
    if (q.status === "answered") return;
    await dispatch(skipQuestion({ token, applicantId, attemptId, questionId: q.mcq_question.id }));
    if (currentIndex < questions.length - 1) {
      dispatch(setCurrentIndex(currentIndex + 1));
    }
  };

  const handleFinalSubmit = async () => {
    setSubmittingFinal(true);
    await dispatch(evaluateTest({ token, applicantId, attemptId }));
    localStorage.removeItem(`timer-${attemptId}`);
    setSubmittingFinal(false);
    setShowConfirmModal(false);
    toast.success("Test submitted successfully!");
  };

  const handleStartTest = async () => {
    await dispatch(fetchTestData({ token, applicantId, attemptId }));
    handle.enter();
    dispatch(setStarted(true));
    toast.info("Test started. Good luck!");
  };

  const answeredCount = questions.filter((q) => q.status === "answered").length;

  return (
    <>

      {/* // Main container */}
      <div className="main-container">
        <ToastContainer position="bottom-left"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored" />
        {loading ? (
          <div className="spinner">Loading test...</div>
        ) : (
          <div className="mcq-test-container">
            {!started && !submitted ? (

              // Instructions
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

              //Results
              <div className="result">
                <h3>Test Completed</h3>
                <p>Your Score: {score} / {questions.length}</p>
              </div>

            ) : (
              <>
                {/* //QuestionBlock */}
                <QuestionBlock
                  currentQuestion={questions[currentIndex]}
                  currentIndex={currentIndex}
                  answers={answers}
                  handleOptionSelect={handleOptionSelect}
                  handleNext={handleNext}
                  handleSkip={handleSkip}
                />


                {/* Side Bar */}
                <Sidebar
                  questions={questions}
                  currentIndex={currentIndex}
                  setCurrentIndex={(index) => dispatch(setCurrentIndex(index))}
                  answeredCount={answeredCount}
                  timeLeft={timeLeft}
                  formatTime={formatTime}
                  setShowConfirmModal={setShowConfirmModal}
                />


                {/* ConfirModal */}
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
    </>
  );
};

export default TestPage;