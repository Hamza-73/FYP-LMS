import { current } from '@reduxjs/toolkit';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import SideBar from '../SideBar';

const Groups = (props) => {
  const [group, setGroup] = useState({ groups: [] });
  const [grades, setGrades] = useState({ marks : 0 , external : 0});
  const [groupId, setGrouppId] = useState('');
  
  const [addStudent, setAddStudent] = useState({
    rollNo: '',
    projectTitle: '',
  });

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
        body : JSON.stringify({ marks : grades.marks , external : grades.external })
      });

      const json = await response.json();
      console.log('response is ', json);

      if (json.success) {
        if (json.message) {
          props.showAlert(json.message, 'success');
        } else {
          // Handle the case where json.message is empty
          props.showAlert('Student added successfully', 'success');
        }
      } else {
        // Handle the case where json.success is false
        if (json.message) {
          props.showAlert(json.message, 'danger');
        } else {
          props.showAlert('An error occurred while adding the student', 'danger');
        }
      }
    } catch (error) {
      console.log('error in adding student', error);
      props.showAlert(`error adding to group: ${error}`, 'danger');
    }
  };

  const handleAddStudent = async (e, projectTitle, rollNo) => {
    try {
      e.preventDefault();
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/supervisor/add-student/${projectTitle}/${rollNo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      });

      const json = await response.json();
      console.log('response is ', json);

      if (json.success) {
        if (json.message) {
          props.showAlert(json.message, 'success');
        } else {
          // Handle the case where json.message is empty
          props.showAlert('Student added successfully', 'success');
        }
      } else {
        // Handle the case where json.success is false
        if (json.message) {
          props.showAlert(json.message, 'danger');
        } else {
          props.showAlert('An error occurred while adding the student', 'danger');
        }
      }
    } catch (error) {
      console.log('error in adding student', error);
      props.showAlert(`error adding to group: ${error}`, 'danger');
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
                <form onSubmit={(e)=>{handleMarks(e)}}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Marks</label>
                    <input type="text" className="form-control" id="marks" name="marks" value={grades.marks} onChange={handleChange1} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="exampleInputPassword1" className="form-label">External</label>
                    <input type="text" className="form-control" id="external" name="external" value={grades.external} onChange={handleChange1} />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="submit" className="btn" style={{ background: "maroon", color: "white" }} disabled={!grades.marks || !grades.external}>
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
        <div className="modal fade" id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Student To Existing Group</h5>
              </div>
              <div className="modal-body">
                <form onSubmit={(e) => { handleAddStudent(e, addStudent.projectTitle, addStudent.rollNo); }}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Project Title</label>
                    <input type="text" className="form-control" id="projectTitle" name="projectTitle" value={addStudent.projectTitle} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="exampleInputPassword1" className="form-label">Student Roll No</label>
                    <input type="text" className="form-control" id="rollNo" name="rollNo" value={addStudent.rollNo} onChange={handleChange} />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="submit" className="btn" style={{ background: "maroon", color: "white" }} disabled={!addStudent.projectTitle || !addStudent.rollNo}>
                      Add Student
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>


      { current.length > 0 ? (
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
                          <td>{"-------"}</td>
                          <td>{group.isProp ? 'Submitted' : 'Pending'}</td>
                          <td>{group.isDoc ? 'Submitted' : 'Pending'}</td>
                          <td>{'Viva'}</td>
                          <td>
                            <div style={{ cursor: "pointer" }} data-toggle="modal" data-target="#exampleModal1">
                              {(group.marks && group.external)? (group.marks + group.external) : 0} &nbsp;&nbsp; <i className="fa-solid fa-pen-to-square" onClick={()=>setGrouppId(group._id)}></i>
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
        <h2 className='text-center'>You currently have no group in supervision.</h2>
      )}
      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
        <button className="btn" data-toggle="modal" data-target="#exampleModal" style={{ background: "maroon", color: "white", position: "relative", right: "7rem", top: "1rem" }} type="button">Add Student</button>
      </div>
    </div>
  );
};

export default Groups;