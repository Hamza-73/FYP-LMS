import React, { useEffect, useState } from 'react'
import '../../css/task.css'
import axios from 'axios';
import Loading from '../Loading';import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

const Tasks = (props) => {
  const [file, setFile] = useState();
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


  const upload = async () => {
    try {
      if (!file) {
        console.log('No file selected.');
        return;
      }

      const formData = new FormData();
      formData.append('type', 'proposal'); // Add the 'type' field to the FormData object
      formData.append('proposal', file); // Make sure to match the field name with your backend route

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
        NotificationManager.success('file Uploaded Sucessfully');
      }
    } catch (error) {
      console.log('error in uploading file', error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    console.log('file is ', file);
  }

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

  return (
    <div>

      {!loading ? <div className="container">
        {group.group ? <>
          <div className="upper">
            <h1>Task Submission</h1>
            <h4>Instructions:</h4>
            <h6>Project Proposal</h6>
            <h6>Submit PDF Only, max size should be 3MB</h6>
          </div>
          <div className="last">
            <div className="boxes d-flex justify-content-evenly">
              <div>Submission Status</div>
              <div>{group.group.proposal? "Submitted" : "Pending" }</div>
            </div>
            <div className="boxes d-flex justify-content-evenly">
              <div>Due Date</div>
              <div>{group.group.propDate?group.group.propDate:'TBA' }</div>
            </div>
            <div className="boxes d-flex justify-content-evenly">
              <div>Grading Status</div>
              <div>{group.group.marks? "Graded":"Not Graded"}</div>
            </div>
            <div className="boxes d-flex justify-content-evenly">
              <div>Time Remaining</div>
              <div>{!(Date(group.group.propDate) && isNaN(group.group.propDate))? new Date()- Date(group.group.propDate): '-----' }</div>
            </div>
            <div className="boxes d-flex justify-content-evenly">
              {!group.group.proposal? <>
              <input type="file" onChange={(e) => { handleFileChange(e) }} name='proposal' />
              <button className='btn' type='button' style={{ color: "white", fontWeight: "600" }} onClick={upload}>Add Proposal</button>
              </>: <> <a style={{textDecoration:"none", color:"white"}} href={group.group.proposal} target='_blank'>View Uploaded Proposal</a> </>
              }
            </div>

          </div>
        </>:<h1 className='text-center my-5'>You're Not Currently Enrolled In Any Group</h1>}
      </div> : <Loading />}
        <NotificationContainer />
    </div>
  )
}

export default Tasks;