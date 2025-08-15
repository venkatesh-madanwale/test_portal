import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import WebcamCapture from './WebcamCapture';
import TestNavBar from './TestNavBar';
import Alerts from './Alerts';
import "./ProctalApp.css";

type MalpracticeEntry = {
  message: string;
  imageUrl: string;
  timestamp: string;
};

interface ProctalAppProps {
  handleStartTest: () => void;
  isTestStarted: boolean;
  applicantId: string;
  setCapturedImage: (image: string) => void;
  setAlertMessage: (msg: string) => void;
  onMalpracticeDetected: (msg: string, imgUrl: string) => void;
  isTestCompleted: boolean;
  setIsTestCompleted: (v: boolean) => void;
  onFaceVerified: () => void;
  isFaceVerified: boolean;
}

const ProctalApp = ({ handleStartTest }: ProctalAppProps) => {
  const { token, applicantId, attemptId } = useParams();
  const [capturedImage, setCapturedImage] = useState<string | undefined>(undefined);
  const [alertMessage, setAlertMessage] = useState<string>('');
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
    sessionStorage.setItem('testStarted', 'true');
  };

  console.log(sessionStorage.getItem('testStarted'));


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
              timestamp: new Date().toISOString(),
            },
          ]);
        }
        return newCount;
      });
    }
  };

  const handleFaceVerified = () => {
    setIsFaceVerified(true);
  };
  // Fallback if applicantId is missing
  if (!applicantId) {
    return <div className="error">Invalid URL: applicant ID is missing</div>;
  }
  
  

  return (
  <div className="proctor-wrapper">
    <TestNavBar capturedImage={capturedImage} />

    {/* Instructions Panel */}
    {!sessionStorage.getItem('testStarted') && (
      <div className="agreement-panel">
        <h2>Test Instructions</h2>
        <p>Please make sure you are alone and visible on camera. Your session is being monitored.</p>
        <ul>
          <li>🔒 Stay in fullscreen mode.</li>
          <li>📷 Do not leave the camera view.</li>
          <li>🚫 No multiple faces or background noise.</li>
        </ul>
        <button onClick={handleAgree}>I Agree & Start Test</button>
      </div>
    )}

    {/* Violation count badge */}
    {sessionStorage.getItem('testStarted') && !isTestCompleted && (
      <div className={`malpractice-badge ${malpracticeCount > 3 ? 'alert' : ''}`}>
        Violations: {malpracticeCount}/5
      </div>
    )}
    <div className="webcam-section">
      {/* ✅ Always Render WebcamCapture for continuous monitoring */}
      {sessionStorage.getItem('testStarted') && (
        <WebcamCapture
          applicantId={applicantId}
          setCapturedImage={setCapturedImage}
          setAlertMessage={setAlertMessage}
          onMalpracticeDetected={handleMalpracticeDetected}
          isTestStarted={isTestStarted}
          isTestCompleted={isTestCompleted}
          setIsTestCompleted={setIsTestCompleted}
          isFaceVerified={isFaceVerified}
          onFaceVerified={handleFaceVerified}
          handleStartTest={handleStartTest}
        />
      )}
    </div>
    <Alerts message={alertMessage} />
  </div>
);


};

export default ProctalApp;
