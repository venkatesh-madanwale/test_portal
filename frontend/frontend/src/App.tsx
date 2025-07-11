import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import Home from './components/Home'
import AddUsers from './components/AddUsers'
import SendTest from './components/SendTest'
import Jobs from './components/Jobs'
import AddQuestions from './components/AddQuestions'
import Results from './components/Results'
import Login from './components/Login'
import ViewQuestions from './components/ViewQuestions'

function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="fixed-navbar">
          <Navbar />
        </div>

        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add-users" element={<AddUsers />} />
            <Route path="/send-test" element={<SendTest />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/add-questions" element={<AddQuestions />} />
            <Route path="/view-questions" element={<ViewQuestions />} />
            <Route path="/results" element={<Results />} />
            <Route path="/login" element={<Login/>} />

          </Routes>
        </div>

        <div className="fixed-footer">
          <Footer />
        </div>
      </div>
    </Router>
  )
}

export default App
