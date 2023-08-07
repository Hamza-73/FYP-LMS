import React, { useContext, useEffect } from 'react'
import {projectContext} from '../context/projects/ProjectState.js'
import SideBar from '../SideBar'
import { useNavigate } from 'react-router-dom'
import SubmitProject from '../Project/SubmitProject.js'

const Student = (props) => {
  let history = useNavigate()

  // eslint-disable-next-line 
  const { projects, getProject } = useContext(projectContext);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      getProject();
    } else {
      history('/');
    }
    // eslint-disable-next-line
  }, []);
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
