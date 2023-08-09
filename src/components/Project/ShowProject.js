import React from 'react'
import SideBar from '../SideBar'
import React from 'react';
// import ProjectContext from '../context/projects/ProjectContext';
// import Progress from './Progress';
// import { Route, Routes } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
// import SubmitProject from '../Project/SubmitProject.js';

const ShowProject = () => {
    // let history = useNavigate()

  // eslint-disable-next-line 
  // const { projects, getProject } =  useContext(ProjectContext);

  // try{
  //   useEffect(() => {
  //     if (localStorage.getItem('token')) {
  //       getProject();
  //     } else {
  //       history('/student');
  //       alert('no data found')
  //     }
  //     // eslint-disable-next-line
  //   }, []);
  // }catch(err){
  //   alert(err)
  // }
 
  return (
    <div>
      <SideBar title1='Dashboard' link1='dashboard' title2 = 'Project Progress' link2='progress' title3='Tasks' link3='tasks'  title4='My Group' link4='group'  username={props.username}
      />
      {/* <SubmitProject/> */}
           {/* {Array.isArray(projects) && projects.length > 0 ? (
        projects.map((project) => {
          return project.title;
        })
      ) : (
        'No project to show'
      )} */}
      
    </div>
  )
}

export default ShowProject
