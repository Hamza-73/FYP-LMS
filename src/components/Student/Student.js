import React, { useContext, useEffect } from 'react';
import ProjectContext from '../context/projects/ProjectContext';
import SideBar from '../SideBar';
// import { useNavigate } from 'react-router-dom';
import SubmitProject from '../Project/SubmitProject.js';

const Student = (props) => {
  // let history = useNavigate()

  const context = useContext(ProjectContext)
  // eslint-disable-next-line 
  const { projects, getProject } = context;

  try{
    useEffect(() => {
      if (localStorage.getItem('token')) {
        getProject();
      } else {
        // history('/student');
        alert('no data found')
      }
      // eslint-disable-next-line
    }, []);
  }catch(err){
    alert(err)
  }
  
  return (
    <div>
      <SideBar title1='Title 1' link1='' title2 = 'title 2' link2='login' username={props.username}
      />
      <SubmitProject/>
           {Array.isArray(projects) && projects.length > 0 ? (
        projects.map((project) => {
          return project.title;
        })
      ) : (
        'No project to show'
      )}
    </div>
  )
}

export default Student
