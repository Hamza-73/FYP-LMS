import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProjectProgress = (props) => {
  const [group, setGroup] = useState({ groups: [] });

  const getProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authorization token not found', 'danger');
        return;
      }
      const response = await fetch("http://localhost:5000/committee/progress", {
        method:"GET",
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

  useEffect(() => {
    setTimeout(() => {
      getProjects();
    }, 1000)
  }, []);

  return (
    <div>
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
                      <td>{group.external? group.external : 0}</td>
                      <td>{group.marks? group.marks : 0}</td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <h2 className='text-center'>You currently have no group in supervision.</h2>
      )}
    </div>
  );
};

export default ProjectProgress;