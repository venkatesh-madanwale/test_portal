import React from "react";
import { useDispatch, useSelector } from "react-redux";
import WebcamCapture from "./WebcamCapture";
import "./ProctorApp.css";

import {
  setAlertMessage,
  setIsTestCompleted,
  setIsTestStarted,
  incrementMalpractice,
  setVerificationComplete,
} from "../../../redux/slices/proctorSlice";

import { type RootState } from "../../../redux/store";

const ProctorApp: React.FC = () => {
  const dispatch = useDispatch();

  const {
    isTestStarted,
    isTestCompleted,
    malpracticeCount,
    verificationComplete,
  } = useSelector((state: RootState) => state.proctor);

  const applicantId = localStorage.getItem("applicantId") || "";

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
    </div>
  );
};

export default ProctorApp;