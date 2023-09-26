import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

const ProjectList = (props) => {

  const history = useNavigate();

  const [data, setData] = useState({ supervisorName: '', supervisorId: '', groups: [] });
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
      NotificationManager.error('Some Error occured Try/Again');
    }
  }

  const giveRemarks = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/committee/remarks/${id}`,
        {
          method : "PUT",
          headers: {
            'Content-Type': 'application/json'
          },
          body : JSON.stringify({ remarks: remarks })
        });
      const json = await response.data;
      console.log('json is', json)
      if (json) {
        setRemarks(json);
        NotificationManager.sucess('Remarks have been given');
      }

    } catch (error) {
      console.log('error is ', error)
      NotificationManager.error('Some error occured Try Again');
    }
  }

  const handleRemarks = async (e, id) => {
    try {
      e.preventDefault()
      await giveRemarks(id);
      setRemarks('')
    } catch (error) {
      console.log(' useerror is ', error)
      NotificationManager.error('Some error occured Try Again');
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



  // console.log('Filtered data is ', filteredData)

  return (
    <>
      <div>
        <div className="remarks"  >
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
                      <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={() => setRemarks('')}>Close</button>
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

        {data.length > 0 ? (
          <div>
            {data.map((datas, groupIndex) => (
              <div key={groupIndex}>
                <h5 className='text-center' style={{ "borderBottom": "1px solid black" }}>{datas.supervisorName}</h5>
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
                  {datas.groups.map((group, groupKey) => (
  <tr key={groupKey}>
    <td>
      <div>
        {group.students.map((student, studentKey) => (
          <React.Fragment key={studentKey}>
            {student.name}<br />
          </React.Fragment>
        ))}
      </div>
    </td>
    <td>
      <div>
        {group.students.map((student, studentKey) => (
          <React.Fragment key={studentKey}>
            {student.rollNo}<br />
          </React.Fragment>
        ))}
      </div>
    </td>
    <td>{group.projectTitle}</td>
    <td>{group.remarks}<div style={{ cursor: "pointer" }} data-toggle="modal" data-target="#exampleModal">
      <i className="fa-solid fa-pen-to-square" onClick={() => setSelectedGroupId(group.groupId)}></i>
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
      <NotificationContainer />
    </>
  )
}

export default ProjectList;