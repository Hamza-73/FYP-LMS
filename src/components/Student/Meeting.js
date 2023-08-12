import React, { useState } from 'react'
import SideBar from '../SideBar'

const Meeting = (props) => {
  const myStyle = {
    backgroundColor : "lightgrey",
    border : "2px solid lightgrey",
    borderRadius : "4px",
    textAlign:"center"
  }

  return (
    <div>
      <SideBar title1='Dashboard' link1='dashboard' title2='Project Progress' link2='progress' title3='Tasks' link3='tasks' title4='My Group' link4='group' title5='Meeting' link5='meeting' username={props.username}
      />
      <div className="container" style={{height:"500px"}}>

      
        <h1>Link Information</h1>
          <textarea name="" id="" placeholder='Purpose of Meeting' cols="30" rows="2" style={myStyle}></textarea>
        <h6>Select a meeting type</h6>

        <div className="d-flex">
        <div className="select">
          <input type="radio" name='meeting' />
          <label htmlFor="inperson" className='mx-2'>In Person</label>
        </div>
        <div className="select mx-4">
          <input type="radio" name='meeting' />
          <label htmlFor="online" className='mx-2'>Online</label>
        </div>
        </div>

        <div className="source d-flex" style={{marginTop:"20px"}}>
          <h3>Using</h3> 
          <select className='mx-5' name="source" id="" style={{width:"200px", textAlign:"center", fontSize:"23px", backgroundColor:"lightgrey"}}>
            <option value="Google Meet">Google Meet</option>
            <option value="Zoom">Zoom</option>
          </select>
        </div>

        <div className="link">
          <h1>Link</h1>
          <textarea name="" id="" cols="35" rows="2" style={myStyle}></textarea>
        </div>

        <button className="btn btn-danger">Schedule Metting</button>
        
      </div>
    </div>
  )
}

export default Meeting
