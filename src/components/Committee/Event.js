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
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ vivas: [] });

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


  return (
    <div>
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