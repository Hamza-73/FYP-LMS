import React from 'react'

const ProjectRequests = () => {

  const request = [
    {
      requestId: "64f1cbb10fd7185e397b2a32",
      projectId: "64f1cbb10fd7185e397b2a30",
      projectTitle: "DE",
      scope: "scope",
      description: "desc",
      studentDetails: [
        {
          studentName: "Huzaifa",
          rollNo: "0094",
          studentId: "64f1c517957a7cb325355dc9"
        }
      ]
    },
    {
      requestId: "64f1ccb82f292f6ee58d21e2",
      projectId: "64f1ccb82f292f6ee58d21e0",
      projectTitle: "LA",
      scope: "scope",
      description: "desc kjxbgiey jdcgey kyrgc8txygn gcretfu",
      studentDetails: [
        {
          studentName: "Zaroon",
          rollNo: "0091",
          studentId: "64f1c4ea957a7cb325355dc0"
        }
      ]
    },
    {
      requestId: "64f1ccb82f292f6ee58d21e2",
      projectId: "64f1ccb82f292f6ee58d21e0",
      projectTitle: "LA",
      scope: "scope",
      description: "desc kjxbgiey jdcgey kyrgc8txygn gcretfu",
      studentDetails: [
        {
          studentName: "Zaroon",
          rollNo: "0091",
          studentId: "64f1c4ea957a7cb325355dc0"
        }
      ]
    }
  ]
  return (
    <div>
      <div div className='container' style={{ width: "100%" }}>
        <h3 className='text-center'>Requests</h3>
        {request.length > 0 ? (
          <div>
            <div>
              <table className='table table-hover'>
                <thead style={{ textAlign: "center" }}>
                  <tr>
                    <th scope="col">Student Name</th>
                    <th scope="col">Roll No</th>
                    <th scope="col">Project Title</th>
                    <th scope="col">Description</th>
                    <th scope="col">Scope</th>
                    <th scope="col">Accept/Reject/Proposal</th>
                  </tr>
                </thead>
                {request.map((group) => (
                  <tbody style={{ textAlign: "center" }}>
                    {group.studentDetails.map((project, projectKey) => (
                      <tr key={projectKey}>
                        <td>
                          <div>
                            <React.Fragment key={projectKey}>
                              {project.studentName}<br />
                            </React.Fragment>

                          </div>
                        </td>
                        <td>
                          <div>
                            <React.Fragment key={projectKey}>
                              {project.rollNo}<br />
                            </React.Fragment>
                          </div>
                        </td>
                        <td>{group.projectTitle}</td>
                        <td>{group.description}</td>
                        <td>{group.scope}</td>
                        <td><div style={{ cursor: "pointer" }} data-toggle="modal" data-target="#exampleModal">
                          <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                            <button class="btn btn-success btn-sm me-md-2" type="button">Accept</button>
                            <button class="btn btn-warning btn-sm" type="button">Reject</button>
                            <button class="btn btn-sm" style={{ background: "maroon", color: "white" }} type="button">Imrpove</button>
                          </div>
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
    </div>
  )
}

export default ProjectRequests
