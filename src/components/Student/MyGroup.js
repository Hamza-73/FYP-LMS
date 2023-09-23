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
    setFile(selectedFile); // Set the file immediately
    console.log('file is ', selectedFile); // Use the selected file immediately
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
        if (type === 'documentation') {
          setGroupDetails(prevGroup => ({
            ...prevGroup,
            group: {
              ...prevGroup.group,
              documentation: json.url, // Assuming the URL is returned in the response
            },
          }));
        } else if (type === 'final') {
          setGroupDetails(prevGroup => ({
            ...prevGroup,
            group: {
              ...prevGroup.group,
              finalSubmission: json.url, // Assuming the URL is returned in the response
            },
          }));
        }
        setType('');
        setFile();
      }
    } catch (error) {
      console.log('error in uploading file', error);
    }
  };


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
      {!loading ? <div className={`${group.group ? 'container' : ""}`}>
        {
          group.group ? <>
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
              {
                group.group.docs.map((grp, grpKey) => {
                  return (
                    <>
                      <div className="review-box">
                        <div>
                          <h6>Review</h6>
                          <div class="form-floating">
                            <textarea class="form-control" cols="50" placeholder="" id="floatingTextarea" value={grp.review? grp.review: "No Reviews Yet"}></textarea>
                          </div>
                        </div>
                        <div>
                          {grp.docLink ? <a target='_blank' href={grp.docLink } style={{ textDecoration: "none" }}>View Uploaded Doc</a> : "Upload Documentation To See"}
                        </div>
                      </div>
                    </>
                  )
                })
              }
            </div>
            <div className="upload-btn">
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