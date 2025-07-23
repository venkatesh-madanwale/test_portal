// import React, { useState } from 'react';
// import './SendTest.css';
// import axios from 'axios';
// import { toast } from 'sonner';

// const SendTest = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     name: '',
//     phone: '',
//     job: '',
//     experience: '',
//     skillA: '',
//     skillB: '',
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const user = JSON.parse(localStorage.getItem('user') || '{}');
//     const ta_id = user?.id || '';

//     const payload = {
//       name: formData.name,
//       email: formData.email,
//       phone: formData.phone,
//       job_id: formData.job, // assume this is job ID (uuid)
//       experience_level_id: formData.experience, // assume this is uuid
//       primary_skill_id: formData.skillA, // assume this is uuid
//       ta_id,
//     };

//     try {
//       const response = await axios.post('http://localhost:3000/test/generate-link', payload);
//       toast.success('Test link sent successfully!');
//       console.log('Response:', response.data);
//     } catch (error: any) {
//       console.error('Error sending link:', error);
//       toast.error('Failed to send test link.');
//     }
//   };

//   return (
//     <div className="send-link-container">
//       <h2>Send Test Link</h2>
//       <form className="send-link-form" onSubmit={handleSubmit}>
//         <input className="send-link-input" type="email" name="email" placeholder="Email Id:" onChange={handleChange} required />
//         <input className="send-link-input" type="text" name="name" placeholder="Name:" onChange={handleChange} required />
//         <input className="send-link-input" type="tel" name="phone" placeholder="Phone no." onChange={handleChange} required />
//         <input className="send-link-input" type="text" name="job" placeholder="Job ID:" onChange={handleChange} required />
//         <input className="send-link-input" type="text" name="experience" placeholder="Experience Level ID:" onChange={handleChange} required />
//         <input className="send-link-input" type="text" name="skillA" placeholder="Primary skill (a) ID:" onChange={handleChange} required />
//         <input className="send-link-input" type="text" name="skillB" placeholder="Primary skill (b): (Optional)" onChange={handleChange} />
//         <button className="send-link-button" type="submit">Send Link</button>
//       </form>
//     </div>
//   );
// };

// export default SendTest;

// import React, { useState, useEffect } from 'react';
// import './SendTest.css';
// import axios from 'axios';
// import { toast } from 'sonner';

// interface Skill {
//   id: string;
//   name: string;
// }

// const SendTest = () => {
//   const [skills, setSkills] = useState<Skill[]>([]);

//   const [formData, setFormData] = useState({
//     email: '',
//     name: '',
//     phone: '',
//     job: '',
//     experience: '',
//     skillA: '',
//     skillB: '',
//   });

//   useEffect(() => {
//     const fetchSkills = async () => {
//       try {
//         const response = await axios.get('http://localhost:3000/skills');
//         setSkills(response.data.data || []);
//       } catch (error) {
//         console.error('Error fetching skills:', error);
//         toast.error('Failed to load skills');
//       }
//     };

//     fetchSkills();
//   }, []);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const user = JSON.parse(localStorage.getItem('user') || '{}');
//     const ta_id = user?.id || '';

//     const payload = {
//       name: formData.name,
//       email: formData.email,
//       phone: formData.phone,
//       job_id: formData.job,
//       experience_level_id: formData.experience,
//       primary_skill_id: formData.skillA,
//       ta_id,
//     };

//     try {
//       const response = await axios.post('http://localhost:3000/test/generate-link', payload);
//       toast.success('Test link sent successfully!');
//       console.log('Response:', response.data);
//     } catch (error) {
//       console.error('Error sending link:', error);
//       toast.error('Failed to send test link.');
//     }
//   };

//   return (
//     <div className="send-link-container">
//       <h2>Send Test Link</h2>
//       <form className="send-link-form" onSubmit={handleSubmit}>
//         <input className="send-link-input" type="email" name="email" placeholder="Email Id:" onChange={handleChange} required />
//         <input className="send-link-input" type="text" name="name" placeholder="Name:" onChange={handleChange} required />
//         <input className="send-link-input" type="tel" name="phone" placeholder="Phone no." onChange={handleChange} required />
//         <input className="send-link-input" type="text" name="job" placeholder="Job ID:" onChange={handleChange} required />
//         {/* <input className="send-link-input" type="text" name="experience" placeholder="Experience Level ID:" onChange={handleChange} required /> */}


//         <select className='send-link-input' name="experience" onChange={handleChange} required>
//         <option value="">
//           Select experience level
//         </option>
//         <option value="a0c3f9cb-d673-461f-b130-4437e57cedcf">Fresher</option>
//         <option value="833d6ee0-27f6-462f-aba3-f4df251bf47e">Junior</option>
//         <option value="2ec03951-43b3-42a6-ad36-346d9b8d4ab6">Mid-Level</option>
//         <option value="8b5adf1a-2ec5-4094-89a8-992cee152f07">Senior</option>
//         </select>
//         <select className="send-link-input" name="skillA" onChange={handleChange} required>
//           <option value="">Select Primary Skill A</option>
//           {skills.map(skill => (
//             <option key={skill.id} value={skill.id}>{skill.name}</option>
//           ))}
//         </select>



//         <select className="send-link-input" name="skillB" onChange={handleChange}>
//           <option value="">Select Primary Skill B (Optional)</option>
//           {skills.map(skill => (
//             <option key={skill.id} value={skill.id}>{skill.name}</option>
//           ))}
//         </select>

//         <button className="send-link-button" type="submit">Send Link</button>
//       </form>
//     </div>
//   );
// };

// export default SendTest;




import React, { useState, useEffect } from 'react';
import './SendTest.css';
import axios from 'axios';
import { toast } from 'sonner';

interface Skill {
  id: string;
  name: string;
}

interface Job {
  id: string;
  title: string;
  clientName: string;
}

const SendTest = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    job: '',
    experience: '',
    skillA: '',
    skillB: '',
  });

  useEffect(() => {
    const fetchSkillsAndJobs = async () => {
      try {
        const [skillsRes, jobsRes] = await Promise.all([
          axios.get('http://localhost:3000/skills'),
          axios.get('http://localhost:3000/jobs')
        ]);
        setSkills(skillsRes.data.data || []);
        setJobs(jobsRes.data.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        // toast.error('Failed to load skills or jobs.');
        const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Failed to send test link.';
        toast.error(errorMessage);
      }
    };

    fetchSkillsAndJobs();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const ta_id = user?.id || '';

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      job_id: formData.job,
      experience_level_id: formData.experience,
      primary_skill_id: formData.skillA,
      ta_id,
    };

    try {
      const response = await axios.post('http://localhost:3000/test/generate-link', payload);
      toast.success('Test link sent successfully!');
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error sending link:', error);
      // toast.error('Failed to send test link.');
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Failed to send test link.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="send-link-container">
      <h2>Send Test Link</h2>
      <form className="send-link-form" onSubmit={handleSubmit}>
        <input className="send-link-input" type="email" name="email" placeholder="Email Id:" onChange={handleChange} required />
        <input className="send-link-input" type="text" name="name" placeholder="Name:" onChange={handleChange} required />
        <input className="send-link-input" type="tel" name="phone" placeholder="Phone no." onChange={handleChange} required />

        <select className="send-link-input" name="job" onChange={handleChange} required>
          <option value="">Select Job</option>
          {jobs.map(job => (
            <option key={job.id} value={job.id}>
              {job.title} ({job.clientName})
            </option>
          ))}
        </select>

        <select className='send-link-input' name="experience" onChange={handleChange} required>
          <option value="">
            Select experience level
          </option>
          <option value="a0c3f9cb-d673-461f-b130-4437e57cedcf">Fresher</option>
          <option value="833d6ee0-27f6-462f-aba3-f4df251bf47e">Junior</option>
          <option value="2ec03951-43b3-42a6-ad36-346d9b8d4ab6">Mid-Level</option>
          <option value="8b5adf1a-2ec5-4094-89a8-992cee152f07">Senior</option>
        </select>

        <select className="send-link-input" name="skillA" onChange={handleChange} required>
          <option value="">Select Primary Skill A</option>
          {skills.map(skill => (
            <option key={skill.id} value={skill.id}>{skill.name}</option>
          ))}
        </select>

        <select className="send-link-input" name="skillB" onChange={handleChange}>
          <option value="">Select Primary Skill B (Optional)</option>
          {skills.map(skill => (
            <option key={skill.id} value={skill.id}>{skill.name}</option>
          ))}
        </select>

        <button className="send-link-button" type="submit">Send Link</button>
      </form>
    </div>
  );
};

export default SendTest;
