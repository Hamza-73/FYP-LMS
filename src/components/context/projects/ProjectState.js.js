import ProjectContext from './ProjectContext';
import { useState } from "react";

const ProjectState = (props) => {
  

  const notesInitial = []
  const [projects, setProject] = useState(notesInitial)

  // Get all Projects
  const getProject = async () => {
    // API Call 
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token); // Log the token to check its value
      if (!token) {
        // Handle token not found case
        alert('Authorization token not found');
        return;
      }
      const response = await fetch(`http://localhost:5000/project/my-projects`, {
        method: 'GET',
        Headers: {
          'Content-Type': 'application/json',
          // eslint-disable-next-line
          // 'Authorization': `'Bearer ${token}'`
          'Authorization': token
        }
      });
      const json = await response.json()
      console.log(json)
      setProject(json)
    } catch (error) {
      alert('Some error occured' + error)
    }
  }

  const createProject = async ({title,desscription}) => {
    // API Call 
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token); // Log the token to check its value
      if (!token) {
        // Handle token not found case
        alert('Authorization token not found');
        return;
      }
      const response = await fetch(`http://localhost:5000/project/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // eslint-disable-next-line
          'authorization': token
        },
        body : JSON.stringify({title,desscription})
      });
      const json = await response.json()
      console.log('Authorization token found')
      console.log(json)

      console.log("Adding a new note")
      const note = json
      setProject((note))
    } catch (error) {
      alert('Some error occured' + error)
    }
  }


  return (
    <ProjectContext.Provider value={{ projects, getProject, createProject }}>
      {props.children}
    </ProjectContext.Provider>
  )

}
export default ProjectState;