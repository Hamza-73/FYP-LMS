import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Loading from '../Loading';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

const CommitteeMember = (props) => {
  const history = useNavigate();
  const [userData, setUserData] = useState({ member: [] });

  const [data, setData] = useState({ members: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [firstNameLastNameEqual, setFirstNameLastNameEqual] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [register, setRegister] = useState({
    fname: "", lname: "", username: "", email: "", password: ""
  });

  // Function to open the modal
  const openModal = () => {
    setShowModal(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setShowModal(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      if (register.username.indexOf('_') === -1) {
        NotificationManager.error('Username must contain at least one underscore (_).');
        return;
      }

      // Check if any required field is empty
      if (!register.fname.trim() || !register.lname.trim() || !register.username.trim() || !register.email.trim() || !register.password.trim()) {
        NotificationManager.error('Please fill in all required fields.');
        return;
      }

      const response = await fetch("http://localhost:5000/admin/register", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fname: register.fname.trim(), lname: register.lname.trim(), username: register.username.trim(),
          password: register.password, email: register.email.trim()
        })
      });
      const json = await response.json();
      console.log(json);
      if (json.success) {
        // Save the auth token and redirect
        localStorage.setItem('token', json.token);
        NotificationManager.success('Registration Successful');
        setData(prevData => ({
          ...prevData,
          members: [...prevData.members, {
            fname: register.fname, lname: register.lname, username: register.username,
            email: register.email, password: register.password
          }]
        }));

        // Clear the register form fields
        setRegister({
          fname: "", lname: "", username: "", email: "", password: ""
        });
        closeModal();
      }
      else {
        NotificationManager.error('Register According to the standard of Registration');
      }
    } catch (error) {
      NotificationManager.error('Error in Registering');
    }
  }

  // Function to handle edit
  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      if (register.username.indexOf('_') === -1) {
        NotificationManager.error('Username must contain at least one underscore (_).');
        return;
      }

      // Check if any required field is empty
      if (!register.fname.trim() || !register.lname.trim() || !register.username.trim() || !register.email.trim()) {
        NotificationManager.error('Please fill in all required fields.');
        return;
      }

      const id = selectedStudent._id;
      const response = await fetch(`http://localhost:5000/admin/edit/${id}`,
        {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fname: register.fname, lname: register.lname, username: register.username,
            email: register.email
          })
        }
      );

      const updatedStudent = await response.json();
      if (updatedStudent) {
        setData((prevData) => ({
          ...prevData,
          members: prevData.members.map((member) =>
            member._id === updatedStudent._id ? updatedStudent : member
          ),
        }));
        console.log('updated student is ', updatedStudent)
        setEditMode(false); // Disable edit mode after successful edit
        setRegister({
          fname: '', lname: '', username: '', email: '', password: ''
        });
        closeModal();
        NotificationManager.success('Edited Successfully');
      }

    } catch (error) {
      console.log('Error:', error); // Log the error message
      NotificationManager.error('Error in Editing');
    }
  };


  // Function to open edit modal
  const openEditModal = (student) => {
    setSelectedStudent(student);
    setEditMode(true);
    setRegister({
      fname: student.fname, lname: student.lname, username: student.username, email: student.email,
    });
  };



  // Function to handle delete
  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete?');
    if (confirmed) {
      try {
        console.log('id is ', id)
        const response = await axios.delete(`http://localhost:5000/admin/delete/${id}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        if (response.status === 200) {
          // Update the UI by removing the deleted student from the data
          setData((prevData) => ({
            ...prevData,
            members: prevData.members.filter((member) => member._id !== id),
          }));
          NotificationManager.success('Deleted Successfully');
        }
      } catch (error) {
        console.log('Error:', error); // Log the error message
        NotificationManager.error('Error in Deleting');
      }
    }
  };

  // Function to get members
  const getMembers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/admin/get-members", {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const json = await response.data;
      console.log('students are ', json); // Log the response data to see its structure
      setData(json);
    } catch (error) {

    }
  }

  const getDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('token not found');
        return;
      }

      const response = await fetch(`http://localhost:5000/admin/detail`, {
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

  // Function to handle input changes
  const handleChange1 = (e) => {
    const { name, value } = e.target;

    if (name === 'fname' || name === 'lname') {
      // Allow only one space between words and trim spaces at the beginning and end
      const trimmedValue = value.replace(/\s+/g, ' ');
      setRegister({ ...register, [name]: trimmedValue });

      // Check if both first name and last name are not empty and equal
      if (name === 'fname' && trimmedValue === register.lname && trimmedValue !== '' && register.lname !== '') {
        setFirstNameLastNameEqual(true);
      } else if (name === 'lname' && trimmedValue === register.fname && trimmedValue !== '' && register.fname !== '') {
        setFirstNameLastNameEqual(true);
      } else {
        setFirstNameLastNameEqual(false);
      }
    } else if (name === 'department') {
      // Allow only alphabetic characters
      const alphabeticValue = value.replace(/[^A-Za-z]+/g, '');
      setRegister({ ...register, [name]: alphabeticValue });

      // First name and last name are not equal when editing department
      setFirstNameLastNameEqual(false);
    } else {
      setRegister({ ...register, [name]: value });
    }
  };

  // Function to reset input fields
  const handleClose = () => {
    setRegister({ fname: "", lname: "", username: "", email: "", password: "" });
  }

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to the first page when performing a new search
  };

  const paginate = (array, page_size, page_number) => {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
  };

  const filteredData = data.members.filter((member) => {
    const searchTerm = searchQuery.trim().toLowerCase(); // Remove leading/trailing spaces and convert to lowercase
    const searchWords = searchTerm.split(' ');

    // Check if any word in the search query matches either first name or last name
    const matchesFirstName = member.fname && searchWords.some((word) =>
      member.fname.toLowerCase().includes(word)
    );
    const matchesLastName = member.lname && searchWords.some((word) =>
      member.lname.toLowerCase().includes(word)
    );

    return (
      matchesFirstName ||
      matchesLastName
    );
  });


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

  const location = useLocation();
  const pathsWithoutSidebar = ['/', '/committeeMain', '/committeeMain/members'];

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

  const [file, setFile] = useState(null);
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event, userType) => {
    event.preventDefault();

    if (!file) {
      alert('Please select an Excel file.');
      return;
    }

    const formData = new FormData();
    formData.append('excelFile', file);

    try {
      const response = await fetch(`http://localhost:5000/upload/${userType}`, {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();
      if (json.success) {
        NotificationManager.success(json.message, '', 3000);
        getMembers()
      } else {
        NotificationManager.error(json.message, '', 3000);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };


  return (
    <>
      <div className="UploadFile"  >
        <div className="modal fade" id="uploadFile" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" >Export Data From File</h5>
              </div>
              <div className="modal-body">
                <form onSubmit={(e) => handleSubmit(e, 'admin')}>

                  <div className="mb-3">
                    <label htmlFor="remrks" className="form-label">File</label>
                    <small>File Type should be : .xls/.xlsx</small>
                    <input type="file" onChange={handleFileChange} accept=".xls, .xlsx" />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={() => setFile(null)}>Close</button>
                    <button type="submit" className="btn btn-success" disabled={!file}> Upload </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* REGISTER */}
      <div className="register">
        <style>{style}</style>
        <div className={`modal fade ${showModal ? 'show' : ''}`} id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden={!showModal} data-backdrop="static" data-keyboard="false" onHide={() => setEditMode(false)}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" >Register</h5>
              </div>
              <div className="modal-body">
                <form onSubmit={editMode ? handleEdit : handleRegister}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">First Name</label>
                    <input type="text" className="form-control" id="name" name='fname' value={register.fname} onChange={handleChange1} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Last Name</label>
                    <input type="text" className="form-control" id="name" name='lname' value={register.lname} onChange={handleChange1} />
                    {firstNameLastNameEqual && (
                      <div className="alert alert-danger" role="alert">
                        First name and last name should not be equal.
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="exampleInputusername1" className="form-label">Username</label>
                    <input type="text" className="form-control" id="exampleInputusername2" name='username' value={register.username} onChange={handleChange1} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label"> Email </label>
                    <input type="email" className="form-control" id="email" name="email" value={register.email} onChange={handleChange1} />
                  </div>
                  {!editMode ? <div className="mb-3">
                    <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                    <input type="password" className="form-control" id="exampleInputPassword2" name='password' value={register.password} onChange={handleChange1} />
                    <small>password should be of at least 4 characters </small>
                  </div> : ''}
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={handleClose}>Close</button>
                    {editMode ? (
                      <button type="submit" className="btn" style={{ background: "maroon", color: "white" }}>Save Changes</button>
                    ) : (
                      <button type="submit" className="btn btn-success" disabled={!(register.fname) || !(register.lname)
                        || !(register.username) || !(register.email)}>
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

      {loading ? (<Loading />) : (<>
        <div className='container' style={{ width: "90%" }}>
          <h3 className='text-center'>Admins</h3>
          <div className="mb-3">
            <label htmlFor="recordsPerPage" className="form-label">Records per page:</label>
            <select id="recordsPerPage" className="form-select" value={recordsPerPage} onChange={(e) => {
              setRecordsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to the first page when changing the number of records per page
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
                  <th scope="col">Username</th>
                  <th scope="col">Email</th>
                  <th scope="col">Edit</th>
                  {(!showSidebar && !userData.member.isAdmin) && (
                    <th scope="col">Remove</th>
                  )}
                </tr>
              </thead>
              <tbody className='text-center'>
                {filteredDataPaginated.map((val, key) => (
                  <tr key={key}>
                    <td>{!val.isAdmin ? val.fname + ' ' + val.lname : <>{val.fname + ' ' + val.lname} <small>(committee)</small></>}</td>
                    <td>{val.username}</td>
                    <td>{val.email}</td>
                    <td style={{ cursor: "pointer" }} data-toggle="modal" data-target="#exampleModal" onClick={() => openEditModal(val)}>
                      <button className="btn" style={{ background: "maroon", color: "white" }}>
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                    </td>
                    {(!showSidebar && !userData.member.isAdmin) && <td style={{ cursor: "pointer", color: "maroon", textAlign: "center", fontSize: "25px" }} onClick={() => handleDelete(val._id)}>
                      <button className="btn" style={{ background: "maroon", color: "white" }}>
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>}
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
        {(!showSidebar && !userData.member.isAdmin) && (
          <div className="d-grid gap-2 col-6 mx-auto my-4">
            <button style={{ background: "maroon" }} type="button" className="btn btn-danger mx-5" data-toggle="modal" data-target="#exampleModal" onClick={() => { setEditMode(false); handleClose() }}>
              Register
            </button>
            <button
              style={{ background: "maroon" }}
              type="button"
              className="btn btn-danger mx-5"
              data-toggle="modal"
              data-target="#uploadFile"
              onClick={() => {
                setFile(null);
              }}
            >
              Register From File
            </button>
          </div>
        )}
        <NotificationContainer />
      </>)}
    </>
  );
}

export default CommitteeMember;