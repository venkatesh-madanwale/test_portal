import './TestNavBar.css';

type NavbarProps = {
  capturedImage?: string;
  
};

const TestNavBar = ({ capturedImage }: NavbarProps) => {
  if (capturedImage !== undefined) {
    sessionStorage.setItem('isReg', capturedImage);
  } else {
    sessionStorage.setItem('isReg', '');
  }

  return (
    <nav className="test-navbar">
      <img src="src/assets/mirafraLogo.svg" alt="logo" className="navbar-logo" />
      <div className="navbar-right">
        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured Face"
            className="captured-image"
          />
        )}
      </div>
    </nav>
  );
};

export default TestNavBar;










// type NavbarProps = {
//   capturedImage?: string;
//   onExit: () => void;
// };

// const TestNavBar = ({ capturedImage, onExit }: NavbarProps) => {
//   if (capturedImage !== undefined) {
//     sessionStorage.setItem("isReg", capturedImage);
//   } else {
//     sessionStorage.setItem("isReg", "");
//   }
//   return (
//     <nav style={{
//       display: 'flex',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       padding: '10px 20px',
//       backgroundColor: '#f8f9fa',
//       boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
//     }}>
//       <img src="src\assets\mirafraLogo.svg" alt="logo" />
//       <div style={{ display: 'flex', alignItems: 'center' }}>
//         {capturedImage && (
//           <img
//             src={capturedImage}
//             alt="Captured Face"
//             width={50}
//             height={50}
//             style={{
//               borderRadius: '50%',
//               marginRight: '20px',
//               border: '2px solid #4CAF50'
//             }}
//           />
//         )}
//       </div>
//     </nav>
//   );
// };
// export default TestNavBar;