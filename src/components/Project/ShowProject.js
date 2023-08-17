import React, { useState, useEffect } from 'react'
import SideBar from '../SideBar'
// import { Route, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
// import SubmitProject from '../Project/SubmitProject.js';
import axios from 'axios'

const ShowProject = (props) => {
    let history = useNavigate()


  const getProject = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        props.showAlert('Authorization token not found', 'danger');
        return;
      }
      const response = await axios.get("http://localhost:5000/project/my-projects", {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await response.data;
      setProject(json);
    } catch (error) {
      props.showAlert(`Some error occurred: ${error.message}`, 'danger');
    }
  }

  const [projects, setProject] = useState([]);

  try{
    useEffect(() => {
      if (localStorage.getItem('token')) {
        getProject();
      } else {
        history('/progress');
        props.showAlert(`Data no Found`, 'danger')
      }
      // eslint-disable-next-line
    },[projects] );
  }catch(err){
    props.showAlert(err, 'danger')
  }
 
  return (
    <div>
      <SideBar title1='Dashboard' link1='dashboard' title2 = 'Project Progress' link2='progress' title3='Tasks' link3='tasks'  title4='My Group' link4='group'  title5='Show Projects' link5='showproject' username={props.username}
      />
      <h1>Hi Therw</h1>
      {/* <SubmitProject/> */} 
            {Array.isArray(projects) && projects.length > 0 ? (
        projects.map((project) => {
          console.log('Project')
          return project.title;
        })
      ) : (
        'No project to show'
      )}
    </div>
  )
}

export default ShowProject
