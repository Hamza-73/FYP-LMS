import React, { useEffect, useState } from 'react'
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';
import Loading from '../Loading'
import { useNavigate } from 'react-router-dom';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';

const Event = (props) => {
  const history = useNavigate()


  const [value, onChange] = useState(new Date());
  const [viva, setViva] = useState({ projectTitle: '', vivaDate: '', vivaTime: '' });
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ vivas: [] });

  const getVivas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/viva/vivas`, {
        method: "GET",
      });
      const json = await response.json();
      // console.log('Response status:', response.status);
      // console.log('json in vivas ', json);
      if (json.message && json.success) {
        setData(json);
        props.showAlert(`${json.message}`, 'success');
      }
      else {
        props.showAlert(`${json.message}`, 'danger');
      }
    } catch (error) {
      console.log('error dealing with requests', error);
      props.showAlert(`Some error occured try to reload the page/ try again`, 'danger');
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    if (localStorage.getItem('token')) {
      setTimeout(() => {
        getVivas();
      }, 1500)
    }
  }, [])

  const scheduleViva = async (e) => {
    try {
      e.preventDefault();
      const response = await fetch(`http://localhost:5000/viva/schedule-viva`,{
        method: "POST",
        headers: {
          'Content-Type': "application/json",
        },
        body : JSON.stringify({
          projectTitle: viva.projectTitle, vivaDate: viva.vivaDate, vivaTime: viva.vivaTime
        },)
      });
      const json = await response.json();
      console.log('json in handle requests is ', json);

      if (json.message && json.success) {
        props.showAlert(`Request ${json.message}`, 'success');
      } else {
        props.showAlert(`Request ${json.message}`, 'danger');
      }
    } catch (error) {
      console.log('error scheduling viva', error);
      props.showAlert(`Some error occured try to reload the page/ try again`, 'danger');
    }
  }

  const handleChange1 = (e) => {
    setViva({ ...viva, [e.target.name]: e.target.value })
  }

  return (
    <div>
      {/* <Calendar onChange={onChange} value={value} />
      <h1>Time</h1>
      <Clock value={date} /> */}
      <>
        <div className="viva"  >
          <div className="modal fade" id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" >Register</h5>
                </div>
                <div className="modal-body">
                  <form onSubmit={(e)=>scheduleViva(e)}>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Project Title</label>
                      <input type="text" className="form-control" id="projectTitle" name='projectTitle' value={viva.projectTitle} onChange={handleChange1} />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Viva Date</label>
                      <input type="text" className="form-control" id="vivaDate" name='vivaDate' value={viva.vivaDate} onChange={handleChange1} />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Viva Time</label>
                      <input type="text" className="form-control" id="vivaTime" name='vivaTime' value={viva.vivaTime} onChange={handleChange1} />
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                      <button type="submit" className="btn btn-success" > Register </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (<Loading />) : (<>
          <div className='container' style={{ width: "90%" }}>
            <h3 className='text-center' >Scheduled Viva</h3>
            <div className="mb-3">
            </div>
            {data.vivas.length > 0 ? (
              <table className="table text-center table-hover">
                <thead>
                  <tr >
                    <th scope="col">Student Name</th>
                    <th scope="col">Project Title</th>
                    <th scope="col">Project Proposal</th>
                    <th scope="col">Documentation</th>
                    <th scope="col">Project Submission</th>
                    <th scope="col">Viva Date</th>
                    <th scope="col">Viva Time</th>
                    <th scope="col">Edit</th>
                  </tr>
                </thead>
                <tbody className='text-center'>
                  {data.vivas.map((val, key) => (
                    <tr key={key}>
                      <td>
                        <div>
                          {val.students.map((student, studentKey) => (
                            <React.Fragment key={studentKey}>
                              {student.name} <br />
                            </React.Fragment>
                          ))}
                        </div>
                      </td>
                      <td>{val.projectTitle}</td>
                      <td>{val.documentation.isProps ? "Submitted" : "Pending"}</td>
                      <td>{val.documentation.isDoc ? "Submitted" : "Pending"}</td>
                      <td>{'project Submisison'}</td>
                      <td>{new Date(val.vivaDate).toLocaleDateString('en-GB')}</td>
                      <td>{val.vivaTime}</td>
                      <td style={{ cursor: "pointer" }} data-toggle="modal" data-target="#exampleModal">
                        <i class="fa-solid fa-pen-to-square"></i>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div>No matching members found.</div>
            )}
          </div>
          <div className="d-grid gap-2 col-6 mx-auto my-4">
            <button style={{ background: "maroon" }} type="button" className="btn btn-danger mx-5" data-toggle="modal" data-target="#exampleModal">
              Schedule Viva
            </button>
          </div>
        </>)}
      </>
    </div>

  )
}

export default Event
