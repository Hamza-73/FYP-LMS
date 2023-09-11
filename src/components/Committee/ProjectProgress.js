import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProjectProgress = (props) => {
  const [group, setGroup] = useState({ groups: [] });
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [deadline, setdeadline] = useState({ dueDate: '', type: '' });

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
      console.log('prograa is ', json)
      setGroup(json);
    } catch (error) {
      console.log(`Some error occurred: ${error.message}`);
    }
  }

  const handleDate = async (e) => {
    try {
      e.preventDefault();
      console.log('duedate starts');
      const response = await fetch(`http://localhost:5000/committee/dueDate/${selectedGroupId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ dueDate: deadline.date, type: deadline.type })
      });
      const json = await response.json();
      if (json)
        alert(json.message)

    } catch (error) {
      console.log(`Some error occurred: ${error}`);
    }
  }

  const typeOptions = ['final', 'proposal', 'documentation']

  useEffect(() => {
    setTimeout(() => {
      getProjects();
    }, 1000)
  }, []);

  const handleChange = (e) => {
    setdeadline({ ...deadline, [e.target.name]: e.target.value });
  }

  return (
    <div>
      <div>
        <div className="register"  >
          <div className="modal fade" id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" >Give Reamrks</h5>
                </div>
                <div className="modal-body">
                  <form onSubmit={(e) => handleDate(e, selectedGroupId)}>
                    <div className="mb-3">
                      <label htmlFor="remrks" className="form-label">Type</label>
                      <select className="form-control" id="type" name='type' value={deadline.type} onChange={handleChange}>
                        <option value="">Select Type</option>
                        {typeOptions.map((option, index) => (
                          <option key={index} value={option}>{option[0].toUpperCase()+option.slice(1,option.length)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="remrks" className="form-label">date</label>
                      <input type='date' className="form-control" id="date" name='date' value={deadline.date} onChange={handleChange} />
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={(e)=>{setdeadline({type:"",dueDate:""}); setSelectedGroupId('')}}>Close</button>
                      <button type="submit" className="btn btn-success" disabled={!deadline.type || !deadline.date}> Add deadline </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
      {group.groups.length > 0 ? (
        <>
          <h3 className='text-center my-4'>Project Progress</h3>
          <div className='container' style={{ width: "100%" }}>
            <table className='table table-hover'>
              <thead style={{ textAlign: "center" }}>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">My Group</th>
                  <th scope="col">Project Proposal</th>
                  <th scope="col">Documentation</th>
                  <th scope="col">Viva</th>
                  <th scope="col">External</th>
                  <th scope="col">Grade</th>
                  <th scope="col">Add Due Date</th>
                </tr>
              </thead>
              <tbody style={{ textAlign: "center" }}>
                {group.groups.map((group, groupIndex) => (
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
                      <td>{group.isProp ? 'Submitted' : 'Pending'}</td>
                      <td>
                        <div style={{ cursor: "pointer" }} data-toggle="modal" data-target="#exampleModal1">
                          {(group.finalSubmission ? (
                            <a href={group.finalSubmission} target="_blank" rel="noopener noreferrer">Document</a>
                          ) : 'Pending')}
                        </div>
                      </td>
                      <td>{group.vivaDate ? (new Date() > new Date(group.vivaDate) ? 'Taken' : new Date(group.vivaDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })) : '---'}</td>
                      <td>{group.external ? group.external : 0}</td>
                      <td>{group.marks ? group.marks : 0}</td>
                      <td><button className="btn" style={{ background: "maroon", color: "white" }} data-toggle="modal" data-target="#exampleModal" onClick={() => setSelectedGroupId(group._id)}>Add Deadline</button></td>
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
    </div>
  );
};

export default ProjectProgress;