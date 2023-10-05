import React, { useEffect, useState } from 'react';
import Loading from '../Loading';
import SideBar from '../SideBar';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

const ProjectRequests = (props) => {
  const [requests, setRequests] = useState({ request: [] });
  const [improve, setImprove] = useState({ projectTitle: '', scope: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState("");

  useEffect(() => {
    const getRequests = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/supervisor/view-sent-proposals', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
        });
        const json = await response.json();
        console.log('ia am side bar');
        console.log('json requests is ', json);

        if (json) {
          setRequests(json);
        }
        setLoading(false);
      } catch (error) {
        console.log('error fetching requests', error);
      }
    };
    if (localStorage.getItem('token')) {
      setTimeout(() => {
        // setLoading(true);
        getRequests();
      }, 1000);
    }
  }, []);

  const handleRequests = async (e) => {
    try {
      e.preventDefault();
      console.log('request is started');
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/supervisor/improve-request/${requestId}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          "Authorization": token,
        },
        body : JSON.stringify({
          projectTitle: improve.projectTitle, scope: improve.scope, description: improve.description 
        })
      });
      console.log('after fetch')

      console.log('Response status:', response.status);
      const json = await response.json();
      console.log('json in handle requests is ', json);

      if (json.message && json.success) {
        setRequests(prevState => ({
          request: prevState.request.filter(req => req.requestId !== requestId)
        }));
        setImprove({projectTitle:"",scope:"",description:""});
        NotificationManager.success(json.message,'',1000);
      } else {
        NotificationManager.error(json.message,'',1000);;
      }
    } catch (error) {
      console.log('error dealing with requests', error);
    }
  };

  const rejectRequest = async (id) => {
    try {
      
      console.log('request is started');
      console.log('improve', improve)
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/supervisor/reject-request/${id}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          "Authorization": token,
        },
      });
      console.log('after fetch')

      console.log('Response status:', response.status);
      const json = await response.json();
      console.log('json in handle requests is ', json);

      if (json.message && json.success) {
        setRequests(prevState => ({
          request: prevState.request.filter(req => req.requestId !== id)
        }));
        NotificationManager.success(json.message,'',1000);
      } else {
        NotificationManager.error(json.message,'',1000);;
      }
    } catch (error) {
      console.log('error dealing with requests', error);
    }
  };

  const acceptRequest = async (id) => {
    try {
      console.log('request is started');
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/supervisor/accept-request/${id}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          "Authorization": token,
        },
      });
      console.log('after fetch')

      const json = await response.json();
      console.log('json in handle requests is ', json);

      if (json.message && json.success) {
        setRequests(prevState => ({
          request: prevState.request.filter(req => req.requestId !== id)
        }));
        NotificationManager.success(json.message,'',1000);
      } else {
        NotificationManager.error(json.message,'',1000);;
      }
    } catch (error) {
      console.log('error dealing with requests', error);
    }
  };

  const handleChange = (e) => {
    setImprove({ ...improve, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <div className="imporve">
        <div className="modal fade" id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Register</h5>
              </div>
              <div className="modal-body">
                <form onSubmit={handleRequests}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Project Title</label>
                    <input type="text" className="form-control" id="projectTitle" name="projectTitle" value={improve.projectTitle} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="exampleInputPassword1" className="form-label">Scope</label>
                    <input type="text" className="form-control" id="scope" name="scope" value={improve.scope} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="exampleInputPassword1" className="form-label">Description</label>
                    <textarea className="form-control" id="description" name="description" value={improve.description} onChange={handleChange} />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="submit" className="btn" style={{ background: 'maroon', color: 'white' }} disabled={!improve.projectTitle || !improve.scope || !improve.description}>
                      Improve Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!loading ? (
        <>
            {requests.request.length > 0 ? (
          <div div className="container" style={{ width: '100%' }}>
            <h3 className="text-center">Requests</h3>
              <div>
                <div>
                  <table className="table table-hover">
                    <thead style={{ textAlign: 'center' }}>
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
                      <tbody key={groupKey} style={{ textAlign: 'center' }}>
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
                            <td>
                              <div style={{ cursor: 'pointer' }}>
                                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                  <button className="btn btn-success btn-sm me-md-2" type="button" onClick={() => {
                                    acceptRequest(group.requestId);
                                  }}>Accept</button>
                                  <button className="btn btn-warning btn-sm" type="button" onClick={(e) => {
                                    rejectRequest(group.requestId);
                                  }}>Reject</button>
                                  <button className="btn btn-sm" style={{ background: 'maroon', color: 'white' }} data-toggle="modal" data-target="#exampleModal" type="button" onClick={()=>setRequestId(group.requestId)}>Improve</button>
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
          </div>
            ) : (
              <h1 className='text-center'>You have no requests for now.</h1>
            )}
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default ProjectRequests;
