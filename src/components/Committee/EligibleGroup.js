import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

const EligibleGroup = (props) => {
  const [group, setGroup] = useState({ groups: [] });
  const [selectedGroupId, setSelectedGroupId] = useState('');


  const [viva, setViva] = useState({
    projectTitle: '', vivaDate: new Date(), vivaTime: '',
    external: "", internal: ""
  });
  const [isFieldsModified, setIsFieldsModified] = useState(false);
  const [isInvalidDate, setIsInvalidDate] = useState(false);

  const getProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authorization token not found', 'danger');
        return;
      }
      const response = await fetch("http://localhost:5000/committee/progress", {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const json = await response.json();
      console.log('prograa is eligibele ', json)
      setGroup(json);
    } catch (error) {
      console.log(`Some error occurred: ${error.message}`);
    }
  }

  const handleCloseModal = (id) => {
    document.getElementById(id).classList.remove("show", "d-block");
    document.querySelectorAll(".modal-backdrop")
      .forEach(el => el.classList.remove("modal-backdrop"));
  }
  const scheduleViva = async (e) => {
    try {
      e.preventDefault();
      console.log('internal ', viva.internal)
      console.log('external ', viva.external)
      const response = await fetch(`http://localhost:5000/viva/schedule-viva`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectTitle: viva.projectTitle,
          vivaDate: viva.vivaDate,
          vivaTime: viva.vivaTime,
          internal: viva.internal,
          external: viva.external
        }),
      });
      const json = await response.json();
      console.log('json in handle requests is ', json);

      if (json.message && json.success) {
        NotificationManager.success(json.message);
        handleCloseModal("exampleModal1")
      } else {
        NotificationManager.error(json.message);
      }
    } catch (error) {
      console.log('error scheduling viva', error);
      NotificationManager.error(`Some error occurred try again/reload page`);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      getDetail();
      getProjects();
      getCommittee();
      getExternal();
    }, 1000)
  }, []);

  const [userData, setUserData] = useState({ member: [] });

  const getDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('token not found');
        return;
      }

      const response = await fetch(`http://localhost:5000/committee/detail`, {
        method: 'GET',
        headers: {
          'Authorization': token
        },
      });

      if (!response.ok) {
        console.log('error fetching detail', response);
        return; // Exit early on error
      }

      const json = await response.json();
      console.log('json is in sidebar: ', json);
      if (json) {
        //   console.log('User data is: ', json);
        setUserData(json);
      }
    } catch (err) {
      console.log('error is in sidebar: ', err);
    }
  };

  const handleChange1 = (e) => {
    setViva({ ...viva, [e.target.name]: e.target.value });
  };

  // Function to get members
  const getCommittee = async () => {
    try {
      const response = await fetch("http://localhost:5000/supervisor/get-supervisors", {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const json = await response.json();
      console.log('students are ', json); // Log the response data to see its structure
      setCommittee(json);
    } catch (error) {
    }
  }

  const [committee, setCommittee] = useState({ members: [] });
  const [external, setExternal] = useState({ members: [] });
  const getExternal = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authorization token not found', 'danger');
        return;
      }
      const response = await fetch("http://localhost:5000/external/get-externals", {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const json = await response.json();
      console.log('supervisors are ', json); // Log the response data to see its structure
      setExternal(json);
    } catch (error) {
      console.log('error in fetching supervisor ', error);
    }
  }

  return (
    <div>
      <div>

      </div>
      <div className="viva">
        <div className="modal fade" id="exampleModal1" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Schedule Viva</h5>
              </div>
              <div className="modal-body">
                <form onSubmit={(e) => scheduleViva(e)}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Project Title
                    </label>
                    <input type="text" className="form-control" id="projectTitle" name="projectTitle" value={viva.projectTitle} onChange={handleChange1} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Viva Date
                    </label> <br />
                    <input className='input-form' type='date' name='vivaDate' onChange={(e) => setViva({ ...viva, [e.target.name]: e.target.value })} value={viva.vivaDate} />
                  </div>
                  {isInvalidDate && (
                    <div className="text-danger">Please enter a valid date (not in the past).</div>
                  )}
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Viva Time
                    </label>
                    <div>
                      <input className='input-form' type='time' name='vivaTime' onChange={(e) => setViva({ ...viva, [e.target.name]: e.target.value })} value={viva.vivaTime} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Internal
                    </label>
                    <select className='form-select' name='internal' onChange={(e) => setViva({ ...viva, [e.target.name]: e.target.value })} value={viva.internal}>
                      <option value="">Select Internal</option>
                      {committee.members && committee.members.map((member, index) => (
                        <option key={index} value={member.username}>{member.username}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      External
                    </label>
                    <select className='form-select' name='external' onChange={(e) => setViva({ ...viva, [e.target.name]: e.target.value })} value={viva.external}>
                      <option value="">Select External Member</option>
                      {external.members && external.members.map((member, index) => (
                        <option key={index} value={member.username}>{member.username}</option>
                      ))}
                    </select>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">
                      Close
                    </button>
                    <button type="submit" className="btn btn-danger" style={{ background: 'maroon' }}
                      disabled={!viva.vivaTime || !viva.vivaDate || !viva.projectTitle || !viva.external || !viva.internal}
                    >
                      Schedule
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {group.groups.length > 0 ? (
        <>
          <h3 className='text-center my-4'>Groups Eligible For Viva</h3>
          <div className='container' style={{ width: "100%" }}>
            <table className='table table-hover'>
              <thead style={{ textAlign: "center" }}>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">My Group</th>
                  <th scope="col">Project Proposal</th>
                  <th scope="col">Documentation</th>
                  {userData.member.isAdmin && <th scope="col">Viva</th>}
                </tr>
              </thead>
              <tbody style={{ textAlign: "center" }}>
                {group.groups
                  .filter((group) =>
                    group.proposal && group.documentation && !group.viva
                  )
                  .map((group, groupIndex) => (
                    group.projects.map((project, projectKey) => (
                      <tr key={projectKey}>
                        <td>
                          <div>
                            {project.students.map((student, studentKey) => (
                              <React.Fragment key={studentKey}>
                                {student.name}<br />
                              </React.Fragment>
                            ))}
                          </div>
                        </td>
                        <td>{project.projectTitle}</td>
                        <td>
                          <div style={{ cursor: "pointer" }} data-toggle="modal" data-target="#exampleModal1">
                            {(group.proposal ? (
                              <a href={group.proposal} target="_blank" rel="noopener noreferrer">Proposal</a>
                            ) : 'Pending')}
                          </div>
                        </td><td>
                          <div style={{ cursor: "pointer" }} data-toggle="modal" data-target="#exampleModal1">
                            {(group.documentation ? (
                              <a href={group.documentation} target="_blank" rel="noopener noreferrer">Documentation</a>
                            ) : 'Pending')}
                          </div>
                        </td>
                        <td>{
                          group.vivaDate ? (userData.member.isAdmin && <>{
                            (new Date() > new Date(group.vivaDate)) ? 'Taken' : (<>{new Date(group.vivaDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })} </>)
                          }</>) : <> <button className='btn btn-sm' data-toggle="modal" data-target="#exampleModal1" style={{ background: "maroon", color: "white" }} onClick={() => {
                            setSelectedGroupId(group._id);
                            setViva({ projectTitle: project.projectTitle })
                          }} >Add Viva</button></>
                        }</td>
                      </tr>
                    ))
                  ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <h2 className='text-center'>No Groups have been enrolled for now.</h2>
      )}
      <NotificationContainer />
    </div>
  );
};

export default EligibleGroup;