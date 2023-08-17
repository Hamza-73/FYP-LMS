import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProjectList = (props) => {

  const history = useNavigate();

  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // const getMembers = async () => {
  //   try {
  //     const token = localStorage.getItem('token');
  //     if (!token) {
  //       alert('Authorization token not found', 'danger');
  //       return;
  //     }
  //     const response = await axios.get("http://localhost:5000/committee/get-members", {
  //       headers: {
  //         'Content-Type': 'application/json'
  //       }
  //     });
  //     const json = await response.data;
  //     console.log(json); // Log the response data to see its structure
  //     setData(json);
  //   } catch (error) {
  //     alert(`Some error occurred: ${error.message}`, 'danger');
  //   }
  // }

  useEffect(() => {
    if (localStorage.getItem('token')) {
      // getMembers();
    } else {
      history('/')
      // props.showAlert('You need to login first','danger');
    }
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };


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


  const filteredData = members.filter((member) =>
    member.supervior.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.Project.some((project) =>
      project.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.students.some((student) =>
        student.fname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.lname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
  );




  return (

    <>


      <div className='container'>
        <h3 className='text-center' style={{ borderBottom: "1px solid rgb(187, 174, 174)" }} >Project List</h3>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, rollNo, or designation"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {filteredData.length > 0 ? (
          <>
            {filteredData.map((member, memberKey) => (
              <div key={memberKey}>
                <h5 className='text-center' style={{ "borderBottom": "1px solid black" }}>{member.supervior}</h5>
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Roll No</th>
                      <th scope="col">Project Title</th>
                      <th scope="col">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {member.Project.map((project, projectKey) => (
                      <tr key={projectKey}>
                        <td>
                          <div>
                            {project.students.map((student, studentKey) => (
                              <React.Fragment key={studentKey}>
                                {student.fname + ' ' + student.lname}<br />
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
                        <td>XYZ</td>
                      </tr>
                    ))}

                  </tbody>
                </table>
              </div>
            ))}
          </>
        ) : (
          <div>No matching members found.</div>
        )}

      </div>
    </>
  )
}

export default ProjectList;