import React, { useEffect, useState } from 'react';
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';
import Loading from '../Loading';
import { useNavigate } from 'react-router-dom';
import 'react-clock/dist/Clock.css';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

const Event = (props) => {
  const history = useNavigate();
  const [data, setData] = useState({ vivas: [] });
  
  const [viva, setViva] = useState({ projectTitle: '', vivaDate: new Date(), vivaTime: '' });
  const [loading, setLoading] = useState(false);
  const [isFieldsModified, setIsFieldsModified] = useState(false);

  const [isInvalidDate, setIsInvalidDate] = useState(false);

  
  const editViva = async (e) => {
    try {
      e.preventDefault();
      const response = await fetch(`http://localhost:5000/viva/edit`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectTitle: viva.projectTitle,
          vivaDate: viva.vivaDate,
          vivaTime: viva.vivaTime,
        }),
      });
      const json = await response.json();
      console.log('json in handle requests is ', json);

      if (json.message && json.success) {
        NotificationManager.success(json.message);
      } else {
        NotificationManager.error(json.message);
      }
    } catch (error) {
      console.log('error scheduling viva', error);
      NotificationManager.error(`Some error occurred try to reload the page/ try again`);
    }
  }

  const getVivas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/viva/vivas`, {
        method: 'GET',
      });
      const json = await response.json();

      if (json.message && json.success) {
        setData(json);
        NotificationManager.success(json.message);
      } else {
        NotificationManager.error(json.message);
      }
      setLoading(false)
    } catch (error) {
      console.log('error dealing with requests', error);
      NotificationManager.error('Some Error occurred reload page/ try again');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    // setLoading(true);
    if (localStorage.getItem('token')) {
      setTimeout(() => {
        getVivas();
      }, 1500);
    }
  }, []);

  const handleChange1 = (e) => {
    setViva({ ...viva, [e.target.name]: e.target.value });
  };

  const handleCalendarChange = (date) => {
    // Prevent selecting dates behind the current date
    const currentDate = new Date();
    if (date < currentDate) {
      setIsInvalidDate(true); // Set invalid date flag to true
      return; // Don't update the state if the selected date is behind the current date
    }

    setViva({ ...viva, vivaDate: date });
    setIsFieldsModified(true); // Field modified, enable the button
    setIsInvalidDate(false); // Reset invalid date flag
  };

  const handleTimeChange = (time) => {
    setViva({ ...viva, vivaTime: time });
    setIsFieldsModified(true); // Field modified, enable the button
  };

  return (
    <div>

      <div className="viva">
        <div className="modal fade" id="exampleModal1" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Register</h5>
              </div>
              <div className="modal-body">
                <form onSubmit={(e) => editViva(e)}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Project Title
                    </label>
                    <input type="text" className="form-control" id="projectTitle" name="projectTitle" value={viva.projectTitle} onChange={handleChange1} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Viva Date
                    </label>
                    <Calendar onChange={handleCalendarChange} value={viva.vivaDate} />
                  </div>
                  {isInvalidDate && (
                    <div className="text-danger">Please enter a valid date (not in the past).</div>
                  )}
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Viva Time
                    </label>
                    <div>
                      <TimePicker onChange={handleTimeChange} value={viva.vivaTime} />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">
                      Close
                    </button>
                    <button type="submit" className="btn btn-danger" style={{ background: 'maroon' }}
                      disabled={!isFieldsModified || !viva.projectTitle}
                    >
                      Edit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <>
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="container" style={{ width: '90%' }}>
              <h3 className="text-center">Scheduled Viva</h3>
              <div className="mb-3"></div>
              {data.vivas.length > 0 ? (
                <table className="table text-center table-hover">
                  <thead>
                    <tr>
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
                  <tbody className="text-center">
                    {data.vivas.map((val, key) => (
                      <tr key={key}>
                        <td>
                          <div>
                            {val.students.map((student, studentKey) => (
                              <React.Fragment key={studentKey}>{student.name} <br /></React.Fragment>
                            ))}
                          </div>
                        </td>
                        <td>{val.projectTitle}</td>
                        <td>{val.documentation.isProps ? 'Submitted' : 'Pending'}</td>
                        <td>{val.documentation.isDoc ? 'Submitted' : 'Pending'}</td>
                        <td>{'project Submission'}</td>
                        <td>{new Date(val.vivaDate).toLocaleDateString('en-GB')}</td>
                        <td>{val.vivaTime}</td>
                        <td data-toggle="modal" data-target="#exampleModal1"><i class="fa-solid fa-pen-to-square"></i></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div>No matching members found.</div>
              )}
            </div>
          </>
        )}

        <NotificationContainer />
      </>
    </div>
  );
};

export default Event;