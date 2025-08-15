import { useNavigate } from "react-router-dom";
import "./Jobs.css";

const Jobs = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="question">
        <button className="question-button" onClick={() => navigate('/add-job')}>
          Add Job
        </button>
      </div>
      <div>
        List of jobs.... {"=>>"}
      </div>
    </>
  );
};

export default Jobs;
