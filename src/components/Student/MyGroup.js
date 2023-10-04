import React, { useEffect, useState } from 'react'
import '../../css/group.css'
import Loading from '../Loading';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

const MyGroup = (props) => {
  const [group, setGroupDetails] = useState({
    success: false,
    group: {
      myDetail: [{ name: "", rollNo: "", myId: "" }],
      groupId: "", supervisor: "", supervisorId: "",
      projectTitle: "", projectId: "",
      groupMember: [{ userId: "", name: "", rollNo: "", _id: "" }],
      proposal: false, documentation: false, docDate: "----",
      propDate: "", viva: ""
    }
  });
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('');
  const [file, setFile] = useState();


  useEffect(() => {

    const groupDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Authorization token not found', 'danger');
          return;
        }
        console.log('before fetch')
        const response = await fetch("http://localhost:5000/student/my-group", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            "Authorization": token
          }
        });
        console.log('after fetch')
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const json = await response.json();
        if (!json) {
          console.log('group response is ', response);
        } else {
          console.log('json is ', json);
          setGroupDetails(json);
        }
      } catch (error) {
        console.log('error fetching group ', error)
      }
    }
    if (localStorage.getItem('token')) {
      setLoading(true)
      setTimeout(() => {
        groupDetail();
        setLoading(false)
        console.log('details is in grpouyp ', group.group)
      }, 1300)
    }
  }, [])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    // Check if a file is selected
    if (selectedFile) {
      // Check file type
      const allowedTypes = ['application/pdf']; // Only allow PDF files
      if (allowedTypes.includes(selectedFile.type)) {
        // Check file size (in bytes)
        const maxSize = 3 * 1024 * 1024; // 3MB
        if (selectedFile.size <= maxSize) {
          setFile(selectedFile);
        } else {
          // File size exceeds the limit
          NotificationManager.error('File size must be less than 3MB.');
          e.target.value = null; // Clear the file input
        }
      } else {
        // Invalid file type
        NotificationManager.error('Invalid file format. Please select a PDF file.');
        e.target.value = null; // Clear the file input
      }
    }
  }

  const upload = async (e, type) => {
    e.preventDefault();
    try {
      if (!file) {
        console.log('No file selected.');
        return;
      }
      const formData = new FormData();
      formData.append('doc', file); // Make sure to match the field name with your backend route

      console.log('form data is ', formData);

      const response = await fetch('http://localhost:5000/student/doc', {
        method: 'POST',
        headers: {
          Authorization: localStorage.getItem('token'),
        },
        body: formData, // Set the FormData object as the body
      });
      const json = await response.json();
      console.log('response in uploading proposal is', json);
      if (!json.success) {
        console.log('json is ');
        NotificationManager.error(json.message);
      }
      if (json.success) {
        NotificationManager.success('File Uploaded successfully');
        // Update the state with the uploaded file URL
        const newDocument = {
          docLink: json.url, // Document URL
          review: '', // Empty review
        };

        setGroupDetails((prevGroup) => ({
          ...prevGroup,
          group: {
            ...prevGroup.group,
            docs: [...(prevGroup.group.docs || []), newDocument],
          },
        }));
        setType('');
        setFile();
      }
    } catch (error) {
      console.log('error in uploading file', error);
    }
  };

  const requestMeeting = async () => {
    try {
      const response = await fetch(`http://localhost:5000/student/request-meeting`, {
        method: "POST",
        headers: {
          "Authorization": localStorage.getItem('token')
        }
      });
      const json = await response.json();
      console.log('json in requesting meeting is ', json);
      alert(json.message);
    } catch (error) {
      console.log('error in requesting meeting', error);
    }
  }

  const meetingStyle = `
  .meeting-box {
    background-color: #ffffff;
    border: 1px solid #d1d1d1;
    border-radius: 6px;
    width: 200px;
    height: 100px;
    padding: 16px;
    margin: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .meeting-row {
    text-align: center;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
  .item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .meeting-box a {
    text-decoration: none;
    color: #007bff;
  }
`;

  const myStyle = `
.meeting-box {
  background-color: #ffffff;
  border: 1px solid #d1d1d1;
  border-radius: 6px;
  width: 200px;
  height: 100px;
  padding: 16px;
  margin: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.items {
  display: flex;
  justify-content: space-between;
}
.meeting-box a {
  text-decoration: none;
  color: #007bff;
}
`


  const [review, setReview] = useState('');

  return (
    <div>
      <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">Your Request</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <>
                <form onSubmit={upload}>
                  <input type="file" onChange={(e) => { handleFileChange(e) }} />
                  <div className="modal-footer">
                    <button type="submit" className="btn" style={{ background: "maroon", color: "white" }}>
                      Submit
                    </button>
                  </div>
                </form>
              </>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="exampleModal1" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">Review</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <>
                <form>
                  <textarea className='form-control' value={review ? review : "No Reviews Yet"} />
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" aria-label="Close" onClick={() => setReview('')}> Close</button>
                  </div>
                </form>
              </>
            </div>
          </div>
        </div>
      </div>

      {!loading ? <div className={`${group.group ? 'container' : ""}`}>
        {
          group.group ? <>
            {(group.group.meetingDate && new Date(group.group.meetingDate) > new Date()) && <div>
              <div className="notify" style={{ position: "absolute", right: "40px" }}>
                <style>{myStyle}</style>
                <div>
                  <div>
                    <div>
                      <div className="meeting-box" style={{ width: "200px", height: "180px" }}>
                        <div className="contaner">
                          <h4 className='text-center'>Meeting</h4>
                          <div className="items">
                            <h5>Time</h5>
                            <h6>{group.group.meetingTime ? group.group.meetingTime : "==="}</h6>
                          </div>
                          <div className="items">
                            <h5>Date</h5>
                            <h6>
                              {group.group.meetingDate
                                ? new Date(group.group.meetingDate).toLocaleDateString(
                                  'en-US'
                                )
                                : '----'}
                            </h6>
                          </div>
                          {group.group.meetingLink && (
                            <div className="items">
                              <h5>Link</h5>
                              <a
                                href={
                                  group.group.meetingLink.startsWith('http')
                                    ? group.group.meetingLink
                                    : `http://${group.group.meetingLink}`
                                }
                                target="_blank"
                              >
                                Link
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>}


            <div className="upperpart">
              <div className="proj-detail d-flex justify-content-between">
                <h4>Project Title</h4>
                <h5>{group.group.projectTitle}</h5>
              </div>
              <div className="proj-detail d-flex justify-content-between">
                <h4>Supervisor</h4>
                <h5>{group.group.supervisor}</h5>
              </div>
            </div>

            <div className="mid">
              <h5>{group.group.supervisor}</h5>
              <h5>{group.group.groupMember.length > 0 ? group.group.groupMember[0].name : "No Group Member Yet"} <br /> {group.group.groupMember[0]?.rollNo}
              </h5>
              <h5>{group.group.myDetail[0].name} <br /> {group.group.myDetail[0].rollNo}</h5>
            </div>

            <div className="last">
              <div className="meeting-row">
                {group.group &&
                  group.group.docs &&
                  group.group.docs.length > 0 &&
                  group.group.docs.map((grp, grpKey) => {
                    return (
                      <div className="meeting-box" key={grpKey + 1}>
                        <style>{meetingStyle}</style>
                        <div className="item">
                          <a target="_blank" href={grp.docLink}>
                            View Uploaded Doc
                          </a>
                          <button className="btn btn-danger btn-sm" data-bs-toggle="modal" data-bs-target="#exampleModal1" onClick={() => setReview(grp.review)}>Review</button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="d-flex justify-content-between">
              <button className="btn btn-danger" onClick={requestMeeting}>Request Meeting</button>
              <button className="btn btn-danger" data-bs-toggle="modal" data-bs-target="#exampleModal" disabled={group.group.finalSubmission && group.group.documentation}>Upload Document</button>
            </div>
          </> : <h1 className='text-center my-4'>You're currently not enrolled in any Group.</h1>
        }
      </div> : <Loading />
      }

      <NotificationContainer />
    </div>
  )
}

export default MyGroup