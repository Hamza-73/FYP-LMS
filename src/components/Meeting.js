import React, { useEffect, useState } from 'react'
import SideBar from './SideBar';

const Meeting = (props) => {
  const myStyle = {
    backgroundColor: "lightgrey",
    border: "2px solid lightgrey",
    borderRadius: "4px",
    textAlign: "center"
  };

  const [meeting, setMeeting] = useState({
    projectTitle: "", meetingLink: "", purpose: "",
    time: "", date: "", type: ""
  });
  const [isLinkValid, setIsLinkValid] = useState(true);

  const scheduleMeeting = async () => {
    try {
      const response = await fetch(`http://localhost:5000/meeting/meeting`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem('token')
        },
        body: JSON.stringify({
          projectTitle: meeting.projectTitle, meetingLink: meeting.meetingLink, purpose: meeting.purpose,
          time: meeting.time, date: meeting.date, type: meeting.date
        })
      });
      console.log('Response status:', response.status);
      const json = await response.json();
      console.log('json meeting is ', json);

      if (json.message && json.success) {
        alert(`Request ${json.message}`, 'success');
      } else {
        alert(`Request ${json.message}`, 'danger');
      }
    } catch (error) {
      console.log('error dealing with requests', error);
      alert(`Some error occured try to reload the page/ try again`, 'danger');
    }
  }


  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'meetingLink') {
      // Use a regular expression to check if the input value is a valid link
      const linkRegex = /^(http(s)?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ;,./?%&=]*)?$/;
      const isValid = linkRegex.test(value);
      setIsLinkValid(isValid);
    }

    setMeeting({ ...meeting, [name]: value });
  };

  const[userData, setUserData] = useState({ member: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('Token not found');
          return;
        }

        const response = await fetch(`http://localhost:5000/supervisor/detail`, {
          method: 'GET',
          headers: {
            'Authorization': token,
          },
        });

        if (!response.ok) {
          console.log('Error fetching detail', response);
          return;
        }

        const json = await response.json();
        if (json) {
          console.log('User data is: ', json);
          setUserData(json);
          setLoading(false);
        }
      } catch (err) {
        console.log('Error in sidebar: ', err);
      }
    };

    if (localStorage.getItem('token')) {
      setTimeout(() => {
        getDetail();
      }, 700);
    }
  }, []);


  return (
    <div>
      <div className="container d-flex" style={{ height: "500px" }}>
        <div>
          <h1>Link Information</h1>
          <div>
            <textarea name="purpose" value={meeting.purpose} id="" placeholder='Purpose of Meeting' cols="30" rows="2" onChange={handleInputChange} style={myStyle}></textarea> <br />
            <input type='text' name="projectTitle" value={meeting.projectTitle} id="" placeholder='Project title' onChange={handleInputChange} className='my-3' style={myStyle}></input>
          </div>

          <h6>Select a meeting type</h6>

          <div className="d-flex">
            <div className="select">
              <input
                type="radio"
                name="type"
                value="In Person"
                checked={meeting.type === 'In Person'}
                onChange={handleInputChange}
              />
              <label htmlFor="inperson" className="mx-2">
                In Person
              </label>
            </div>
            <div className="select mx-4">
              <input
                type="radio"
                name="type"
                value="Online"
                checked={meeting.type === 'Online'}
                onChange={handleInputChange}
              />
              <label htmlFor="online" className="mx-2">
                Online
              </label>
            </div>
          </div>

          <div className="source d-flex" style={{ marginTop: "20px" }}>

            <input type="text" placeholder='Meeting Time' onChange={handleInputChange} name='time' value={meeting.time} />
            <input type="date" placeholder='Meeting Date' onChange={handleInputChange} name='date' value={meeting.date} />
          </div>

          <div className="link">
            <h1>Link</h1>
            <textarea name="meetingLink" id="" disabled={meeting.type === 'In Person'} cols="35" rows="2" onChange={handleInputChange} value={meeting.meetingLink} style={myStyle}></textarea>
          </div>
          {!isLinkValid && <div className="text-danger">Please enter a valid link.</div>}

          <button className="btn btn-danger" style={{ background: "maroon" }} onClick={scheduleMeeting}>Schedule Metting</button>

        </div>

        <div className='meeting-schedule' >
          <h3 className='text-center'>Scheduled Meeting</h3>
          <>
          <div className='my-3 mx-5'>
            {userData.member.meetingTime ? (
              <div className='mx-4 my-5'>
                <div className='containar'>
                  <div className='item'>
                    <h4>Group</h4>
                    <h6>{userData.member.meetingGorup? userData.member.meetingGorup : "=="}</h6>
                  </div>
                  <div className='item'>
                    <h4>Time</h4>
                    <h6>{userData.member.meetingTime}</h6>
                  </div>
                  <div className='item'>
                    <h4>Date</h4>
                    <h6>{userData.member.meetingDate ? new Date(userData.member.meetingDate).toLocaleDateString('en-US') : ''}</h6>
                  </div>
                  {userData.member.meetingLink ? <div className='item meeting-link'>
                    <h4>Link</h4>
                    <a href={userData.member.meetingLink} target='_blank' rel='noopener noreferrer'>
                      {userData.member.meetingLink}
                    </a>
                  </div> : ''}
                </div>
              </div>
            ) : (
              <h4 className='text-center my-5'>You have no meeting scheduled</h4>
            )}
          </div>
          </>

        </div>


      </div>
    </div>
  )
}

export default Meeting
