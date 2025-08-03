import { useSelector } from "react-redux";
import "./Navbar.css";
import { type RootState } from "../../../redux/store";

const Navbar = () => {
  const capturedImage = useSelector((state: RootState) => state.proctor.capturedImage);
  return (
    <nav className="navbar">
      <h2 className="navbar-title" style={{"color":"green"}}>mirafra</h2>
      <div className="navbar-right">
        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured Face"
            className="captured-image"
            width={50}
            height={50}
          />
        )}
      </div>
    </nav>
  );
};

export default Navbar;