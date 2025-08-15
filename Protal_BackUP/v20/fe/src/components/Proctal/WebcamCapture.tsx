import { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import "./WebcamCapture.css";

interface WebcamCaptureProps {
  applicantId: string;
  setCapturedImage: (image: string) => void;
  setAlertMessage: (msg: string) => void;
  onMalpracticeDetected: (message: string, imageUrl: string) => void;
  isTestStarted: boolean;
  isTestCompleted: boolean;
  setIsTestCompleted: (status: boolean) => void;
  isFaceVerified: boolean;
  onFaceVerified: () => void;
  handleStartTest: () => void;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({
  applicantId,
  setCapturedImage,
  setAlertMessage,
  onMalpracticeDetected,
  isTestStarted,
  isTestCompleted,
  setIsTestCompleted,
  isFaceVerified,
  onFaceVerified,
  handleStartTest,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetectionPaused, setIsDetectionPaused] = useState(false);
  const [lastViolationTime, setLastViolationTime] = useState(0);
  const [lastAlertMessage, setLastAlertMessage] = useState("");


  const [set, setSet] = useState(false)

  const getWarningMessage = useCallback((alertMessage: string): string => {
    switch (alertMessage) {
      case "Face Not Detected":
        return "⚠️ Face not detected. Sit properly in front of the camera";
      case "Multiple Faces Detected":
        return "⚠️ Multiple faces detected. You must be alone";
      case "Face Mismatch Detected":
        return "⚠️ Face mismatch. Identity does not match";
      default:
        return "⚠️ Please follow proctoring rules";
    }
  }, []);

  const captureAndReportMalpractice = useCallback(
    async (message: string, isWarning = false) => {
      if (isTestCompleted || !isFaceVerified) return;
      if (!isWarning && Date.now() - lastViolationTime < 5000) return;

      try {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) return;

        if (!isWarning) {
          const blob = await (await fetch(imageSrc)).blob();
          const file = new File([blob], "malpractice.jpg", { type: blob.type });

          const formData = new FormData();
          formData.append("file", file);
          formData.append("alertMessage", message);
          formData.append("applicantId", applicantId);

          const res = await axios.post("http://localhost:3000/malpractice/alert", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          onMalpracticeDetected(message, res.data.malpracticeImageUrl);
          setLastViolationTime(Date.now());
        }

        setIsDetectionPaused(true);
        setLastAlertMessage(message);
        setAlertMessage(isWarning ? getWarningMessage(message) : `🚫 ${message}`);

        setTimeout(() => {
          setIsDetectionPaused(false);
          setAlertMessage(getWarningMessage(message));
        }, 2000);
      } catch (error) {
        console.error("Error reporting malpractice:", error);
        setAlertMessage("⚠️ Failed to report malpractice");
      }
    },
    [applicantId, getWarningMessage, isTestCompleted, isFaceVerified, lastViolationTime, onMalpracticeDetected, setAlertMessage]
  );

  const checkFaceDetection = useCallback(async () => {
    if (!webcamRef.current || !applicantId || isTestCompleted) return false;
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return false;

      const blob = await (await fetch(imageSrc)).blob();
      const file = new File([blob], "check_face.jpg", { type: blob.type });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("applicant_id", applicantId);

      const res = await axios.post("http://localhost:8000/verify", formData);
      return res.data.status !== "face_not_detected";
    } catch (error) {
      console.error("Face check error:", error);
      return false;
    }
  }, [applicantId, isTestCompleted]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const monitorFace = async () => {
      if (verificationComplete || isTestCompleted) return;

      const detected = await checkFaceDetection();
      setFaceDetected(detected);

      setAlertMessage(
        detected
          ? "✅ Face detected - ready for verification"
          : "🚫 Face not detected - please position your face in the circle"
      );
    };

    if (applicantId && !verificationComplete && !isTestCompleted) {
      monitorFace();
      interval = setInterval(monitorFace, 1000);
    }

    return () => clearInterval(interval);
  }, [applicantId, verificationComplete, isTestCompleted, checkFaceDetection, setAlertMessage]);

  useEffect(() => {
    let interval: number;
    const liveDetection = async () => {
      if (!webcamRef.current || isDetectionPaused || !isTestStarted || isTestCompleted) return;

      try {
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        const blob = await (await fetch(imageSrc)).blob();
        const file = new File([blob], "live.jpg", { type: blob.type });

        const formData = new FormData();
        formData.append("file", file);
        formData.append("applicant_id", applicantId);

        const res = await axios.post("http://localhost:8000/verify/embedding", formData);
        const status = res.data.status;

        switch (status) {
          case "verified":
            setAlertMessage("✅ Face Verified");
            setFaceDetected(true);
            break;
          case "mismatch":
            setFaceDetected(false);
            await captureAndReportMalpractice("Face Mismatch Detected");
            break;
          case "face_not_detected":
            setFaceDetected(false);
            await captureAndReportMalpractice("Face Not Detected");
            break;
          case "multiple_faces":
            setFaceDetected(false);
            await captureAndReportMalpractice("Multiple Faces Detected");
            break;
          case "no_reference_face":
            setAlertMessage("ℹ️ Please register your face first.");
            break;
          default:
            setAlertMessage("❗ Unknown verification error.");
        }
      } catch (err) {
        console.error("Live detection error:", err);
        setAlertMessage("⚠️ Error during verification.");
      }
    };

    if (isTestStarted && !isTestCompleted && isRegistered) {
      liveDetection();
      interval = setInterval(liveDetection, 3000);
    }

    return () => clearInterval(interval);
  }, [
    isTestStarted,
    isTestCompleted,
    isRegistered,
    applicantId,
    isDetectionPaused,
    captureAndReportMalpractice,
    setAlertMessage,
  ]);

  const registerCandidate = async (imageSrc: string) => {
    const blob = await (await fetch(imageSrc)).blob();
    const file = new File([blob], "profile.jpg", { type: blob.type });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("applicantId", applicantId);

    return axios.post("http://localhost:3000/malpractice/register-candidate", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
  };

  const verifyIdentity = async (imageSrc: string) => {
    const blob = await (await fetch(imageSrc)).blob();
    const file = new File([blob], "verify.jpg", { type: blob.type });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("applicant_id", applicantId);

    return axios.post("http://localhost:8000/verify", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  const capture = async () => {
    if (!faceDetected || !applicantId || isTestCompleted) {
      setAlertMessage("🚫 Cannot capture – No valid face detected or missing user ID");
      return;
    }

    setIsLoading(true);
    setAlertMessage("⏳ Verifying your identity...");

    try {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) throw new Error("Webcam not ready");

      await registerCandidate(imageSrc);
      const verifyResponse = await verifyIdentity(imageSrc);
      const status = verifyResponse.data.status;

      let message = "";

      switch (status) {
        case "face_not_detected":
          message = "🚫 Face not detected – please look at the camera.";
          break;
        case "multiple_faces":
          message = "⚠️ Multiple faces detected – only one person allowed.";
          break;
        case "mismatch":
          message = "❌ Face mismatch – identity verification failed.";
          break;
        case "identity_registered":
        case "verified":
          message = "✅ Face verified successfully.";
          setIsRegistered(true);
          setVerificationComplete(true);
          onFaceVerified();
          break;
        default:
          message = "❗ Unknown verification response.";
      }

      setCapturedImage(imageSrc);
      setAlertMessage(message);
    } catch (error: any) {
      console.error("Error during verification:", error);
      setAlertMessage(`❌ Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="webcam-container">
        <div
          className={`webcam-frame ${faceDetected ? "face-yes" : "face-no"}`}
        >
          <Webcam
            ref={webcamRef}
            className="webcam-view"
            screenshotFormat="image/jpeg"
            width={300}
            height={300}
            videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
            onUserMediaError={() =>
              setAlertMessage("🚫 Camera access denied or not available")
            }
          />
        </div>

        {!verificationComplete && !isTestCompleted && (
          <button
            className={`verify-button ${faceDetected ? "enabled" : "disabled"}`}
            onClick={capture}
            disabled={!faceDetected || isLoading}
          >
            {isLoading
              ? "Processing..."
              : faceDetected
                ? "✅ Capture & Verify Identity"
                : "🔍 Face Not Detected"}
          </button>
        )}


        {verificationComplete &&
          <button onClick={() => handleStartTest()}>
            Start Test
          </button>}
      </div>
    </>

  );
};

export default WebcamCapture;
