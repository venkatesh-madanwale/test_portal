import React, { useEffect, useState } from "react";
import "./Alerts.css"; // ✅ Import external CSS

interface AlertsProps {
  message: string;
}

const Alerts: React.FC<AlertsProps> = ({ message }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!isVisible) return null;

  const typeClass = message.startsWith("✅")
    ? "alert-success"
    : message.startsWith("⚠️")
    ? "alert-warning"
    : "alert-error";

  return (
    <div className={`alert-box ${typeClass}`}>
      <p>{message}</p>
    </div>
  );
};

export default Alerts;
