import React from 'react';

const AgreementModal = ({ onAgree }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <h2>Proctoring Rules and Regulations</h2>
        <ol>
          <li>You must be alone in a quiet, well-lit room</li>
          <li>Your face must be clearly visible at all times</li>
          <li>No looking away from the screen for extended periods</li>
          <li>No use of secondary devices or materials</li>
          <li>No communication with others during the test</li>
          <li>Your session will be recorded for security purposes</li>
        </ol>
        <p>By clicking "I Agree", you acknowledge that violations may result in test termination.</p>
        <button 
          onClick={onAgree}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '20px'
          }}
        >
          I Agree
        </button>
      </div>
    </div>
  );
};

export default AgreementModal;