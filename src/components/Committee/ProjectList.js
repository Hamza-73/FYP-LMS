import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProjectList = (props) => {

  const history = useNavigate();

  const [data, setData] = useState({ supervior: '', groups: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [remarks, setRemarks] = useState();
  const [selectedGroupId, setSelectedGroupId] = useState(null);

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
      props.showAlert(`Some error occurred: ${error.message}`, 'danger');
    }
  }

  const giveRemarks = async (id) => {
    try {
      const response = await axios.put(`http://localhost:5000/committee/remarks/${id}`,
        {
          remarks: remarks
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      const json = await response.data;
      console.log('json is', json)
      if (json) {
        setRemarks(json);
        props.showAlert('Remarks has been given to the Group', 'success')
      }

    } catch (error) {
      console.log('error is ', error)
      props.showAlert('some error occured', 'danger')
    }
  }

  const handleRemarks = async (e, id) => {
    try {
      e.preventDefault()
      await giveRemarks(id);
      setRemarks('')
    } catch (error) {
      console.log(' useerror is ', error)
      props.showAlert(`some error occureed ${error}`, 'danger')
    }
  }

  useEffect(() => {
    if (localStorage.getItem('token')) {
      getProjects();
    } else {
      history('/')
    }
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

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

  // console.log('Filtered data is ', filteredData)

  return (
    <>

      <div>
        <div className="register"  >
          <div className="modal fade" id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" >Give Reamrks</h5>
                </div>
                <div className="modal-body">
                  <form onSubmit={(e) => handleRemarks(e, selectedGroupId)}>

                    <div className="mb-3">
                      <label htmlFor="remrks" className="form-label">Remarks</label>
                      <textarea className="form-control" id="remarks" name='remarks' value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                      <button type="submit" className="btn btn-success" disabled={!remarks}> Give Remarks </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
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
                  <thead style={{ textAlign: "center" }}>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Roll No</th>
                      <th scope="col">Project Title</th>
                      <th scope="col">Remarks</th>
                    </tr>
                  </thead>
                  <tbody style={{ textAlign: "center" }}>
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
                        <td>{group.remarks}<div style={{ cursor: "pointer" }} data-toggle="modal" data-target="#exampleModal">
                          <i className="fa-solid fa-pen-to-square" onClick={() => setSelectedGroupId(group.id)}></i>
                        </div>
                        </td>
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