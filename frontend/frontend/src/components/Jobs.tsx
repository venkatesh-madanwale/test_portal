import { useNavigate } from "react-router-dom";

const Jobs = () => {
  const navigate = useNavigate();
  return (
    <>
    <div>
      <button className="question-button" onClick={() => navigate('/add-job')}>
        Add Job</button>
    </div>
    <div>
      List of jobs
    </div>
    </>
  )
}

export default Jobs