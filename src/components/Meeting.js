import React, { useEffect, useState } from 'react'
import Loading from './Loading';

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

  const [edit, setEdit] = useState({
    projectTitle: "", meetingLink: "", purpose: "",
    time: "", date: "", type: ""
  });
  const [isLinkValid, setIsLinkValid] = useState(true);
  const [meetingId, setMeetingId] = useState('');
  const [data, setData] = useState({ meeting: [] });

  const getMeeting = async () => {

    try {
      const response = await fetch(`http://localhost:5000/meeting/get-meeting`, {
        method: "GET",
        headers: {
          "Authorization": localStorage.getItem('token')
        },
      });
      const json = await response.json();
      console.log('json meeting is in get ', json);

      setData(json)
    } catch (error) {

    }
  }
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
        alert(`${json.message}`, 'success');
      } else {
        alert(`${json.message}`, 'danger');
      }
    } catch (error) {
      console.log('error dealing with requests', error);
      alert(`Some error occured try to reload the page/ try again`, 'danger');
    }
  }


  const editMeeting = async (e) => {
    try {
      e.preventDefault();
      console.log('meeting starts')
      const response = await fetch(`http://localhost:5000/meeting/edit-meeting/${meetingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem('token')
        },
        body: JSON.stringify({
          projectTitle: edit.projectTitle, meetingLink: edit.meetingLink, 
          time: edit.time, date: edit.date, type: edit.date
        })
      });
      console.log('fetch ends');
      console.log('Response status:', response.status);
      const json = await response.json();
      console.log('json meeting is ', json);

      if (json.success) {
        alert(`Meeting Edied Successfully`);
        data.meeting.map((item) => {
            if (item.meetingId === meetingId) {
              return {
                ...item,
                meetingGroup: edit.projectTitle,
                meetingLink: edit.meetingLink,
                time: edit.time,
                date: edit.date,
                type: edit.type
              };
            }
            return item;
          });
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

  const deleteMeeting = async ()=>{
    try {
      console.log('meeting id is ', meetingId)
      const confirmed = window.confirm('Are You Sure You Want To Cancel');
      if(!confirmed){
        return;
      }
      else{
        const response = await fetch(`http://localhost:5000/meeting/delete-meeting/${meetingId}`,{
          method:"DELETE",
          headers:{
            "Authorization" : localStorage.getItem('token')
          }});
          const json = await response.json();
          if(json.success){
            alert(json.message)
          }
      }
    } catch (error) {
      console.log('error in deleting meetin', error)
    }
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target;
  
    if (name === 'meetingLink') {
      // Use a regular expression to check if the input value is a valid link
      const linkRegex = /^(http(s)?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ;,./?%&=]*)?$/;
      const isValid = linkRegex.test(value);
      setIsLinkValid(isValid);
    }
  
    setEdit({ ...edit, [name]: value }); // Update the 'edit' state here
  };
  

  const [userData, setUserData] = useState({ member: [] });
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
        getMeeting()
      }, 700);
    }
  }, []);

  const meetingStyle = `
  .meeting-box {
    background-color: #f0f0f0;
    border: 2px solid #f0f0f0;
    border-radius: 4px;
    width : 200px;
    padding : 8px;
    margin: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .meeting-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin: -10px; /* Counteract margin on individual boxes */
  }
  .item{
    display : flex;
    justify-content: space-between;
  }
  `;
  return (
    <>
      <div className="meeting"  >
        <div className="modal fade" id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" >Register</h5>
              </div>
              <div className="modal-body">
                <form onSubmit={editMeeting}>

                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Project Title</label>
                    <input type="text" className="form-control" id="name" name='projectTitle' value={edit.projectTitle} onChange={handleEditChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="time" className="form-label">Time</label>
                    <input type="time" className="form-control" id="time" name='time' value={edit.time} onChange={handleEditChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="date" className="form-label">Date</label>
                    <input type="date" className="form-control" id="date" name='date' value={edit.date} onChange={handleEditChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="type" className="form-label">Type</label>
                    <div className="select">
                      <input
                        type="radio"
                        name="type"
                        value="In Person"
                        checked={edit.type === 'In Person'}
                        onChange={handleEditChange}
                      />
                      <label htmlFor="inperson" className="mx-2">
                        In Person
                      </label>
                    </div>
                    <div className="select">
                      <input
                        type="radio"
                        name="type"
                        value="Online"
                        checked={edit.type === 'Online'}
                        onChange={handleEditChange}
                      />
                      <label htmlFor="online" className="mx-2">
                        Online
                      </label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="meetingLink" className="form-label">Link</label>
                    <input type="text" className="form-control" name='meetingLink' value={edit.meetingLink} disabled={edit.type==='In Person'} onChange={handleEditChange} />
                    {!isLinkValid && <div className="text-danger">Please enter a valid link.</div>}
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>

                    <button type="submit" className="btn btn-success" disabled={!(edit.projectTitle)
                      || !(edit.time) 
                    }>
                      Register
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!loading ?
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

                <input type="time" placeholder='Meeting Time' onChange={handleInputChange} name='time' value={meeting.time} />
                <input type="date" placeholder='Meeting Date' onChange={handleInputChange} name='date' value={meeting.date} />
              </div>

              <div className="link">
                <h1>Link</h1>
                <textarea name="meetingLink" id="" disabled={meeting.type === 'In Person'} cols="35" rows="2" onChange={handleInputChange} value={meeting.meetingLink} style={myStyle}></textarea>
              </div>
              {!isLinkValid && <div className="text-danger">Please enter a valid link.</div>}

              <button className="btn btn-danger" style={{ background: "maroon" }} onClick={scheduleMeeting}>Schedule Metting</button>

            </div>

            <div className="meeting-schedule">
              <style>{meetingStyle}</style>
              <h3 className="text-center">Scheduled Meetings</h3>
              <div className="my-3">
                <div className="meeting-row">
                  {data.meeting.length > 0 ? (
                    data.meeting.map((meeting, index) => (
                      <div className="meeting-box" key={index}>
                        <div className="contaner">
                          {/* Meeting details */}
                          <div className="item">
                            <h5>Group</h5>
                            <h6>{meeting.meetingGroup ? meeting.meetingGroup : '=='}</h6>
                          </div>
                          <div className="item">
                            <h5>Time</h5>
                            <h6>{meeting.meetingTime}</h6>
                          </div>
                          <div className="item">
                            <h5>Date</h5>
                            <h6>
                              {meeting.meetingDate
                                ? new Date(meeting.meetingDate).toLocaleDateString(
                                  'en-US'
                                )
                                : ''}
                            </h6>
                          </div>
                          {meeting.meetingLink && (
                            <div className="item meeting-link">
                              <h5>Link</h5>
                              <a
                                href={ meeting.meetingLink.startsWith('http') ? meeting.meetingLink : `http://${meeting.meetingLink}`}
                                target="_blank"
                              >
                                {meeting.meetingLink}
                              </a>
                            </div>
                          )}
                          <div className='d-grid gap-2 d-md-flex justify-content-md-end'>
                            <buttn className="btn btn-danger btn-sm" data-toggle="modal" data-target="#exampleModal" onClick={() =>{ 
                              setMeetingId(meeting.meetingId);
                              setEdit({projectTitle: meeting.meetingGroup, meetingLink: meeting.meetingLink, 
                                time: meeting.meetingTime, date: meeting.meetingDate,})
                              }}>Edit</buttn>
                            <buttn className="btn btn-danger btn-sm" onClick={()=>{
                              setMeetingId(meeting.meetingId);
                              deleteMeeting();
                            }}>Cancel</buttn>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <h4 className="text-center my-5">You have no meetings scheduled</h4>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div> : <Loading />
      }</>
  )
}

export default Meeting
