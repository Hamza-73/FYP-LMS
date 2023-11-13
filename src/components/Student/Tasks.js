import React, { useEffect, useState } from 'react';
import '../../css/task.css';
import axios from 'axios';
import Loading from '../Loading';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { Modal } from 'react-bootstrap';

const Tasks = (props) => {
  const [file, setFile] = useState();
  const [group, setGroupDetails] = useState({
    success: false,
    group: {
      myDetail: [{ name: '', rollNo: '', myId: '' }], groupId: '',
      supervisor: '', supervisorId: '', projectTitle: '',
      projectId: '', groupMember: [{ userId: '', name: '', rollNo: '', _id: '' }],
      proposal: false, documentation: false, docDate: '----', propDate: '',
      viva: ''
    },
  });
  const [loading, setLoading] = useState(false);

  const maxFileSize = 10 * 1024 * 1024;

  const upload = async (e, type) => {
    try {
      if (!file) {
        console.log('No file selected.');
        return;
      }
      e.preventDefault();
      const formData = new FormData();
      formData.append('type', type); // Add the 'type' field to the FormData object
      formData.append(type, file);
      if (link) {
        formData.append("link", link);
      }

      // Check if the file size is within the allowed limit
      if (file.size > maxFileSize) {
        console.log('File size exceeds the limit of 5 MB.');
        return;
      }

      console.log('form data is ', formData);

      const response = await fetch('http://localhost:5000/student/upload', {
        method: 'POST',
        headers: {
          Authorization: localStorage.getItem('token'),
        },
        body: formData, // Set the FormData object as the body
      });
      const json = await response.json();
      console.log('response in uploading proposal is', json);
      if (json.success) {
        NotificationManager.success('file Uploaded Successfully');
        groupDetail();
        setShow(false);
      }
    } catch (error) {
      console.log('error in uploading file', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    // Check if a file is selected
    if (selectedFile) {
      // Check file type
      // Check file size (in bytes)
      const maxSize = 10 * 1024 * 1024; // 5MB
      if (selectedFile.size <= maxSize) {
        setFile(selectedFile);
      } else {
        // File size exceeds the limit
        NotificationManager.error('File size must be less than 10MB.');
        e.target.value = null; // Clear the file input 
      }
    }
  }


  const groupDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authorization token not found', 'danger');
        return;
      }
      console.log('before fetch');
      const response = await fetch('http://localhost:5000/student/my-group', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      });
      console.log('after fetch');
      const json = await response.json();
      console.log('group detail is ', json);
      if (!json.success) {
        console.log('group response is ', response);
        console.log('json in not success is ', json.message);
      } else {
        setGroupDetails(json);
      }
      setLoading(false);
    } catch (error) {
      console.log('error fetching group ', error);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('token')) {
      setLoading(true);
      setTimeout(() => {
        groupDetail();
        setLoading(false);
        console.log('details are in group', group.group);
      }, 1000);
    }
  }, []);

  function parseISODate(isoDateString) {
    const parts = isoDateString.match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d{3})Z$/
    );
    if (!parts) {
      return null; // Invalid date format
    }
    const year = parseInt(parts[1], 10);
    const month = parseInt(parts[2], 10) - 1; // Months are zero-based
    const day = parseInt(parts[3], 10);
    const hour = parseInt(parts[4], 10);
    const minute = parseInt(parts[5], 10);
    const second = parseInt(parts[6], 10);
    const millisecond = parseInt(parts[7], 10);
    return new Date(Date.UTC(year, month, day, hour, minute, second, millisecond));
  }

  // Function to calculate time remaining until tomorrow
  function calculateTimeRemaining() {
    const now = new Date(); // Current date and time in client's local time zone
    const timeZoneOffset = 5 * 60 * 60 * 1000; // UTC+5 in milliseconds
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1); // Set to tomorrow
    tomorrow.setHours(0, 0, 0, 0); // Set to midnight

    // Adjust tomorrow to Pakistan Standard Time (PKT)
    const localTomorrow = new Date(tomorrow.getTime());
    // Calculate time difference in PKT
    const timeDifference = localTomorrow.getTime() - now.getTime(); // Calculate time difference in milliseconds
    console.log('time differnece is ', timeDifference)
    if (timeDifference <= 0) {
      return '0d 0h 0m 0s';
    }

    // Calculate hours, minutes, and seconds
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  // Determine if the current task is still active based on the due date
  const isTaskActive = (dueDate) => {
    const dueDateUTC = new Date(dueDate); // Assuming dueDate format: '10-november-2023'
    const currentDateUTC = new Date(); // Current date

    // Extract year, month, and day components of the dates
    const dueYear = dueDateUTC.getFullYear();
    const dueMonth = dueDateUTC.getMonth();
    const dueDay = dueDateUTC.getDate();

    const currentYear = currentDateUTC.getFullYear();
    const currentMonth = currentDateUTC.getMonth();
    const currentDay = currentDateUTC.getDate();
    console.log(dueYear > currentYear ||
      (dueYear === currentYear && dueMonth > currentMonth) ||
      (dueYear === currentYear && dueMonth === currentMonth && dueDay >= currentDay))
    // Compare only the dates (year, month, and day)
    return (
      dueYear > currentYear ||
      (dueYear === currentYear && dueMonth > currentMonth) ||
      (dueYear === currentYear && dueMonth === currentMonth && dueDay >= currentDay)
    );
  };

  const [remainingTime, setRemainingTime] = useState('');

  useEffect(() => {
    // Function to update the remaining time
    function updateRemainingTime() {
      if (group.group.propDate && new Date(group.group.propDate).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)) {

        const newRemainingTime = calculateTimeRemaining(
          parseISODate(group.group.propDate)
        );
        setRemainingTime(newRemainingTime);
      } else if (
        group.group.docDate &&
        new Date(group.group.docDate).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)
      ) {
        const newRemainingTime = calculateTimeRemaining(
          parseISODate(group.group.docDate)
        );
        setRemainingTime(newRemainingTime);
      }
    }
    // Update the remaining time initially
    updateRemainingTime();
    // Set up an interval to update the remaining time every second
    const intervalId = setInterval(updateRemainingTime, 1000);
    // Cleanup the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [group]);

  function formatISODateToDDMMYYYY(isoDateString) {
    const date = new Date(isoDateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  // Determine the current task type based on dates
  let currentTaskType = '';

  const currentDate = new Date().toLocaleDateString(); // Get current date in 'YYYY-MM-DD' format

  if (
    group.group.propDate &&
    new Date(group.group.propDate).toLocaleDateString() >= currentDate
  ) {
    currentTaskType = 'proposal';
  } else if (
    group.group.docDate &&
    new Date(group.group.docDate).toLocaleDateString() >= currentDate
  ) {
    currentTaskType = 'documentation';
  }


  const [link, setLink] = useState('');
  const [show, setShow] = useState('');
  const [invalidLink, setInvalidLink] = useState(false);
  const handleLink = (e) => {
    setInvalidLink(false);
    setLink(e.target.value);
      // Use a regular expression to check if the input value is a valid link
      const linkRegex = /^(http(s)?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ;,./?%&=]*)?$/;
      const isValid = linkRegex.test(e.target.value);
      setInvalidLink(isValid);
  }

  return (
    <div>
      <div className="changeName">
        <Modal show={show} onHide={() => {
          setShow(false);
        }}>
          <Modal.Header className="modal-header">
            <Modal.Title className="modal-title">Upload ${currentTaskType}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body">
            <form onSubmit={(e) => { upload(e, currentTaskType) }}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">File</label>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e)}
                  name="documentation"
                  accept=".pdf"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Link <small>optional</small></label>
                <input type="text" className="form-control" id="title" name="title" value={link} onChange={handleLink} />
                {invalidLink && <div style={{ color: "red" }}>Enter a valid Link</div>}
              </div>
              <Modal.Footer className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={() => { setShow(false); setFile(null) }}>Close</button>
                <button type="submit" className="btn" style={{ background: "maroon", color: "white" }} disabled={!file || invalidLink}>
                  Upload
                </button>
              </Modal.Footer>
            </form>
          </Modal.Body>
        </Modal>
      </div>

      {!loading ? (
        <div className={!currentTaskType ? '' : 'container'}>
          {group.group ? (
            <>
              {currentTaskType === 'proposal' && group.group.propDate && isTaskActive(group.group.propDate) && (
                // Show task propDate and upload proposal
                <div className="task">
                  <h1>Task Submission</h1>
                  <h4>Instructions:</h4>
                  <h6>Project Proposal</h6>
                  <h6>{group.group.instructions}</h6>
                  <div className="boxes d-flex justify-content-evenly">
                    <div>Submission Status</div>
                    <div>{group.group.proposal ? 'Submitted' : 'Pending'}</div>
                  </div>
                  <div className="boxes d-flex justify-content-evenly">
                    <div>Due Date</div>
                    <div>
                      {group.group.propDate
                        ? formatISODateToDDMMYYYY(group.group.propDate)
                        : 'TBA'}
                    </div>
                  </div>
                  <div className="boxes d-flex justify-content-evenly">
                    <div>Submission Date</div>
                    <div>{group.group.propSub ? new Date(group.group.propSub).toISOString().split('T')[0] : '----'}</div>
                  </div>
                  <div className="boxes d-flex justify-content-evenly">
                    <div>Time Remaining</div>
                    <div>
                      {
                        new Date(group.group.propDate).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)
                          ? remainingTime
                          : '-----'
                      }

                    </div>
                  </div>
                  {!group.group.proposal ? (
                    <div className='boxes text-center'>
                      <button
                        className="btn"
                        type="button"
                        style={{ color: 'maroon', background: "white", fontWeight: '600' }}
                        onClick={() => {
                          setShow(true);
                        }}
                      >
                        Add Proposal
                      </button>
                    </div>
                  ) : (
                    <div className="boxes text-center">
                      <a
                        style={{ textDecoration: 'none', color: 'white' }}
                        href={group.group.proposal}
                        target="_blank"
                      >
                        View Uploaded Proposal
                      </a>
                    </div>
                  )}
                </div>
              )}

              {currentTaskType === 'documentation' && group.group.docDate && isTaskActive(group.group.docDate) && (
                // Show docDate and upload document
                <div className="task">
                  <h1>Task Submission</h1>
                  <h4>Instructions:</h4>
                  <h6>Document Submission</h6>
                  <h6>{group.group.instructions}</h6>
                  <div className="boxes d-flex justify-content-evenly">
                    <div>Submission Status</div>
                    <div>
                      {group.group.documentation ? 'Submitted' : 'Pending'}
                    </div>
                  </div>
                  <div className="boxes d-flex justify-content-evenly">
                    <div>Due Date</div>
                    <div>
                      {group.group.docDate
                        ? formatISODateToDDMMYYYY(group.group.docDate)
                        : 'TBA'}
                    </div>
                  </div>
                  <div className="boxes d-flex justify-content-evenly">
                    <div>Submission Date</div>
                    <div>{group.group.docSub ? new Date(group.group.docSub).toISOString().split('T')[0] : '----'}</div>
                  </div>
                  <div className="boxes d-flex justify-content-evenly">
                    <div>Time Remaining</div>
                    <div>
                      {new Date(group.group.docDate) >= new Date()
                        ? remainingTime
                        : '-----'}
                    </div>
                  </div>
                  {!group.group.documentation ? (
                    <div className='boxes text-center'>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e)}
                        name="documentation"
                        accept=".pdf"
                      />
                      <button
                        className="btn"
                        type="button"
                        style={{ color: 'maroon', background: "white", fontWeight: '600' }}
                        onClick={() => {
                          setShow(true);
                        }}
                      >
                        Add Document
                      </button>
                    </div>
                  ) : (
                    <div className="boxes text-center">
                      <a
                        style={{ textDecoration: 'none', color: 'white' }}
                        href={group.group.documentation}
                        target="_blank"
                      >
                        View Uploaded Document
                      </a>
                    </div>
                  )}
                </div>
              )}

              {currentTaskType === '' && (
                <h1 className="text-center my-5">No Task Assigned Yet</h1>
              )}
            </>
          ) : (
            <h1 className="text-center my-5" style={{ position: "absolute", transform: "translate(-50%,-50%", left: "50%", top: "50%" }}>You're not enrolled in any group yet</h1>
          )}
        </div>
      ) : (
        <Loading />
      )}
      <NotificationContainer />
    </div>
  );
};

export default Tasks;