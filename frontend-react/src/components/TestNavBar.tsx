type NavbarProps = {
  capturedImage?: string;
  onExit: () => void;
};

const TestNavBar = ({ capturedImage, onExit }: NavbarProps) => {
  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '10px 20px',
      backgroundColor: '#f8f9fa',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ margin: 0 }}>Live Proctoring</h2>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {capturedImage && (
          <img 
            src={capturedImage} 
            alt="Captured Face" 
            width={50} 
            height={50}
            style={{ 
              borderRadius: '50%', 
              marginRight: '20px',
              border: '2px solid #4CAF50'
            }} 
          />
        )}
        <button 
          onClick={onExit}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Exit Test
        </button>
      </div>
    </nav>
  );
};

export default TestNavBar;