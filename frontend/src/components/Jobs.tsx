import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Jobs.css";

interface Job {
  id: string;
  title: string;
  clientName: string;
  createdAt: string;
  createdBy: string;
}

const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filters, setFilters] = useState({
    title: "",
    clientName: "",
    createdBy: "",
    createdAt: "",
  });

  useEffect(() => {
    axios
      .get("http://localhost:3000/jobs")
      .then((res) => {
        setJobs(res.data.data);
      })
      .catch((err) => {
        console.error("Failed to fetch jobs:", err);
      });
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const filteredJobs = jobs.filter((job) => {
    const dateFormatted = new Date(job.createdAt).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    return (
      job.title.toLowerCase().includes(filters.title.toLowerCase()) &&
      job.clientName.toLowerCase().includes(filters.clientName.toLowerCase()) &&
      job.createdBy.toLowerCase().includes(filters.createdBy.toLowerCase()) &&
      dateFormatted.toLowerCase().includes(filters.createdAt.toLowerCase())
    );
  });

  return (
    <>
      <div className="title">
        <h2>List of Jobs</h2>
        <button className="question-button" onClick={() => navigate("/add-job")}>
          Add Job
        </button>
      </div>
      
      

      <div className="all-users-container">
        <div className="table-responsive">
          <table className="user-table">
            <thead>
              <tr>
                <th style={{ "display": "flex", "flexDirection": "column" }}>
                  Title
                  <input
                    type="text"
                    placeholder="Search title"
                    value={filters.title}
                    onChange={(e) => handleFilterChange(e, "title")}
                  />
                </th>
                <th>
                  Client Name
                  <input
                    type="text"
                    placeholder="Search client"
                    value={filters.clientName}
                    onChange={(e) => handleFilterChange(e, "clientName")}
                  />
                </th>
                <th>
                  Created By
                  <input
                    type="text"
                    placeholder="Search creator"
                    value={filters.createdBy}
                    onChange={(e) => handleFilterChange(e, "createdBy")}
                  />
                </th>
                <th>
                  Created At
                  <input
                    type="text"
                    placeholder="Search date"
                    value={filters.createdAt}
                    onChange={(e) => handleFilterChange(e, "createdAt")}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.title}</td>
                  <td>{job.clientName}</td>
                  <td>{job.createdBy}</td>
                  <td>
                    {new Date(job.createdAt).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Jobs;



// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import "./Jobs.css";

// interface Job {
//   id: string;
//   title: string;
//   clientName: string;
//   createdAt: string;
//   createdBy: string;
// }

// const Jobs: React.FC = () => {
//   const navigate = useNavigate();
//   const [jobs, setJobs] = useState<Job[]>([]);

//   useEffect(() => {
//     axios.get("http://localhost:3000/jobs")
//       .then(res => {
//         setJobs(res.data.data);
//       })
//       .catch(err => {
//         console.error("Failed to fetch jobs:", err);
//       });
//   }, []);

//   return (
//     <>
//       <div className="question">
//         <button className="question-button" onClick={() => navigate('/add-job')}>
//           Add Job
//         </button>
//       </div>

//       <div className="all-users-container">
//         <h2>List of Jobs</h2>
//         <div className="table-responsive">
//           <table className="user-table">
//             <thead>
//               <tr>
//                 <th>Title</th>
//                 <th>Client Name</th>
//                 <th>Created By</th>
//                 <th>Created At</th>
//               </tr>
//             </thead>
//             <tbody>
//               {jobs.map((job) => (
//                 <tr key={job.id}>
//                   <td>{job.title}</td>
//                   <td>{job.clientName}</td>
//                   <td>{job.createdBy}</td>
//                   {/* <td>{new Date(job.createdAt).toLocaleString().slice(0,9)}</td> */}
//                   {new Date(job.createdAt).toLocaleString('en-IN', {
//                     timeZone: 'Asia/Kolkata',
//                     day: '2-digit',
//                     month: 'long',
//                     year: 'numeric',
//                   })}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Jobs;
