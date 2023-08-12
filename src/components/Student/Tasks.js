import React from 'react'
import SideBar from '../SideBar'
import '../../css/task.css'

const Tasks = (props) => {
  return (
    <div>
      <SideBar title1='Dashboard' link1='dashboard' title2='Project Progress' link2='progress' title3='Tasks' link3='tasks' title4='My Group' link4='group' title5='Meeting' link5='meeting' username={props.username}
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
            <div>File Submission</div>
            <div>Add Submission</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tasks
