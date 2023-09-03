import React, { useEffect, useState } from 'react'
import Loading from '../Loading';

const ProjectRequests = (props) => {

  const [requests,setRequests] = useState({request:[]});
  const [choice, setChoice] = useState({ action : '', id:'' });
  const [imporve, setImprove] = useState({projectTitle:'',scope:'',description:'' });
  const [loading,setLoading] = useState(false);

  useEffect(()=>{
    const getRequests = async ()=>{
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/supervisor/view-sent-proposals',{
          method : 'GET',
          headers :{
            "Content-Type": "application/json",
            "Authorization" : token
          }
        });
        const json = await response.json();
        console.log('ia am side bar')
        console.log('json requests is ', json);
  
        if(json){
          setRequests(json)
        }
      } catch (error) {
        console.log('error fetching requests', error);
        props.showAlert(`Error fetching requests ${error}`, 'danger')
      }
    }
    if(localStorage.getItem('token')){
      setTimeout(()=>{
        setLoading(true);
        getRequests();
      },2000)
    }
  },[])
 
  const handleRequests = async (e)=>{
        try {
          e.preventDefault();
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/supervisor/accept-project-request/${choice.action}/${choice.id}`,{
            method:'PUT',
            headers:{
              "Content-type":"application/json",
              'Authorization' : token
            }});
            const json = await response.json() ;
            console.log('json');
            if(json.success){
              props.showAlert(`Request ${choice}`, 'success');
            }
        } catch (error) {
          console.log('error dealing with requests', error);
          props.showAlert(`error dealing with requests:  ${error}`, 'danger')          
        }
  }

  const handleChange = (e)=>{
    setImprove({...imporve, [e.target.name]: e.target.value})
  }
  
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

      { loading? <>
        <div div className='container' style={{ width: "100%" }}>
        <h3 className='text-center'>Requests</h3>
        {requests.request.length > 0 ? (
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
                {requests.request.map((group, groupKey) => (
                  <tbody className='text-center' style={{ textAlign: "center" }}>
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
                        <td><div style={{ cursor: "pointer" }}>
                          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                            <button className="btn btn-success btn-sm me-md-2" type="button" onClick={()=>{setChoice({action:'accept', id:`${group.requestId}`})}}>Accept</button>
                            <button className="btn btn-warning btn-sm" type="button" onClick={()=>{setChoice({action:'reject', id:`${group.requestId}`})}}>Reject</button>
                            <button className="btn btn-sm" style={{ background: "maroon", color: "white" }} data-toggle="modal" data-target="#exampleModal" type="button" onClick={()=>{setChoice({action:'improve', id:`${group.requestId}`})}}>Imrpove</button>
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
          <div>You have No Requests By Now.</div>
        )}
      </div>
      </> : <Loading/>
      }
    </div>
  )
}

export default ProjectRequests
