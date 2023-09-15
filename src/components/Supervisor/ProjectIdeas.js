import React, { useEffect, useState } from 'react'
import Loading from '../Loading';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

const ProjectIdeas = () => {

  const [fypIdea, setFypIdea] = useState({
    projectTitle: '', description: '', scope: ''
  });
  const [idea, setIdea] = useState({ supervisor: "", ideas: [{
    projectTitle: '', description: '', scope: '',
    time : '', date : '',
  }] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getIdeas = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/supervisor/myIdeas', {
          method: 'GET',
          headers: {
            'Authorization': token
          }
        });
        const json = await response.json();
        console.log('idea json is ', json);
        setIdea(json)
        setLoading(false)
      } catch (error) {
        console.log('error in ideas', error);
      }
    }
    if (localStorage.getItem('token')) {
      setTimeout(() => {
        getIdeas();
      }, 1000);
      console.log('inside effect ', idea)
    }
  }, []);

  
  const [addStudent, setAddStudent] = useState({ rollNo: '', projectTitle: '', });
  const [isAddStudentButtonEnabled, setIsAddStudentButtonEnabled] = useState(false);


  const handleIdea = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/supervisor/send-project-idea`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          'Authorization': token
        }, body: JSON.stringify({
          projectTitle: fypIdea.projectTitle, description: fypIdea.description,
          scope: fypIdea.scope
        })
      });
      const json = await response.json();
      if(!json.success){
        NotificationManager.error(json.message);
        console.log('json message is ', json)
        return;
      }
      if (json) {
        // Create a new idea object from the fypIdea state
        const newIdea = {
          projectTitle: fypIdea.projectTitle,
          description: fypIdea.description,
          scope: fypIdea.scope,
        };
        NotificationManager.success(json.message);
        // Update the state with the new idea
        setIdea((prevState) => ({
          ...prevState,
          ideas: [...prevState.ideas, newIdea], // Add the new idea object to the existing list
        }));
      }
      console.log('json in addig idea is ', json)
    } catch (error) {
      console.log('error adding project request', error);
    }
  }

  const handleAddStudent = async (e, projectTitle, rollNo) => {
    try {
      e.preventDefault();
      console.log('add stdents starts');
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/supervisor/add-student/${projectTitle}/${rollNo}`, {
        method: 'POST',
        headers: {
          Authorization: token,
        },
      });

      const json = await response.json();
      console.log('response is ', json);

      if(json.success){
        NotificationManager.success(json.message);
      }
      else{
        NotificationManager.error(json.message);
      }
    } catch (error) {
      console.log('error in adding student', error);
      NotificationManager.error('Some Error ocurred Try/Again');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleIdea();
  }

  const handleChange = (e) => {
    setFypIdea({ ...fypIdea, [e.target.name]: e.target.value })
  };

  const handleChange1 = (e)=>{
    setAddStudent({...addStudent, [e.target.name]:e.target.value})
  }

   // Add a useEffect hook to watch for changes in the addStudent state
   useEffect(() => {
    // Check if both projectTitle and rollNo are not empty to enable the button
    setIsAddStudentButtonEnabled(!!addStudent.projectTitle && !!addStudent.rollNo);
  }, [addStudent.projectTitle, addStudent.rollNo]);

  return (
    <div>
      <div className="fypIdea"  >
        <div className="modal fade" id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" >Register</h5>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Project Title</label>
                    <input type="text" className="form-control" id="projectTitle" name='projectTitle' value={fypIdea.projectTitle} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="exampleInputPassword1" className="form-label">Scope</label>
                    <input type="text" className="form-control" id="scope" name='scope' value={fypIdea.scope} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="exampleInputPassword1" className="form-label">Description</label>
                    <textarea className="form-control" id="description" name='description' value={fypIdea.description} onChange={handleChange} />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="submit" className="btn" style={{ background: "maroon", color: "white" }} disabled={!fypIdea.projectTitle || !fypIdea.scope || !fypIdea.description}>
                      Add Idea
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      </div>


      <div className="fypIdea">
        <div className="modal fade" id="exampleModal1" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel1" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Student To Existing Group</h5>
              </div>
              <div className="modal-body">
                <form onSubmit={(e) => { handleAddStudent(e, addStudent.projectTitle, addStudent.rollNo); }}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Project Title</label>
                    <input type="text" className="form-control" id="projectTitle" name="projectTitle" value={addStudent.projectTitle} onChange={handleChange1} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="rollNo" className="form-label">Student Roll No</label>
                    <input type="text" className="form-control" id="rollNo" name="rollNo" value={addStudent.rollNo} onChange={handleChange1} />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={()=>{
                      setAddStudent({
                        projectTitle:"", rollNo:""
                      })
                    }}>Close</button>
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

      {!loading ? <>
        {idea.ideas.length > 0 ? (
          <div div className='container my-5' style={{ width: "100%" }}>
            <h3 className='text-center'>My FYP Ideas</h3>
            <div>
              <div>
                <table className='table table-hover'>
                  <thead style={{ textAlign: "center" }}>
                    <tr>
                      <th scope="col">Sr No.</th>
                      <th scope="col">Supervisor</th>
                      <th scope="col">Project Title</th>
                      <th scope="col">Scope</th>
                      <th scope="col">Description</th>
                      <th scope="col">Time</th>
                      <th scope="col">Date</th>
                      <th scope="col">Add Student</th>
                    </tr>
                  </thead>
                  <tbody className='text-center'>
                    {idea.ideas.map((group, groupKey) => (
                      <tr key={groupKey}>
                        <td>{groupKey + 1}</td>
                        <td>{idea.supervisor}</td>
                        <td>{group.projectTitle}</td>
                        <td>{group.scope}</td>
                        <td>{group.description}</td>
                        <td>{group.time}</td>
                        <td>{group.date}</td>
                        <td> <button className="btn btn-sm" data-toggle="modal" data-target="#exampleModal1" style={{ background: "maroon", color: "white"}} type="button" onClick={()=>{
                          setAddStudent({projectTitle:group.projectTitle})
                        }}>Add Student</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <h2 className='text-center'>No Project Ideas! Add to see You're Ideas.</h2>
        )}

        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          <button class="btn" data-toggle="modal" data-target="#exampleModal" style={{ background: "maroon", color: "white", position: "relative", right: "7rem" }} type="button">Add FYP Idea</button>
        </div>
        <NotificationContainer/>
      </> : <Loading />
      }
    </div>

  )
}

export default ProjectIdeas
