import React, { useEffect, useState } from 'react'
import SideBar from '../SideBar'
import '../../css/group.css'
import Loading from '../Loading';

const MyGroup = (props) => {
  const [group, setGroupDetails] = useState({
    success: false,
    group: {
      myDetail: [{ name: "", rollNo: "", myId: "" }],

      groupId: "", supervisor: "", supervisorId: "",
      projectTitle: "", projectId: "",
      groupMember: [{ userId: "", name: "", rollNo: "", _id: "" }],
      proposal: false, documentation: false, docDate: "----",
      propDate: "----", viva: "-----"
    }
  });
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('');
  const [file,setFile]= useState();


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
      }, 1000)
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
      formData.append('type', type.trim()); // Add the 'type' field to the FormData object
      formData.append(type.trim(), file); // Make sure to match the field name with your backend route
  
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
        alert('file uploaded successfully');
      }
      setType('');
      setFile();
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
                <form onSubmit={(e) => upload(e, type)}>
                  <div className="mb-3">
                    <label htmlFor="exampleInputEmail163" className="form-label">Type of Document (Documentation/Final Submission)</label>
                    <small>For documentation : documentation</small>
                    <small>For Final Submission : final</small>
                    <input type="text" className="form-control" id="username" name='username' value={type} onChange={(e)=>setType(e.target.value)} />
                    <input type="file" onChange={(e) => { handleFileChange(e) }} />
                  </div>
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
              <div className="review-box">
                <div>
                  <h6>Review</h6>
                  <div class="form-floating">
                    <textarea class="form-control" cols="50" placeholder="" id="floatingTextarea"></textarea>
                  </div>
                </div>
                <div>
                 {group.group.documentation?  <a target='_blank' href={group.group.documentation} style={{textDecoration:"none"}}>View Uploaded Documentation</a>: "Upload Documentation To See"}
                </div>
              </div><div className="review-box">
                <div>
                  <h6>Review</h6>
                  <div class="form-floating">
                    <textarea class="form-control" cols="50" placeholder="" id="floatingTextarea"></textarea>
                  </div>
                </div>
                <div>
                {group.group.finalSubmission?  <a target='_blank' href={group.group.finalSubmission} style={{textDecoration:"none"}}>View Uploaded Final Submission</a>: "Upload Final Submission To See"}
                </div>
              </div>
            </div>
            <div className="upload-btn">
              <button className="btn btn-danger"  data-bs-toggle="modal" data-bs-target="#exampleModal" disabled={group.group.finalSubmission && group.group.documentation}>Upload Document</button>
            </div>
          </> : <h1 className='text-center my-4'>You're currently not enrolled in any Group.</h1>
        }
      </div> : <Loading />
      }
    </div>
  )
}

export default MyGroup