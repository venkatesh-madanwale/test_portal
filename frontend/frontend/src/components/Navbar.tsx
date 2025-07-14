import './Navbar.css';
import { Link } from 'react-router-dom';
const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar__left">
        <Link to="/">
        <img src="src/assets/mirafraLogo.svg" alt="Logo" className="navbar__logo" />
        </Link>
      </div>
      <div className="navbar__center">
        <ul className="navbar__links">
          <li><Link to="/add-users">Add Users</Link></li>
          <li><Link to="/send-test">Send Test</Link></li>
          <li><Link to="/jobs">Jobs</Link></li> 
          <li><Link to="/add-questions">Add Questions</Link></li>
          <li><Link to="/view-questions">View Questions</Link></li>
          <li><Link to="/results">Results</Link></li>
        </ul>
      </div>
      <div className="navbar__right">
        <button className="navbar__btn"><Link to="/login">Log in</Link></button>
      </div>
    </nav>
  );
};

export default Navbar;