import React, { useState } from 'react'
import SideBar from '../SideBar'
import '../../css/task.css'
import axios from 'axios';

const Tasks = (props) => {
  const [file,setFile] = useState();
  const upload = ()=>{
    const formData = new FormData();
    formData.append('file', file);
    axios.put('http://localhost:5000/upload', formData).then(
      res =>{}
    ).catch(er=>console.log('error is ', er))
  }
  return (
    <div>
      <SideBar title1='Dashboard' link1='dashboard' title2='Project Progress'
        link2='progress' title3='Tasks' link3='tasks' title4='My Group' link4='group'
        title5='Meeting' link5='meeting' detailLink = 'student'
      />
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
            <input type="file" onChange={(e)=>{setFile(e.target.files[0])}} />
            <div className='btn' type='button' onClick={upload}>Add Submission</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tasks
