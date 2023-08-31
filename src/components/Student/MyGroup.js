import React from 'react'
import SideBar from '../SideBar'
import '../../css/group.css'

const MyGroup = (props) => {
  return (
    <div>
      <SideBar title1='Dashboard' link1='dashboard' title2='Project Progress'
        link2='progress' title3='Tasks' link3='tasks' title4='My Group' link4='group'
        title5='Meeting' link5='meeting' detailLink = 'student'
      />

      <div className="container">

        <div className="upperpart">
          <div className="proj-detail d-flex justify-content-between">
            <h4>Project Title</h4>
            <h5>XYZ</h5>
          </div>
          <div className="proj-detail d-flex justify-content-between">
            <h4>Supervisor</h4>
            <h5>XYZ</h5>
          </div>
        </div>


        <div className="mid">
          <h5>Supervisor Profile</h5>
          <h5>Group Member Profile</h5>
          <h5>My Profile</h5>
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
              <a href="">view uploaded document</a>
            </div>
          </div><div className="review-box">
            <div>
              <h6>Review</h6>
              <div class="form-floating">
                <textarea class="form-control" cols="50" placeholder="" id="floatingTextarea"></textarea>
              </div>
            </div>
            <div>
              <a href="">view uploaded document</a>
            </div>
          </div>
        </div>

        <div className="upload-btn">
          <button className="btn btn-danger">Upload Document</button>
        </div>

      </div>
    </div>
  )
}

export default MyGroup
