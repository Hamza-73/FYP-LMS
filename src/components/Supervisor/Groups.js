import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useAsyncError } from 'react-router-dom';

const Groups = (props) => {

  const [group,setGroup] = useState({groups:[]})
  const getGroup = async ()=>{
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/supervisor/my-groups',{
        method : 'GET',
        headers:{
          'Content-Type' : 'appication/json',
          authorization : `${token}`
        }
      });
      const json = await response.json();
      console.log('json is ', json);
      setGroup(json);


    } catch (error) {
      console.log('error is ', error);
      props.showAlert(`Error is ${error}`, 'danger')
    }
  }

  useEffect(()=>{
    getGroup();
  },[])

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
            },{
              userId: "64f1c517957a7cb325355dc9",
              name: "Huzaifa",
              rollNo: "0094",
              _id: "64f1cc017f2f39d3e45a75eb"
            },
          ],
          _id: "64f1cc017f2f39d3e45a75ea"
        },{
          projectTitle: "DE",
          projectId: "64f1cbb10fd7185e397b2a32",
          students: [
            {
              userId: "64f1c517957a7cb325355dc9",
              name: "Huzaifa",
              rollNo: "0094",
              _id: "64f1cc017f2f39d3e45a75eb"
            },{
              userId: "64f1c517957a7cb325355dc9",
              name: "Huzaifa",
              rollNo: "0094",
              _id: "64f1cc017f2f39d3e45a75eb"
            },
          ],
          _id: "64f1cc017f2f39d3e45a75ea"
        },{
          projectTitle: "DE",
          projectId: "64f1cbb10fd7185e397b2a32",
          students: [
            {
              userId: "64f1c517957a7cb325355dc9",
              name: "Huzaifa",
              rollNo: "0094",
              _id: "64f1cc017f2f39d3e45a75eb"
            },{
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
  return (
    <div>
      <h3>Students Under Me</h3>

      {/* Groups Table */}
      <div div className='container'>        

        {filteredData.length > 0 ? (
          <div>
            {filteredData.map((group, groupIndex) => (
              <div key={groupIndex}>
               
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
                        <td>{group.isProp? 'Submitted' : 'Pending'}</td>
                        <td>{group.isDoc? 'Submitted' : 'Pending'}</td>
                        <td>{group.remarks}<div style={{ cursor: "pointer" }} data-toggle="modal" data-target="#exampleModal">
                          <i className="fa-solid fa-pen-to-square"></i>
                        </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ) : (
          <div>No matching members found.</div>
        )}
      </div>
    </div>
  )
}

export default Groups
