import React, { useEffect, useState } from 'react';
import Loading from '../Loading';

const ProjectRequests = (props) => {
  const [requests, setRequests] = useState({ request: [] });
  const [choice, setChoice] = useState({ action: '', id: '' });
  const [improve, setImprove] = useState({ projectTitle: '', scope: '', description: '' });
  const [loading, setLoading] = useState(false);

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

  const handleRequests = async () => {
    try {
      // e.preventDefault();
      console.log('request is started');
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/supervisor/accept-project-request/${choice.id}/${choice.action}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      });

      console.log('Response status:', response.status);
      const json = await response.json();
      console.log('json in handle requests is ', json);

      if (json.message && json.success) {
        props.showAlert(`Request ${json.message}`, 'success');
      } else {
        props.showAlert(`Request ${json.message}`, 'danger');
      }
    } catch (error) {
      console.log('error dealing with requests', error);
      props.showAlert(`Some error occured try to reload the page/ try again`, 'danger');
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
                <form onSubmit={(e) => { handleRequests(e); }}>
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
                      Add Idea
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
                            {/* <td>{group.requestId}</td> */}
                            <td>
                              <div style={{ cursor: 'pointer' }}>
                                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                  <button className="btn btn-success btn-sm me-md-2" type="button" onClick={() => {
                                    setChoice({ action: 'accept', id: group.requestId });
                                    handleRequests();
                                  }}>Accept</button>
                                  <button className="btn btn-warning btn-sm" type="button" onClick={(e) => {
                                    setChoice({ action: 'reject', id: group.requestId });
                                    handleRequests(e);
                                  }}>Reject</button>
                                  <button className="btn btn-sm" style={{ background: 'maroon', color: 'white' }} data-toggle="modal" data-target="#exampleModal" type="button" onClick={(e) => {
                                    setChoice({ action: 'improve', id: group.requestId });
                                    handleRequests(e);
                                  }}>Improve</button>
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
