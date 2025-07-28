import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import WebcamCapture from './WebcamCapture';
import TestNavBar from './TestNavBar';
import Alerts from './Alerts';
import "./ProctalApp.css"

type MalpracticeEntry = {
  message: string;
  imageUrl: string;
  timestamp: string;
};

const ProctalApp = () => {
  const { applicantId } = useParams<{ applicantId: string }>();

  const [capturedImage, setCapturedImage] = useState<string | undefined>(undefined);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [showAgreement, setShowAgreement] = useState<boolean>(true);
  const [isTestStarted, setIsTestStarted] = useState<boolean>(false);
  const [isTestCompleted, setIsTestCompleted] = useState<boolean>(false);
  const [malpracticeCount, setMalpracticeCount] = useState<number>(0);
  const [malpracticeData, setMalpracticeData] = useState<MalpracticeEntry[]>([]);
  const [isFaceVerified, setIsFaceVerified] = useState<boolean>(false);

  useEffect(() => {
    if (malpracticeCount >= 5 && !isTestCompleted) {
      setIsTestCompleted(true);
      setAlertMessage("❌ Test terminated due to multiple malpractices (5 violations detected)");
    }
  }, [malpracticeCount, isTestCompleted]);

  const handleAgree = () => {
    setShowAgreement(false);
    setIsTestStarted(true);
  };

  const handleExit = () => {
    if (window.confirm("Are you sure you want to exit the test? This will end your session.")) {
      resetTest();
    }
  };

  const resetTest = () => {
    setCapturedImage(undefined);
    setAlertMessage("");
    setShowAgreement(true);
    setIsTestStarted(false);
    setIsTestCompleted(false);
    setMalpracticeCount(0);
    setMalpracticeData([]);
    setIsFaceVerified(false);
  };

  const handleMalpracticeDetected = (message: string, imageUrl: string) => {
    if (isFaceVerified && !alertMessage.startsWith("⚠️")) {
      setMalpracticeCount(prev => {
        const newCount = prev + 1;
        if (newCount <= 5) {
          setMalpracticeData(prevData => [
            ...prevData,
            {
              message,
              imageUrl,
              timestamp: new Date().toISOString()
            }
          ]);
        }
        return newCount;
      });
    }
  };

  const handleFaceVerified = () => {
    setIsFaceVerified(true);
  };

  const handleTimeComplete = () => {
    setIsTestCompleted(true);
    setAlertMessage("✅ Test completed successfully!");
  };

  return (
    <div className="proctor-wrapper">
  <>
    <TestNavBar capturedImage={capturedImage} onExit={handleExit} />

    {isTestStarted && !isTestCompleted && isFaceVerified && (
      <div
        className={`malpractice-badge ${malpracticeCount > 3 ? 'alert' : ''}`}
     >
        Violations: {malpracticeCount}/5
      </div>
    )}

    <div className="webcam-section">
      {/* Verified face preview */}
      {capturedImage && (
        <div className="verified-image-container">
          <img src={capturedImage} alt="Verified Face" />
          <label>Verified Face</label>
        </div>
      )}

      {/* Live webcam */}
      {isTestStarted && !isTestCompleted && applicantId && (
        <WebcamCapture
          applicantId={applicantId}
          setCapturedImage={setCapturedImage}
          setAlertMessage={setAlertMessage}
          onMalpracticeDetected={handleMalpracticeDetected}
          isTestStarted={isTestStarted}
          isTestCompleted={isTestCompleted}
          setIsTestCompleted={setIsTestCompleted}
          isFaceVerified={isFaceVerified}
          onFaceVerified={handleFaceVerified}        />
      )}
    </div>

        <Alerts message={alertMessage} />
      </>
    </div>
  );
};

export default ProctalApp;
