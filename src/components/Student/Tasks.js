import React, { useState } from 'react'
import SideBar from '../SideBar'
import '../../css/task.css'
import axios from 'axios';

const Tasks = (props) => {
  const [file, setFile] = useState();
  const upload = async () => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/student/proposal', {
        method: "POST",
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': localStorage.getItem('token'),
        },
        body: formData,
      });
      if (!response.ok) {
        console.log('upload is ', response);
      }

    } catch (error) {
      console.error('error us', error)
      console.log('error in uploading', error)
    }

  };

  return (
    <div>
      <div className="container">
        <div className="upper">
          <h1>Task Submission</h1>
          <h4>Instructions:</h4>
          <h6>Project Proposal</h6>
          <h6>Submit PDF Only, max size should be 3MB</h6>
        </div>
        <div className="last">
          <div className="boxes d-flex justify-content-evenly">
            <div>Submission Status</div>
            <div>Submitted/Pending</div>
          </div>
          <div className="boxes d-flex justify-content-evenly">
            <div>Due Date</div>
            <div>Thursday 28, November 2023</div>
          </div>
          <div className="boxes d-flex justify-content-evenly">
            <div>Grading Status</div>
            <div>Graded/NotGraded</div>
          </div>
          <div className="boxes d-flex justify-content-evenly">
            <div>Time Remaining</div>
            <div>Task Submitted Late</div>
          </div>
          <div className="boxes d-flex justify-content-evenly">
            <input type="file" onChange={(e) => { setFile(e.target.files[0]); console.log(e.target.files[0]) }} />
            <button className='btn' type='button' style={{color:"white", fontWeight:"600"}} onClick={upload}>Add Submission</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tasks
