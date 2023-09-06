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

const ProjectProgress = (props) => {
  const history = useNavigate();
  const [viva, setViva] = useState({ projectTitle: '', vivaDate: new Date(), vivaTime: '' });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ vivas: [] });
  const [isFieldsModified, setIsFieldsModified] = useState(false);

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
    } catch (error) {
      console.log('error dealing with requests', error);
      NotificationManager.error('Some Error occurred reload page/ try again');
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    setLoading(true);
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
              <h3 className="text-center">Project Progress</h3>
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
                      <th scope="col">Viva</th>
                      <th scope="col">External</th>
                      <th scope="col">Grade</th>
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
                        <td>{new Date(val.vivaDate).toLocaleDateString('en-GB') < new Date() ? "Taken" : new Date(val.vivaDate).toLocaleDateString('en-GB')}</td>
                        <td>{val.extarnal || val.extarnal>0? val.extarnal: 0}</td>
                        <td>{val.marks || val.marks>0? val.marks: 0}</td>
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

export default ProjectProgress;