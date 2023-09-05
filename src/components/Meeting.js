import React, { useState } from 'react'

const Meeting = (props) => {
  const myStyle = {
    backgroundColor: "lightgrey",
    border: "2px solid lightgrey",
    borderRadius: "4px",
    textAlign: "center"
  };

  const [meeting, setMeeting] = useState({
    projectTitle : "", meetingLink:"", purpose:"",
    time: "", date: "", type : ""
  });

  const scheduleMeeting = async () => {
    try {
      const response = await fetch(`http://localhost:5000/meeting/meeting`,{
        method : "POST",
        headers:{
          "Content-Type" : "application/json",
        },
        body : JSON.stringify({
          projectTitle : meeting.projectTitle, meetingLink: meeting.meetingLink, purpose: meeting.purpose,
          time: meeting.time, date: meeting.date, type : meeting.date
        })
      });
      console.log('Response status:', response.status);
      const json = await response.json();
      console.log('json meeting is ', json);

      if (json.message && json.success) {
        props.showAlert(`Request ${json.message}`, 'success');
      } else {
        props.showAlert(`Request ${json.message}`, 'danger');
      }
    } catch (error) {
      console.log('error dealing with requests', error);
      props.showAlert(`Some error occured try to reload the page/ try again`, 'danger');
    }
  }
  

  const handleInputChange = (e)=>{
    setMeeting({...meeting, [e.target.name]: e.target.value})
  }

  return (
    <div>
      <div className="container" style={{ height: "500px" }}>

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
          {/* <h3>Using</h3>
          <select className='mx-5' name="source" id="" style={{ width: "200px", textAlign: "center", fontSize: "23px", backgroundColor: "lightgrey" }}>
            <option value="Google Meet">Google Meet</option>
            <option value="Zoom">Zoom</option>
          </select> */}
          <input type="text" placeholder='Meeting Time' onChange={handleInputChange} name='time' value={meeting.time}/>
          <input type="text" placeholder='Meeting Date' onChange={handleInputChange} name='date' value={meeting.date}/>
        </div>

        <div className="link">
          <h1>Link</h1>
          <textarea name="meetingLink" id="" cols="35" rows="2" onChange={handleInputChange} value={meeting.meetingLink} style={myStyle}></textarea>
        </div>

        <button className="btn btn-danger" style={{ background: "maroon" }} onClick={scheduleMeeting}>Schedule Metting</button>

      </div>
    </div>
  )
}

export default Meeting
