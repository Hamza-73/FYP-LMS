import React, { useEffect, useState } from 'react'

const ProjectRequests = (props) => {

  const [requests,setRequests] = useState({request:[]});
  const [choice, setChoice] = useState({ action : '', id:'' });
  const [imporve, setImprove] = useState({projectTitle:'',scope:'',description:'' });

  const getRequests = async ()=>{
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/supervisor/view-sent-proposals',{
        method : 'GET',
        headers :{
          "Content-Type": "application/json",
          authorization : `${token}`
        }
      });
      const json = await response.data;
      if(json){
        console.log('json requests is ', json);
        setRequests(json)
        props.showAlert(`Requests Fetched`, 'success')
      }
    } catch (error) {
      console.log('error fetching requests', error);
      props.showAlert(`Error fetching requests ${error}`, 'danger')
    }
  }

  const handleRequests = async (e)=>{
        try {
          e.preventDefault();
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/supervisor/accept-project-request/${choice.action}/${choice.id}`,{
            method:'PUT',
            headers:{
              "Content-type":"application/json",
              authorization : `${token}`
            }});
            const json = await response.data ;
            console.log('json');
            if(json.success){
              props.showAlert(`Request ${choice}`, 'success');
            }
        } catch (error) {
          console.log('error dealing with requests', error);
          props.showAlert(`error dealing with requests:  ${error}`, 'danger')          
        }
  }

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
  const handleChange = (e)=>{
    setImprove({...imporve, [e.target.name]: e.target.value})
  }
  useEffect(()=>{
    getRequests();
  },[])
  return (
    <div>
      <div className="imporve"  >
        <div className="modal fade" id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" >Register</h5>
              </div>
              <div className="modal-body">
                <form onSubmit={(e)=>{handleRequests(e)}}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Project Title</label>
                    <input type="text" className="form-control" id="projectTitle" name='projectTitle' value={imporve.projectTitle} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="exampleInputPassword1" className="form-label">Scope</label>
                    <input type="text" className="form-control" id="scope" name='scope' value={imporve.scope} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="exampleInputPassword1" className="form-label">Description</label>
                    <textarea className="form-control" id="description" name='description' value={imporve.description} onChange={handleChange} />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="submit" className="btn" style={{background:"maroon", color:"white"}} disabled={!imporve.projectTitle || !imporve.scope || !imporve.description}>
                      Add Idea
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      </div>

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
                    <th scope="col">Accept/Reject/Improve</th>
                  </tr>
                </thead>
                {request.map((group, groupKey) => (
                  <tbody style={{ textAlign: "center" }}>
                    {group.studentDetails.map((project, projectKey) => (
                      <tr key={groupKey}>
                        <td>
                          <div>
                            <React.Fragment key={projectKey}>
                             <td> {project.studentName}<br /></td>
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
                            <button class="btn btn-success btn-sm me-md-2" type="button" onClick={()=>{setChoice({action:'accept', id:`${group.requestId}`})}}>Accept</button>
                            <button class="btn btn-warning btn-sm" type="button" onClick={()=>{setChoice({action:'reject', id:`${group.requestId}`})}}>Reject</button>
                            <button class="btn btn-sm" style={{ background: "maroon", color: "white" }} data-toggle="modal" data-target="#exampleModal" type="button" onClick={()=>{setChoice({action:'improve', id:`${group.requestId}`})}}>Imrpove</button>
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
