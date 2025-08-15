import React from "react";
import { useDispatch, useSelector } from "react-redux";
import WebcamCapture from "./components/WebcamCapture";
import Alerts from "./components/Alerts";
import "./App.css";

import {
  setAlertMessage,
  setCapturedImage,
  setIsTestCompleted,
  setIsTestStarted,
  incrementMalpractice,
  setVerificationComplete,
} from "./redux/proctorSlice";

import { RootState } from "./redux/store";
import Navbar from "./components/navbar";

const App: React.FC = () => {
  const dispatch = useDispatch();

  const {
    capturedImage,
    alertMessage,
    isTestStarted,
    isTestCompleted,
    malpracticeCount,
    verificationComplete,
  } = useSelector((state: RootState) => state.proctor);

  const applicantId = "0d708def-c216-4787-bf21-efb0e2eb91ab";

  const handleVerificationComplete = (): void => {
    dispatch(setVerificationComplete(true));
    dispatch(setIsTestStarted(true));
    dispatch(setAlertMessage("✅ Verification complete - Test started!"));
  };

  const handleMalpracticeDetected = (): void => {
    if (verificationComplete) {
      const newCount = malpracticeCount + 1;
      dispatch(incrementMalpractice());

      if (newCount >= 5) {
        dispatch(
          setAlertMessage("❌ Test terminated due to multiple malpractices.")
        );
        dispatch(setIsTestCompleted(true));

        setTimeout(() => {
          window.location.href = "about:blank"; // or any exit/thank-you page
        }, 10000);
      }
    }
  };

  return (
    <div>
      <Navbar capturedImage={capturedImage} />
      <div className="main-content">
        {isTestStarted && !isTestCompleted && (
          <div className="violation-count">
            Violations: {malpracticeCount}/5
          </div>
        )}
        <WebcamCapture
          onMalpracticeDetected={handleMalpracticeDetected}
          isTestStarted={isTestStarted}
          isTestCompleted={isTestCompleted}
          onVerificationComplete={handleVerificationComplete}
          applicantId={applicantId}
        />
      </div>
      <Alerts message={alertMessage} />
    </div>
  );
};

export default App;