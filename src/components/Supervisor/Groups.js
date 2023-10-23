import { current } from '@reduxjs/toolkit';
import React, { useEffect, useState } from 'react';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

const Groups = (props) => {
  const [group, setGroup] = useState({ groups: [] });
  const [grades, setGrades] = useState({ marks: 0, external: 0, internal: 0, hod: 0 });
  const [groupId, setGrouppId] = useState('');

  const [addStudent, setAddStudent] = useState({
    rollNo: '', projectTitle: '',
  });


  const handleAddStudent = async (e) => {
    try {
      e.preventDefault();
      console.log('add stdents starts');
      const token = localStorage.getItem('token');
      console.log('add student is ', addStudent)
      const response = await fetch(`http://localhost:5000/supervisor/add-student/${addStudent.projectTitle}/${addStudent.rollNo}`, {
        method: 'POST',
        headers: {
          Authorization: token,
        },
      });

      const json = await response.json();
      console.log('response is ', json);

      if (json.success) {
        NotificationManager.success(json.message);
      }
      else {
        NotificationManager.error(json.message);
      }
      handleClose();
    } catch (error) {
      console.log('error in adding student', error);
      NotificationManager.error('Some Error ocurred Try/Again');
    }
  };

  const handleMarks = async (e) => {
    try {
      e.preventDefault();
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/supervisor/give-marks/${groupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({ marks: grades.marks, external: grades.external, internal: grades.internal, hod: grades.hod })
      });

      const json = await response.json();
      console.log('response is ', json);

      if (json.success) {
        NotificationManager.success(json.message);
        getGroup()
        handleClose();
      }
      else {
        NotificationManager.error(json.message);
      }
    } catch (error) {
      console.log('error in adding student', error);
    }
  };

  const getGroup = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/supervisor/my-groups', {
        method: 'GET',
        headers: {
          'Content-Type': 'appication/json',
          authorization: `${token}`,
        },
      });
      const json = await response.json();
      console.log('json is ', json);
      setGroup(json);
    } catch (error) {
      console.log('error is ', error);
    }
  };

  useEffect(() => {
    getGroup();
  }, []);

  const handleChange1 = (e) => {
    setGrades({ ...grades, [e.target.name]: e.target.value });
  };

  const handleChange = (e) => {
    setAddStudent({ ...addStudent, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    setAddStudent({ rollNo: '', projectTitle: '', });
    setGrades({ external: 0, marks: 0 });
  }
  console.log( new Date())
  console.log('new ', new Date("2023-10-30T19:00:00.000Z"))
  console.log('check ', new Date() < new Date("2023-10-30T19:00:00.000Z"))

  return (
    <div>
      <div className="fypIdea">
        <div className="modal fade" id="exampleModal1" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Grades</h5>
              </div>
              <div className="modal-body">
                <form onSubmit={(e) => { handleMarks(e) }}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Marks</label>
                    <input type="number" className="form-control" id="marks" min='0' max='100' name="marks" value={grades.marks} onChange={handleChange1} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Chair Person</label>
                    <input type="number" className="form-control" id="marks" min='0' max='100' name="hod" value={grades.hod} onChange={handleChange1} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">External</label>
                    <input type="number" className="form-control" id="marks" min='0' max='100' name="external" value={grades.external} onChange={handleChange1} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="exampleInputPassword1" className="form-label">Internal</label>
                    <input type="number" className="form-control" id="internal" min='0' max='100' name="internal" value={grades.internal} onChange={handleChange1} />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={handleClose}>Close</button>
                    <button type="submit" className="btn" style={{ background: "maroon", color: "white" }} disabled={!grades.marks || !grades.external || !grades.internal || !grades.hod}>
                      Give Grades
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fypIdea">
        <div className="modal fade" id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModal" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Student To Existing Group</h5>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddStudent}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Project Title</label>
                    <input type="text" className="form-control" id="projectTitle" name="projectTitle" value={addStudent.projectTitle} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="rollNo" className="form-label">Student Roll No</label>
                    <input type="text" className="form-control" id="rollNo" name="rollNo" value={addStudent.rollNo} onChange={handleChange} />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={handleClose}>Close</button>
                    <button type="submit" className="btn" style={{ background: "maroon", color: "white" }} >
                      Add Student
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {current.length > 0 ? (
        <>
          <h3 className='text-center my-4'>Students Under Me</h3>
          <div className='container' style={{ width: "100%" }}>
            <div>
              <div>
                <table className='table table-hover'>
                  <thead style={{ textAlign: "center" }}>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">My Group</th>
                      <th scope="col">Meeting</th>
                      <th scope="col">Project Proposal</th>
                      <th scope="col">Documentation</th>
                      <th scope="col">Add Student</th>
                      <th scope="col">Viva</th>
                      <th scope="col">Grade</th>
                    </tr>
                  </thead>
                  {group.groups.map((group, groupIndex) => (
                    <tbody key={groupIndex} style={{ textAlign: "center" }}>
                      {group.projects.map((project, projectKey) => (
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
                          <td>{group.meeting}</td>
                          <td>{group.proposal ? 'Submitted' : 'Pending'}</td>
                          <td>{group.documentation ? 'Submitted' : 'Pending'}</td>
                          <td><button disabled={project.students.length === 2} onClick={() => setAddStudent({ projectTitle: project.projectTitle })} className="btn btn-sm" style={{ background: "maroon", color: "white" }} data-toggle="modal" data-target="#exampleModal">Add Student</button></td>
                          <td>
                            {
                              group.vivaDate ?
                                (
                                  new Date() < new Date(group.vivaDate) ?
                                    new Date(group.vivaDate).toISOString().split('T')[0] :
                                    "Taken"
                                ) :
                                "Pending"
                            }
                          </td>

                          <td>
                            <div style={{ cursor: "pointer" }} data-toggle="modal" data-target="#exampleModal1">
                              {(group.marks && group.externalMarks && group.internalMarks && group.hodMarks) ? (group.marks + group.externalMarks + group.internalMarks + group.hodMarks) / 4 : 0} &nbsp;&nbsp; <i className="fa-solid fa-pen-to-square" onClick={() => {
                                setGrouppId(group._id); setGrades({
                                  external: group.externalMarks, internal: group.internalMarks, hod: group.hodMarks, marks: group.marks
                                })
                              }}></i>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  ))}
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <h2 className='text-center' style={{ position: "absolute", transform: "translate(-50%,-50%", left: "50%", top: "50%" }}>You currently have no group in supervision.</h2>
      )}
      <NotificationContainer />
    </div>
  );
};

export default Groups;