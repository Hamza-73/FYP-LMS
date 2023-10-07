import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Loading from '../Loading';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

const SupervisorList = (props) => {
  const history = useNavigate();
  const [data, setData] = useState({ members: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {

      // Check if any required field is empty
      if (!register.name.trim() || !register.username.trim() || !register.department.trim() || !register.designation.trim() || !register.password.trim()) {
        NotificationManager.error('Please fill in all required fields.');
        return;
      }

      if (register.username.indexOf('_') === -1) {
        NotificationManager.error('Username must contain at least one underscore (_).');
        return;
      }
      console.log('registering ', register)
      const response = await fetch("http://localhost:5000/supervisor/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: register.name.trim(),
          username: register.username.trim(),
          designation: register.designation,
          password: register.password,
          department: register.department.trim(),
          slots: parseInt(register.slots, 10),
          email: register.email
        })
      });
      const json = await response.json();
      console.log('json in registering', json);
      if (json.success) {
        // Save the auth token and redirect
        localStorage.setItem('token', json.token);
        NotificationManager.success('Registration Successful');
        setData((prevData) => ({
          ...prevData,
          members: [...prevData.members, {
            name: register.name, username: register.username,
            designation: register.designation, department: register.department,
            slots: parseInt(register.slots, 10), email: register.email
          }]
        }));

        // Clear the register form fields
        setRegister({
          name: "", username: "", department: "", designation: "", password: "", slots: "", email: ""
        });
      } else {
        NotificationManager.error(json.message);
      }
    } catch (error) {
      NotificationManager.error('Error in Registering');
    }
  }

  const openEditModal = (supervisor) => {
    setSelectedSupervisor(supervisor);
    setEditMode(true); // Set edit mode when opening the modal
    setRegister({
      name: supervisor.name, username: supervisor.username, department: supervisor.department,
      designation: supervisor.designation, slots: supervisor.slots.toString(), email: supervisor.email
    });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      console.log('Register state:', register); // Debugging statement
      if (!register.name || !register.username || !register.department || !register.designation || !register.email) {
        NotificationManager.error('Please fill in all required fields.');
        return;
      }

      if (register.username.indexOf('_') === -1) {
        NotificationManager.error('Username must contain at least one underscore (_).');
        return;
      }
      const id = selectedSupervisor._id;
      const response = await fetch(`http://localhost:5000/supervisor/edit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: register.name.trim(),
          username: register.username.trim(),
          designation: register.designation.trim(),
          department: register.department.trim(),
          slots: parseInt(register.slots, 10),
          email: register.email
        })
      });

      const updatedSupervisor = await response.json(); // Await the response here
      if (updatedSupervisor) {
        console.log('updated success')
        // Update the state immediately with the edited data
        setData((prevData) => ({
          ...prevData,
          members: prevData.members.map((member) =>
            member._id === updatedSupervisor._id ? updatedSupervisor : member
          ),
        }));

        NotificationManager.success('Edited Successfully');
        setEditMode(false); // Disable edit mode after successful edit
        setRegister({
          name: '', username: '', department: '', designation: '', slots: '', email: ''
        });
      }
    } catch (error) {
      console.log('Error:', error); // Log the error message
      NotificationManager.error('Error in Editing');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this supervisor?');
    if (confirmed) {
      try {
        const response = await fetch(`http://localhost:5000/supervisor/delete/${id}`, {
          method: "DELETE"
        });
        const json = await response.json();
        console.log('json in deleting supervisor is ', json)
        if (response.status === 200) {
          // Update the UI by removing the deleted supervisor from the data
          setData((prevData) => ({
            ...prevData,
            members: prevData.members.filter((member) => member._id !== id),
          }));
          if (json.success)
            NotificationManager.success('Deleted Successfully');
          if (!json.success) {
            NotificationManager.success(json.message);
          }
        }
      } catch (error) {
        console.log('Error:', error); // Log the error message
        NotificationManager.error('Error in Deleting');
      }
    }
  };

  const getMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authorization token not found', 'danger');
        return;
      }
      const response = await axios.get("http://localhost:5000/supervisor/get-supervisors", {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const json = await response.data;
      console.log('supervisors are ', json); // Log the response data to see its structure
      setData(json);
    } catch (error) {
      NotificationManager.error('Error in fetching Supervisors');
    }
  }

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      history('/');
    } else {
      // Set loading to true when starting data fetch
      setLoading(true);
      getDetail();
      getMembers()
        .then(() => {
          // Once data is fetched, set loading to false
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false); // Handle error cases
          console.error('Error fetching data:', error);
        });
    }
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = data.members.filter((member) =>
    member.name.toLowerCase().trim().includes(searchQuery.toLowerCase()) ||
    member.department.toLowerCase().trim().includes(searchQuery.toLowerCase()) ||
    member.designation.toLowerCase().trim().includes(searchQuery.toLowerCase())
  );

  const [register, setRegister] = useState({
    name: "", username: "", department: "", designation: "", password: "", slots: "", email: ""
  });

  const handleChange1 = (e) => {
    const { name, value } = e.target;

    if (name === 'name') {
      // Allow only one space between words and trim spaces at the beginning and end
      const trimmedValue = value.replace(/\s+/g, ' ');
      setRegister({ ...register, [name]: trimmedValue });
    } else if (name === 'department') {
      // Allow only alphabetic characters
      const formattedValue = value.replace(/[^A-Za-z ]+/g, '').replace(/\s+/g, ' ');
      setRegister({ ...register, [name]: formattedValue });
    }
    else if (name === 'slots') {
      // Allow only non-negative integers
      const numericValue = value.replace(/[^0-9]+/g, '');
      setRegister({ ...register, [name]: numericValue });
    } else {
      setRegister({ ...register, [name]: value });
    }
  };

  const handleClose = () => {
    setRegister({ name: "", username: "", department: "", designation: "", password: "", slots: "", email: "" })
  }

  const paginate = (array, page_size, page_number) => {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
  };

  const filteredDataPaginated = paginate(filteredData, recordsPerPage, currentPage);

  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredData.length / recordsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('token not found');
        return;
      }

      const response = await fetch(`http://localhost:5000/${props.detailLink}/detail`, {
        method: 'GET',
        headers: {
          'Authorization': token
        },
      });

      if (!response.ok) {
        console.log('error fetching detail', response);
        return; // Exit early on error
      }

      const json = await response.json();
      console.log('json is in sidebar: ', json);
      if (json) {
        //   console.log('User data is: ', json);
        setUserData(json);
        setLoading(false)
      }
    } catch (err) {
      console.log('error is in sidebar: ', err);
    }
  };

  const makeCommittee = async (username) => {
    try {
      const response = await fetch(`http://localhost:5000/admin/make-committee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: username })
      });
      const json = await response.json();

      if (json.success) {
        alert(json.message);
        // Fetch the updated data again after making a committee member
        getMembers();
      } else {
        alert(json.message);
      }

      console.log('json in making admin is ', json);
    } catch (error) {
      console.error('Error making committee member:', error);
      // Handle error
    }
  };



  const location = useLocation();
  const [userData, setUserData] = useState({ member: [] })
  const pathsWithoutSidebar = ['/', '/committeeMain', '/committeeMain/members', '/committeeMain/student', '/committeeMain/supervisor'];

  // Check if the current location is in the pathsWithoutSidebar array
  const showSidebar = pathsWithoutSidebar.includes(location.pathname);

  const style = `
  .heading {
    text-align: center;
    margin-top: 40px;
  }

  .form-control {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .mb-3 {
    margin-bottom: 15px;
  }

  .btn-secondary {
    background-color: white;
    color: black;
  }

  .btn-register {
    background-color: maroon;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
  }
  .btn-formregister{
    background-color:maroon;
    color:white;
  }
  
`;

  return (
    <>
      {/* REGISTER */}
      <div className="register">
        <style>{style}</style>
        <div className="modal fade" id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Register</h5>
              </div>
              <div className="modal-body">
                <form onSubmit={editMode ? handleEdit : handleRegister}>
                  <div className="col">
                    <label htmlFor="name" className="form-label">
                      First Name
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-user"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={register.name}
                        onChange={handleChange1}
                      />
                    </div>
                  </div>
                  <div className="col">
                    <label htmlFor="username" className="form-label">
                      First Name
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-user"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="username"
                        name="username"
                        value={register.username}
                        onChange={handleChange1}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="department" className="form-label">
                      {" "}
                      Department{" "}
                    </label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="fas fa-building"></i></span>
                      <select
                        type="text"
                        className="form-control"
                        id="department"
                        name="department"
                        value={register.department}
                        onChange={handleChange1}
                      >
                        <option value="">Select Department</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Other">other</option>
                      </select>
                    </div>
                  </div>
                  <div className="col">
                    <label htmlFor="name" className="form-label">
                      Email
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i class="fa-regular fa-envelope"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="email"
                        name="email"
                        value={register.email}
                        onChange={handleChange1}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="designation" className="form-label">
                      {" "}
                      Designation{" "}
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-user-tie"></i>
                      </span>
                      <select
                        className="form-select"
                        id="designation"
                        name="designation"
                        value={register.designation}
                        onChange={handleChange1}
                      >
                        <option value="Professor">Professor</option>
                        <option value="Assistant Professor">
                          Assistant Professor
                        </option>
                        <option value="Lecturer">Lecturer</option>
                        <option value="External">External</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="department" className="form-label">Slots</label>
                    <input type="number" className="form-control" id="semester" name='slots' value={register.slots} onChange={handleChange1} />
                  </div>
                  {!editMode ? <div className="mb-3">
                    <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                    <input type="password" className="form-control" id="exampleInputPassword2" name='password' value={register.password} onChange={handleChange1} />
                    <small>Password should be at least 4 characters</small>
                  </div> : ''}
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={() => { setEditMode(false); handleClose() }}>Close</button>
                    {editMode ? (
                      <button type="submit" className="btn btn-primary" disabled={!register.name || !register.username || !register.department || !register.designation || register.slots < 0}>Save Changes</button>
                    ) : (
                      <button type="submit" className="btn btn-success" disabled={!register.name || !register.username || !register.department || !register.designation || register.slots < 0}>
                        Register
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (<Loading />) : (
        <>
          <div className='container' style={{ width: "90%" }}>
            <h3 className='text-center'>Supervisor List</h3>
            <div className="mb-3">
              <label htmlFor="recordsPerPage" className="form-label">Records per page:</label>
              <select id="recordsPerPage" className="form-select" value={recordsPerPage} onChange={(e) => {
                setRecordsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, department, or designation"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            {filteredDataPaginated.length > 0 ? (
              <table className="table table-hover text-center">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Department</th>
                    <th scope="col">Designation</th>
                    <th scope="col">Slots</th>
                  {(!showSidebar || userData.member.isAdmin) && <th scope="col">Edit</th>}
                    {(!showSidebar && !userData.member.isAdmin) && <>
                      <th scope="col">Remove</th>
                      <th scope="col">Make Committee</th>
                    </>}
                  </tr>
                </thead>
                <tbody>
                  {filteredDataPaginated.map((val, key) => (
                    <tr key={key}>
                      <td>{val.name}</td>
                      <td>{val.department}</td>
                      <td>{val.designation}</td>
                      <td>{val.slots}</td>
                      {(!showSidebar || userData.member.isAdmin) &&
                        <td style={{ cursor: "pointer" }} data-toggle="modal" data-target="#exampleModal" onClick={() => openEditModal(val)}>
                          <i className="fa-solid fa-pen-to-square"></i>
                        </td>}
                      {(!showSidebar && !userData.member.isAdmin) &&
                        <>
                          <td style={{ cursor: "pointer", color: "maroon", textAlign: "center", fontSize: "25px" }} onClick={() => handleDelete(val._id)}><i className="fa-solid fa-trash"></i></td>
                          <td><button className="btn btn-sm" style={{ background: "maroon", color: "white" }}
                            disabled={val.isCommittee}
                            onClick={() => {
                              makeCommittee(val.username)
                            }}
                          >Make Committee</button></td>
                        </>}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div>No matching members found.</div>
            )}
            <div className="d-flex justify-content-between">
              <button type="button" className="btn btn-success" disabled={currentPage === 1} onClick={handlePrevPage}
              >  Previous </button>
              <button type="button" className="btn btn-success" disabled={currentPage === Math.ceil(filteredData.length / recordsPerPage)} onClick={handleNextPage}
              >  Next </button>
            </div>
          </div>
          {(!showSidebar && !userData.member.isAdmin) && <div className="d-grid gap-2 col-6 mx-auto my-4">
            <button style={{ background: "maroon" }} type="button" className="btn btn-danger mx-5" data-toggle="modal" data-target="#exampleModal" onClick={() => { setEditMode(false); handleClose() }}>
              Register
            </button>
          </div>}

          <NotificationContainer />
        </>
      )}
    </>
  )
}

export default SupervisorList;