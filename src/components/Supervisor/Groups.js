import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useAsyncError } from 'react-router-dom';

const Groups = (props) => {

  const [group, setGroup] = useState({ groups: [] });
  const [ addStudent, setAddStudent ] = useState({
    rollNo : '', projectTitle : ''
  });

  const handleAddStudent = async (e, projectTitle, rollNo)=>{
    try {
      e.preventDefault();
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/supervisor/add-student/${projectTitle}/${rollNo}`,{
        method:'PUT',
        headers:{
          "Content-Type": "application/json",
          authorization: `${token}`
        }
      });
      console.log('response is ', response)
      props.showAlert(`Student added to group`, 'success')
    } catch (error) {
      console.log('error in adding student', error);
      props.showAlert(`error adding to group ${error}`, 'danger')
    }
  }

  const getGroup = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/supervisor/my-groups', {
        method: 'GET',
        headers: {
          'Content-Type': 'appication/json',
          authorization: `${token}`
        }
      });
      const json = await response.json();
      console.log('json is ', json);
      setGroup(json);

    } catch (error) {
      console.log('error is ', error);
    }
  }

  useEffect(() => {
    getGroup();
  }, [])

  const filteredData = [
    {
      _id: "64f1cc017f2f39d3e45a75e7",
      supervisor: "Sadaat Hassan",
      supervisorId: "64f1c604957a7cb325355dd8",
      projects: [
        {
          projectTitle: "DE",
          projectId: "64f1cbb10fd7185e397b2a32",
          students: [
            {
              userId: "64f1c517957a7cb325355dc9",
              name: "Huzaifa",
              rollNo: "0094",
              _id: "64f1cc017f2f39d3e45a75eb"
            }, {
              userId: "64f1c517957a7cb325355dc9",
              name: "Huzaifa",
              rollNo: "0094",
              _id: "64f1cc017f2f39d3e45a75eb"
            },
          ],
          _id: "64f1cc017f2f39d3e45a75ea"
        }, {
          projectTitle: "DE",
          projectId: "64f1cbb10fd7185e397b2a32",
          students: [
            {
              userId: "64f1c517957a7cb325355dc9",
              name: "Huzaifa",
              rollNo: "0094",
              _id: "64f1cc017f2f39d3e45a75eb"
            }, {
              userId: "64f1c517957a7cb325355dc9",
              name: "Huzaifa",
              rollNo: "0094",
              _id: "64f1cc017f2f39d3e45a75eb"
            },
          ],
          _id: "64f1cc017f2f39d3e45a75ea"
        }, {
          projectTitle: "DE",
          projectId: "64f1cbb10fd7185e397b2a32",
          students: [
            {
              userId: "64f1c517957a7cb325355dc9",
              name: "Huzaifa",
              rollNo: "0094",
              _id: "64f1cc017f2f39d3e45a75eb"
            }, {
              userId: "64f1c517957a7cb325355dc9",
              name: "Huzaifa",
              rollNo: "0094",
              _id: "64f1cc017f2f39d3e45a75eb"
            },
          ],
          _id: "64f1cc017f2f39d3e45a75ea"
        },
      ],
      isProp: false,
      isDoc: false,
      __v: 1
    }
  ]

  const handleChange = (e)=>{
    setAddStudent({...addStudent, [e.target.name] : e.target.value})
  }

  return (
    <div>

      <div className="fypIdea">
        <div className="modal fade" id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" >Register</h5>
              </div>
              <div className="modal-body">
                <form onSubmit={(e)=>{handleAddStudent(e,addStudent.projectTitle,addStudent.rollNo)}}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Project Title</label>
                    <input type="text" className="form-control" id="projectTitle" name='projectTitle' value={addStudent.projectTitle} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="exampleInputPassword1" className="form-label">Student Roll No</label>
                    <input type="text" className="form-control" id="rollNo" name='rollNo' value={addStudent.rollNo} onChange={handleChange} />
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

      <h3 className='text-center my-4'>Students Under Me</h3>

      {/* Groups Table */}
      <div className='container' style={{ width: "100%" }} >

        {group.groups.length > 0 ? (
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
                      <th scope="col">Grade</th>
                    </tr>
                  </thead>
                  {group.groups.map((group, groupIndex) => (
                  <tbody style={{ textAlign: "center" }}>
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
                        <td>  {project.projectTitle} </td>
                        <td>{'-----'}</td>
                        <td>{group.isProp ? 'Submitted' : 'Pending'}</td>
                        <td>{group.isDoc ? 'Submitted' : 'Pending'}</td>
                        <td>{group.remarks}<div style={{ cursor: "pointer" }} data-toggle="modal" data-target="#exampleModal">
                          <i className="fa-solid fa-pen-to-square"></i>
                        </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ))}
                </table>
              </div>
          </div>
        ) : (
          <div>No matching members found.</div>
        )}
      </div>
      <div class="d-grid gap-2 d-md-flex justify-content-md-end">
        <button class="btn" data-toggle="modal" data-target="#exampleModal"style={{ background: "maroon", color: "white", position: "relative", right: "7rem" }} type="button">Add Student</button>
      </div>
      
    </div>
  )
}

export default Groups
