import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProjectList = (props) => {

  const history = useNavigate();

  const [data, setData] = useState({ supervior: '', groups: [] });
  const [searchQuery, setSearchQuery] = useState('');

  const getProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authorization token not found', 'danger');
        return;
      }
      const response = await axios.get("http://localhost:5000/committee/groups", {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const json = await response.data;
      console.log('json is ', json); // Log the response data to see its structure
      setData(json);
    } catch (error) {
      alert(`Some error occurred: ${error.message}`, 'danger');
    }
  }

  useEffect(() => {
    if (localStorage.getItem('token')) {
      getProjects();
    } else {
      history('/')
      // props.showAlert('You need to login first','danger');
    }
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // console.log('data is ', data);
  // Array.from(data).forEach((group) => {
  //   const supervisorName = group.supervisor;
  //   console.log('Supervisor:', supervisorName);

  //   group.projects.forEach((project) => {
  //     const projectTitle = project.projectTitle;
  //     console.log('Project Title:', projectTitle);

  //     project.students.forEach((student) => {
  //       const studentName = student.name;
  //       const rollNo = student.rollNo;
  //       console.log('Student Name:', studentName);
  //       console.log('Roll No:', rollNo);
  //     });
  //   });
  // });

  const members = [{
    supervior: "Ali Raza",
    Project: [
      {
        projectTitle: "LMS",
        students: [{ fname: "Hamza", lname: "Khan", rollNo: "0077" }, { fname: "Hamza", lname: "khan", rollNo: "0073" },]
      }, {
        projectTitle: "WEB PAGE",
        students: [{ fname: "Hamza", lname: "Khan", rollNo: "0074" }, { fname: "Ham2za", lname: "khan", rollNo: "0073" },]
      }, {
        projectTitle: "KHAD",
        students: [{ fname: "Hamza", lname: "Khan", rollNo: "0073" }, { fname: "Hamza", lname: "khan", rollNo: "0073" },]
      },
    ]
  }, {
    supervior: "Ali Raza",
    Project: [
      {
        projectTitle: "APP",
        students: [{ fname: "Hamza", lname: "Khan", rollNo: "0073" }, { fname: "Hamza", lname: "khan", rollNo: "0073" },]
      }, {
        projectTitle: "WEB PAGE",
        students: [{ fname: "Hamza", lname: "Khan", rollNo: "0074" }, { fname: "Ham2za", lname: "khan", rollNo: "0073" },]
      }, {
        projectTitle: "KHAD",
        students: [{ fname: "Hamza", lname: "Khan", rollNo: "0073" }, { fname: "Hamza", lname: "khan", rollNo: "0073" },]
      },
    ]
  }, {
    supervior: "Ali Raza",
    Project: [
      {
        projectTitle: "APP",
        students: [{ fname: "Hamza", lname: "Khan", rollNo: "0073" }, { fname: "Hamza", lname: "khan", rollNo: "0073" },]
      }, {
        projectTitle: "WEB PAGE",
        students: [{ fname: "Hamza", lname: "Khan", rollNo: "0074" }, { fname: "Ham2za", lname: "khan", rollNo: "0073" },]
      }, {
        projectTitle: "KHAD",
        students: [{ fname: "Hamza", lname: "Khan", rollNo: "0073" }, { fname: "Hamza", lname: "khan", rollNo: "0073" },]
      },
    ]
  },]


  const filteredData = Array.from(data).map((group) => {
    const filteredProjects = group.projects.filter((project) =>
      project.projectTitle.toLowerCase().trim().includes(searchQuery.toLowerCase()) ||
      project.students.some((student) =>
        student.rollNo.toLowerCase().trim().includes(searchQuery.toLowerCase()) ||
        student.name.toLowerCase().trim().includes(searchQuery.toLowerCase())
      )
    );
  
    if (
      group.supervisor.toLowerCase().trim().includes(searchQuery.toLowerCase()) ||
      filteredProjects.length > 0
    ) {
      return { ...group, projects: filteredProjects };
    }
  
    return null;
  }).filter(Boolean);
  


console.log('Filtered data is ', filteredData)




  return (

    <>

      <div div className='container'>
      <h3 className='text-center'>Project List</h3>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search....."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {filteredData.length > 0 ? (
        <div>
          {filteredData.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h5 className='text-center' style={{ "borderBottom": "1px solid black" }}>{group.supervisor}</h5>
              <table className='table table-hover'>
                <thead style={{textAlign:"center"}}>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Roll No</th>
                    <th scope="col">Project Title</th>
                    <th scope="col">Remarks</th>
                  </tr>
                </thead>
                <tbody style={{textAlign:"center"}}>
                  {group.projects.map((project, projectKey) => (
                    <tr key={projectKey}>
                      <td>
                        <div>
                          {project.students.map((student, studentKey) => (
                            <React.Fragment key={studentKey}>
                              {student.name}<br />
                            </React.Fragment>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div>
                          {project.students.map((student, studentKey) => (
                            <React.Fragment key={studentKey}>
                              {student.rollNo}<br />
                            </React.Fragment>
                          ))}
                        </div>
                      </td>
                      <td>{project.projectTitle}</td>
                      <td>{group.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        <div>No matching members found.</div>
      )}
          
      </div>
    </>
  )
}

export default ProjectList;