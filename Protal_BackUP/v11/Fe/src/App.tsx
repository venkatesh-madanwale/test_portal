import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Home from './components/Home';
import AddUsers from './components/AddUsers';
import SendTest from './components/SendTest';
import Jobs from './components/Jobs';
import AddQuestions from './components/AddQuestions';
import Results from './components/Results';
import Login from './components/Login';
import ViewQuestions from './components/ViewQuestions';
import ViewCoding from './components/ViewCoding';
import ViewMCQ from './components/ViewMCQ';
import AddCodingQuestions from './components/AddCodingQuestions';
import AddMCQ from './components/AddMCQ';
import AddJob from './components/AddJob';
import AllUsers from './components/AllUsers';
import Logout from './components/Logout';
import Test from './components/Test';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />

        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/all-users" element={<AllUsers />} />
            <Route path="/add-users" element={<AddUsers />} />
            <Route path="/send-test" element={<SendTest />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/add-job" element={<AddJob />} />
            <Route path="/add-questions" element={<AddQuestions />} />
            <Route path="/add-mcq" element={<AddMCQ />} />
            <Route path="/add-coding" element={<AddCodingQuestions />} />
            <Route path="/view-questions" element={<ViewQuestions />} />
            <Route path="/view-mcq" element={<ViewMCQ />} />
            <Route path="/view-coding" element={<ViewCoding />} />
            <Route path="/results" element={<Results />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/test" element={<Test/>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
