type NavbarProps = {
  capturedImage?: string;
  // onExit: () => void;
};

const TestNavBar = ({ capturedImage }: NavbarProps) => {
  if (capturedImage !== undefined) {
    sessionStorage.setItem("isReg", capturedImage);
  } else {
    sessionStorage.setItem("isReg", "");
  }
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 20px',
      backgroundColor: '#f8f9fa',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* <h2 style={{ margin: 0 }}>Live Proctoring</h2> */}
      <img src="src\assets\mirafraLogo.svg" alt="logo" />
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
      </div>
    </nav>
  );
};
export default TestNavBar;