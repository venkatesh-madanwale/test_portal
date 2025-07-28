import React, { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import axios from "axios";

const WebcamCapture = ({
  setCapturedImage,
  setAlertMessage,
  onMalpracticeDetected,
  isTestStarted,
  isTestCompleted,
  setIsTestCompleted,
  isFaceVerified,
  onFaceVerified,
}) => {
  const webcamRef = useRef(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  // const [applicantId, setApplicantId] = useState("0a15dded-af9b-49af-807a-98e9ced9fa76");
  const applicantId = "7e9de9a3-8e0d-4450-8538-8c30f6d00044"
  const [isLoading, setIsLoading] = useState(false);
  const [isDetectionPaused, setIsDetectionPaused] = useState(false);
  const [lastViolationTime, setLastViolationTime] = useState(0);
  const [lastAlertMessage, setLastAlertMessage] = useState("");


  const getWarningMessage = useCallback((alertMessage) => {
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
    async (message, isWarning = false) => {
      if (isTestCompleted || !isFaceVerified) return;

      // Skip if we had a violation in the last 5 seconds
      if (!isWarning && Date.now() - lastViolationTime < 5000) {
        return;
      }

      try {
        const imageSrc = webcamRef.current.getScreenshot();
        
        if (!isWarning) {
          const blob = await (await fetch(imageSrc)).blob();
          const file = new File([blob], "malpractice.jpg", { type: blob.type });

          const formData = new FormData();
          formData.append("file", file);
          formData.append("alertMessage", message);
          formData.append("applicantId", applicantId);

          const res = await axios.post(
            "http://localhost:3000/malpractice/alert",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          onMalpracticeDetected(message, res.data.malpracticeImageUrl);
          setLastViolationTime(Date.now());
        }

        setIsDetectionPaused(true);
        setLastAlertMessage(message);
        setAlertMessage(
          isWarning ? getWarningMessage(message) : `🚫 ${message}`
        );
        
        setTimeout(() => {
          setIsDetectionPaused(false);
          // Show warning message after the alert
          setAlertMessage(getWarningMessage(message));
        }, 2000);
      } catch (error) {
        console.error("Error reporting malpractice:", error);
        setAlertMessage("⚠️ Failed to report malpractice");
      }
    },
    [
      applicantId,
      getWarningMessage,
      isTestCompleted,
      isFaceVerified,
      lastViolationTime,
      onMalpracticeDetected,
      setAlertMessage,
    ]
  );

  const checkFaceDetection = useCallback(async () => {
    if (!webcamRef.current || !applicantId || isTestCompleted) return false;
    try {
      const imageSrc = webcamRef.current.getScreenshot();
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

  // Continuous face detection before registration
  useEffect(() => {
    let interval;
    const monitorFace = async () => {
      if (verificationComplete || isTestCompleted) return;

      const detected = await checkFaceDetection();
      setFaceDetected(detected);

      if (!detected) {
        setAlertMessage(
          "🚫 Face not detected - please position your face in the circle"
        );
      } else {
        setAlertMessage("✅ Face detected - ready for verification");
      }
    };

    if (applicantId && !verificationComplete && !isTestCompleted) {
      monitorFace();
      interval = setInterval(monitorFace, 1000);
    }

    return () => clearInterval(interval);
  }, [
    applicantId,
    verificationComplete,
    isTestCompleted,
    checkFaceDetection,
    setAlertMessage,
  ]);

  // Live verification after registration
  useEffect(() => {
    let interval;
    const liveDetection = async () => {
      if (
        !webcamRef.current ||
        isDetectionPaused ||
        !isTestStarted ||
        isTestCompleted
      )
        return;

      try {
        const imageSrc = webcamRef.current.getScreenshot();
        const blob = await (await fetch(imageSrc)).blob();
        const file = new File([blob], "live.jpg", { type: blob.type });

        const formData = new FormData();
        formData.append("file", file);
        formData.append("applicant_id", applicantId);

        const res = await axios.post(
          "http://localhost:8000/verify/embedding",
          formData
        );
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

  const registerCandidate = async (imageSrc) => {
    const blob = await (await fetch(imageSrc)).blob();
    const file = new File([blob], "profile.jpg", { type: blob.type });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("applicantId", applicantId);

    try {
      const response = await axios.post(
        "http://localhost:3000/malpractice/register-candidate",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const verifyIdentity = async (imageSrc) => {
    const blob = await (await fetch(imageSrc)).blob();
    const file = new File([blob], "verify.jpg", { type: blob.type });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("applicant_id", applicantId);

    return axios.post("http://localhost:8000/verify", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  };

  const capture = async () => {
    if (!faceDetected || !applicantId || isTestCompleted) {
      setAlertMessage(
        "🚫 Cannot capture – No valid face detected or missing user ID"
      );
      return;
    }

    setIsLoading(true);
    setAlertMessage("⏳ Verifying your identity...");

    try {
      const imageSrc = webcamRef.current.getScreenshot();
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
          message = "✅ Identity registered successfully.";
          setIsRegistered(true);
          setVerificationComplete(true);
          onFaceVerified();
          break;
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
    } catch (error) {
      console.error("Error during verification:", error);
      setAlertMessage(
        `❌ Error: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <div
        style={{
          borderRadius: "50%",
          overflow: "hidden",
          border: `4px solid ${faceDetected ? "#4CAF50" : "#f44336"}`,
          width: 300,
          height: 300,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "20px 0",
          boxShadow: `0 0 20px ${
            faceDetected ? "rgba(76, 175, 80, 0.5)" : "rgba(244, 67, 54, 0.5)"
          }`,
        }}
      >
        <Webcam
          ref={webcamRef}
          style={{
            width: 300,
            height: 300,
            objectFit: "cover",
            borderRadius: "50%",
          }}
          screenshotFormat="image/jpeg"
          width={300}
          height={300}
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: "user",
          }}
          onUserMediaError={() =>
            setAlertMessage("🚫 Camera access denied or not available")
          }
        />
      </div>

      {!verificationComplete && !isTestCompleted && (
        <button
          onClick={capture}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "5px",
            backgroundColor: faceDetected ? "#4CAF50" : "#ccc",
            color: "white",
            cursor: faceDetected ? "pointer" : "not-allowed",
            border: "none",
            transition: "background-color 0.3s",
            opacity: isLoading ? 0.7 : 1,
          }}
          disabled={!faceDetected || isLoading}
        >
          {isLoading
            ? "Processing..."
            : faceDetected
            ? "Capture & Verify Identity"
            : "Face Not Detected"}
        </button>
      )}
    </div>
  );
};

export default WebcamCapture;