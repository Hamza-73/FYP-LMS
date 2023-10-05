import React, { useEffect, useState } from 'react'
import Loading from './Loading';
import '../css/meeting.css'

const Meeting = (props) => {
  const myStyle = {
    backgroundColor: "lightgrey",
    border: "2px solid lightgrey",
    borderRadius: "4px",
    textAlign: "center"
  };

  const [meeting, setMeeting] = useState({
    meetingGroup: "", meetingLink: "",
    purpose: "", meetingTime: "",
    meetingDate: "", meetingType: ""
  });

  const [edit, setEdit] = useState({
    meetingGroup: "", meetingLink: "",
    purpose: "", meetingTime: "",
    meetingDate: "", meetingType: ""
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
      // Check if required fields are present
      if (!meeting.meetingGroup || !meeting.purpose) {
        alert("Error: Meeting date, time, project title, and purpose are required.");
        return;
      }
      console.log('meeting is ', meeting)
      console.log('Meeting is scheduling');
      const response = await fetch(`http://localhost:5000/meeting/meeting`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem('token')
        },
        body: JSON.stringify({
          projectTitle: meeting.meetingGroup,
          meetingLink: meeting.meetingLink,
          purpose: meeting.purpose,
          time: meeting.meetingTime,
          date: meeting.meetingDate,
          type: meeting.meetingType
        })
      });

      console.log('Response status:', response.status);
      const json = await response.json();
      console.log('JSON meeting is ', json);

      if (json) {
        // Clear the form fields
        setMeeting({
          meetingGroup: "",
          meetingLink: "",
          purpose: "",
          meetingTime: "",
          meetingDate: "",
          meetingType: ""
        });

        // Map properties from API response to the expected state structure
        const mappedMeeting = {
          meetingGroup: json.meeting.projectTitle,
          meetingLink: json.meeting.meetingLink,
          purpose: json.meeting.purpose,
          meetingTime: json.meeting.time,
          meetingDate: json.meeting.date,
          meetingType: json.meeting.type
        };

        // Update the state with the newly scheduled meeting
        setData((prevData) => ({
          ...prevData,
          meeting: [...prevData.meeting, mappedMeeting]
        }));
        alert("Success: " + json.message);
      } else {
        alert("Error: " + json.message, 'danger');
      }
    } catch (error) {
      console.log('Error dealing with requests', error);
    }
  };


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
          projectTitle: edit.meetingGroup, meetingLink: edit.meetingLink,
          time: edit.meetingTime, date: edit.meetingDate, type: edit.meetingType
        })
      });
      console.log('fetch ends');
      console.log('Response status:', response.status);
      const json = await response.json();
      console.log('json meeting editing is  ', json);

      if (json.success) {
        alert(`Meeting Edited Successfully`);
        // Update the state with the edited meeting
        setData((prevData) => ({
          ...prevData,
          meeting: prevData.meeting.map((item) => {
            if (item.meetingId === meetingId) {
              return {
                ...item,
                meetingGroup: edit.meetingGroup,
                meetingLink: edit.meetingLink,
                meetingTime: edit.meetingTime,
                meetingDate: edit.meetingDate,
                meetingType: edit.meetingType
              };
            }
            return item;
          })
        }));
        setEdit({
          meetingGroup: "", meetingLink: "",
          purpose: "", meetingTime: "",
          meetingDate: "", meetingType: ""
        })
      }else{
        alert(json.message)
      }
    } catch (error) {
      console.log('error dealing with requests', error);
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

  const deleteMeeting = async (id) => {
    try {
      console.log('meeting id is ', id);
      const confirmed = window.confirm('Are You Sure You Want To Cancel');
      if (!confirmed) {
        return;
      } else {
        const response = await fetch(`http://localhost:5000/meeting/delete-meeting/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": localStorage.getItem('token')
          }
        });
        const json = await response.json();
        if (json.success) {
          // Remove the canceled meeting from the state
          setData((prevData) => ({
            ...prevData,
            meeting: prevData.meeting.filter((meeting) => meeting.meetingId !== id)
          }));
          alert(json.message);
        }
      }
    } catch (error) {
      console.log('error in deleting meeting', error);
    }
  };


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
  const [review, setReview] = useState(false);

  const giveReview = async (e) => {
    try {
      e.preventDefault();
      console.log('review is ', review);
      const response = await fetch(`http://localhost:5000/meeting/meeting-review/${meetingId}/${review}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem('token')
        },
        body: JSON.stringify({ review: review })
      });
      const json = await response.json();
      console.log('json is in giving meeting', json);
      if (json) {
        alert(json.message)
      }
      if (json.success) {
        setData((prevData) => ({
          ...prevData,
          meeting: prevData.meeting.filter((meeting) => meeting.meetingId !== meetingId)
        }));
      }
    } catch (error) {

    }
  }

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

  function showDiv(divId, element) {
    document.getElementById(divId).style.display =
      element.value == 1 ? "block" : "none";
  }

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
                    <input type="text" className="form-control" id="name" name='meetingGroup' value={edit.meetingGroup} onChange={handleEditChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="time" className="form-label">Time</label>
                    <input type="time" className="form-control" id="time" name='meetingTime' value={edit.meetingTime} onChange={handleEditChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="date" className="form-label">Date</label>
                    <input type="date" className="form-control" id="meetingDate" name='meetingDate' value={edit.meetingDate} onChange={handleEditChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="type" className="form-label">Type</label>
                    <div className="select">
                      <input
                        type="radio"
                        name="meetingType"
                        value="In Person"
                        checked={edit.meetingType === 'In Person'}
                        onChange={handleEditChange}
                      />
                      <label htmlFor="inperson" className="mx-2">
                        In Person
                      </label>
                    </div>
                    <div className="select">
                      <input
                        type="radio"
                        name="meetingType"
                        value="Online"
                        checked={edit.meetingType === 'Online'}
                        onChange={handleEditChange}
                      />
                      <label htmlFor="online" className="mx-2">
                        Online
                      </label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="meetingLink" className="form-label">Link</label>
                    <input type="text" className="form-control" name='meetingLink' value={edit.meetingLink} disabled={edit.meetingType === 'In Person'} onChange={handleEditChange} />
                    {!isLinkValid && <div className="text-danger">Please enter a valid link.</div>}
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>

                    <button type="submit" className="btn btn-success" disabled={!(edit.meetingGroup)
                      || !(edit.meetingTime)
                    }>
                      Edit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="review"  >
        <div className="modal fade" id="exampleModal1" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel1" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" >Give Review</h5>
              </div>
              <div className="modal-body">
                <form onSubmit={giveReview}>
                  <div className="mb-3">
                    <label>
                      <input
                        type="radio"
                        name="reviewOption"
                        value="true"
                        onChange={() => setReview(true)}
                      />
                      Successful
                    </label>
                    <br />
                    <label>
                      <input
                        type="radio"
                        name="reviewOption"
                        value="false"
                        onChange={() => setReview(false)}
                      />
                      Not Successful
                    </label>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-dismiss="modal"
                      onClick={() => setReview(null)}
                    >
                      Close
                    </button>
                    <button type="submit" className="btn btn-success" disabled={review === null}>
                      Give Reviews
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
                <input type='text' name="meetingGroup" value={meeting.meetingGroup} id="" placeholder='Project title' onChange={handleInputChange} className='my-3' style={myStyle}></input>
              </div>

              <h6>Select a meeting type</h6>

              <h4>Select a meeting type</h4>{" "}
              <select
                id="test"
                name="form-select"
                onChange={(e) => showDiv("link", e.target)}
              >
                <option id="test">None</option>
                <option
                  id="test"
                  value="0"
                  checked={meeting.type === "In Person"}
                  onChange={handleInputChange}
                >
                  In Person
                </option>
                <option id="test" value="1" checked={meeting.type === "Online"} onChange={handleInputChange}>
                  Online
                </option>
              </select>{" "}
              <br />
              <br />
              <div className="link" id="link">
                <h4>
                  <i class="fas fa-video" style={{ fontSize: "24px" }}></i>
                  &ensp;Using
                </h4>
                <select id="test" name="form-select">
                  <option value="0" checked={meeting.type === "Google Meet"}>
                    Google Meet
                  </option>
                  <option value="1" checked={meeting.type === "Microsoft Teams"}>
                    Microsoft Teams
                  </option>
                  <option value="2" checked={meeting.type === "Zoom"}>
                    Zoom
                  </option>
                </select>{" "}
                <br />
                <textarea
                  name="meetingLink"
                  class="purpose"
                  placeholder="Enter the link of the meeting"
                  disabled={meeting.type === "In Person"}
                  onChange={handleInputChange}
                  value={meeting.meetingLink}
                ></textarea>
              </div>

              <div style={{ marginTop: "20px" }}>
                <h6 for="appt">Choose a time and date for your meeting:</h6>{" "}
                <input
                  class="purpose1"
                  type="time"
                  id="appt"
                  name="meetingTime"
                  min="08:00"
                  max="18:00"
                  value={meeting.meetingTime}
                  onChange={handleInputChange}
                  required
                />{" "}
                <br />
                <input
                  type="date"
                  class="purpose1"
                  for="appt"
                  placeholder="Meeting Date"
                  onChange={handleInputChange}
                  name="meetingDate"
                  value={meeting.meetingDate}
                />
              </div>{" "}
              <br />
              <div className="link" id="link">
                <h1>Link</h1>
                <textarea name="meetingLink" id="" disabled={meeting.meetingType === 'In Person'} cols="35" rows="2" onChange={handleInputChange} value={meeting.meetingLink} style={myStyle}></textarea>
              </div>
              {!isLinkValid && <div className="text-danger">Please enter a valid link.</div>}

              <button className="btn btn-danger" style={{ background: "maroon" }} onClick={scheduleMeeting} >Schedule Metting</button>

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
                            <h6>{meeting.meetingGroup}</h6>
                          </div>
                          <div className="item">
                            <h5>Time</h5>
                            <h6>{meeting.meetingTime}</h6>
                          </div>
                          <div className="item">
                            <h5>Date</h5>
                            <h6>
                              {meeting && meeting.meetingDate
                                ? new Date(meeting.meetingDate).toLocaleDateString(
                                  'en-US'
                                )
                                : '----'}
                            </h6>
                          </div>
                          {meeting && meeting.meetingLink && (
                            <div className="item meeting-link">
                              <h5>Link</h5>
                              <a
                                href={
                                  meeting.meetingLink.startsWith('http')
                                    ? meeting.meetingLink
                                    : `http://${meeting.meetingLink}`
                                }
                                target="_blank"
                              >
                                Link
                              </a>
                            </div>
                          )}
                          <div className='d-grid gap-2 d-md-flex justify-content-md-end'>
                            {(new Date(meeting.meetingDate) > new Date()) && <button
                              className="btn btn-danger btn-sm"
                              data-toggle="modal"
                              data-target="#exampleModal"
                              onClick={() => {
                                setMeetingId(meeting.meetingId);
                                setEdit({
                                  meetingGroup: meeting.meetingGroup || '', // Ensure it's defined or set to an empty string
                                  meetingLink: meeting.meetingLink,
                                  meetingTime: meeting.meetingTime || '', // Ensure it's defined or set to an empty string
                                  meetingDate: meeting.meetingDate,
                                });
                              }}
                            >
                              Edit
                            </button>}
                            {
                              new Date(meeting.meetingDate) > new Date() ? (
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => {
                                    setMeetingId(meeting.meetingId);
                                    deleteMeeting(meeting.meetingId);
                                  }}
                                >
                                  Cancel
                                </button>
                              ) : (
                                <button
                                  className="btn btn-danger btn-sm"
                                  data-toggle="modal"
                                  data-target="#exampleModal1"
                                  onClick={() => {
                                    setMeetingId(meeting.meetingId);
                                  }}
                                >
                                  Review
                                </button>
                              )
                            }
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
