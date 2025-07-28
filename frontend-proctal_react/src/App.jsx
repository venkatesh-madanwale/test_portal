import React, { useState, useEffect } from 'react';
import WebcamCapture from './components/WebcamCapture';
import Navbar from './components/Navbar';
import Alerts from './components/Alerts';
import AgreementModal from './components/AgreementModal';
import CountdownTimer from './components/CountdownTimer';

const App = () => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAgreement, setShowAgreement] = useState(true);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [malpracticeCount, setMalpracticeCount] = useState(0);
  const [malpracticeData, setMalpracticeData] = useState([]);
  const [isFaceVerified, setIsFaceVerified] = useState(false);

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
    setCapturedImage(null);
    setAlertMessage("");
    setShowAgreement(true);
    setIsTestStarted(false);
    setIsTestCompleted(false);
    setMalpracticeCount(0);
    setMalpracticeData([]);
    setIsFaceVerified(false);
  };

  const handleMalpracticeDetected = (message, imageUrl) => {
    // Only count violations after face verification and when it's not a warning
    if (isFaceVerified && !alertMessage.startsWith("⚠️")) {
      setMalpracticeCount(prev => {
        const newCount = prev + 1;
        if (newCount <= 5) {
          setMalpracticeData(prevData => [...prevData, { 
            message, 
            imageUrl, 
            timestamp: new Date().toISOString() 
          }]);
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {showAgreement ? (
        <AgreementModal onAgree={handleAgree} />
      ) : (
        <>
          <Navbar capturedImage={capturedImage} onExit={handleExit} />
          {isTestStarted && !isTestCompleted && isFaceVerified && (
            <div style={{
              position: 'fixed',
              top: 80,
              right: 20,
              backgroundColor: malpracticeCount > 3 ? '#ffebee' : '#e8f5e9',
              padding: '5px 10px',
              borderRadius: '5px',
              borderLeft: `3px solid ${malpracticeCount > 3 ? '#f44336' : '#4CAF50'}`,
              zIndex: 1000
            }}>
              Violations: {malpracticeCount}/5
            </div>
          )}
          <div style={{ padding: '20px', flex: 1 }}>
            {isTestStarted && !isTestCompleted && (
              <CountdownTimer duration={2} onComplete={handleTimeComplete} />
            )}
            <WebcamCapture 
              setCapturedImage={setCapturedImage} 
              setAlertMessage={setAlertMessage}
              onMalpracticeDetected={handleMalpracticeDetected}
              isTestStarted={isTestStarted}
              isTestCompleted={isTestCompleted}
              setIsTestCompleted={setIsTestCompleted}
              isFaceVerified={isFaceVerified}
              onFaceVerified={handleFaceVerified}
            />
          </div>
          <Alerts message={alertMessage} />
        </>
      )}
    </div>
  );
};

export default App;