import { useEffect, useState } from 'react';

interface AlertsProps {
  message: string;
}

const Alerts = ({ message }: AlertsProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [alertType, setAlertType] = useState('info');

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      
      // Determine alert type based on message prefix
      if (message.startsWith('✅')) {
        setAlertType('success');
      } else if (message.startsWith('⚠️')) {
        setAlertType('warning');
      } else if (message.startsWith('🚫') || message.startsWith('❌')) {
        setAlertType('error');
      } else {
        setAlertType('info');
      }

      const timer = setTimeout(() => {
        setIsVisible(false);
      }, message.startsWith('⚠️') ? 2000 : 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const getAlertStyle = () => {
    switch(alertType) {
      case 'success':
        return {
          backgroundColor: '#ddffdd',
          borderLeft: '5px solid #4CAF50'
        };
      case 'warning':
        return {
          backgroundColor: '#fff3cd',
          borderLeft: '5px solid #FFC107'
        };
      case 'error':
        return {
          backgroundColor: '#ffdddd',
          borderLeft: '5px solid #f44336'
        };
      default:
        return {
          backgroundColor: '#e7f4ff',
          borderLeft: '5px solid #2196F3'
        };
    }
  };

  return isVisible ? (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      padding: '10px 20px',
      borderRadius: '5px',
      boxShadow: '0 0 10px rgba(0,0,0,0.3)',
      maxWidth: '300px',
      fontSize: '14px',
      animation: 'fadeIn 0.5s',
      ...getAlertStyle()
    }}>
      <p>{message}</p>
    </div>
  ) : null;
};

export default Alerts;