import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Loading from '../Loading';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

const StudentList = (props) => {
  const history = useNavigate();

  const [data, setData] = useState({ members: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [rollNoError, setRollNoError] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    // Check if any of the fields are empty
    if (!register.name.trim() || !register.rollNo.trim() || !register.department.trim() || !register.cnic.trim() || !register.batch.trim() || !register.father.trim() || !register.email) {
      NotificationManager.error('Please fill in all required fields.');
      return;
    }

    // Check for consecutive spaces in any field
    const consecutiveSpacesPattern = /\s{2,}/;
    if (consecutiveSpacesPattern.test(register.name) || consecutiveSpacesPattern.test(register.rollNo) || consecutiveSpacesPattern.test(register.department) || consecutiveSpacesPattern.test(register.cnic) || consecutiveSpacesPattern.test(register.batch) || consecutiveSpacesPattern.test(register.father)) {
      NotificationManager.error('Fields should not contain consecutive spaces.');
      return;
    }

    // Validate the rollNo format
    const rollNoPattern = /^[0-9]{4}-BSCS-[0-9]{2}$/;

    if (!rollNoPattern.test(register.rollNo)) {
      setRollNoError(true);
      return;
    } else {
      setRollNoError(false); // Clear the error flag if the format is correct
    }

    // Validate CNIC length (exactly 13 characters) and that it contains only numbers
    const cnicPattern = /^[0-9]{13}$/;
    if (!cnicPattern.test(register.cnic)) {
      NotificationManager.error('CNIC should be exactly 13 digits long and contain only numbers');
      return;
    }

    // Validate semester (1 to 8)
    const semesterValue = parseInt(register.semester, 10);
    if (isNaN(semesterValue) || semesterValue < 1 || semesterValue > 8) {
      NotificationManager.error('Semester should be a number between 1 and 8');
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/student/register", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: register.name, cnic: register.cnic, batch: register.batch, semester: register.semester,
          rollNo: register.rollNo, department: register.department,
          father: register.father, email: register.email
        })
      });
      const json = await response.json();
      console.log(json);
      if (json.success) {
        // Save the auth token and redirect
        localStorage.setItem('token', json.token);
        NotificationManager.success('Registration Successful');
        // history("/");
        setData(prevData => ({
          ...prevData,
          members: [...prevData.members, {
            name: register.name, father: register.father,
            department: register.department, batch: register.batch,
            semester: register.semester, cnic: register.cnic, rollNo: register.rollNo,
          }]
        }));

        // Clear the register form fields
        setRegister({
          name: "", father: "", department: "", batch: "", semester: "", cnic: "", rollNo: "", email: ""
        });
        setRollNoError(false);

      }
      else {
        NotificationManager.error(json.message);
      }
    } catch (error) {
      NotificationManager.error('Error in Registering');
    }
  }


  const openEditModal = (student) => {
    setSelectedStudent(student);
    setEditMode(true); // Set edit mode when opening the modal
    setRegister({
      name: student.name, father: student.father, department: student.department, batch: student.batch, semester: student.semester, cnic: student.cnic, rollNo: student.rollNo, email: register.email
    });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      // console.log('selected Student is ', selectedStudent, ' type of ', typeof selectedStudent._id)
      const id = selectedStudent._id;
      // console.log('id is ', id)
      const rollNoPattern = /^[0-9]{4}-BSCS-[0-9]{2}$/;

      // Check if any of the fields are empty
      if (!register.name.trim() || !register.rollNo.trim() || !register.department.trim() || !register.cnic.trim() || !register.batch.trim() || !register.father.trim() || !register.email) {
        NotificationManager.error('Please fill in all required fields.');
        return;
      }

      // Check for consecutive spaces in any field
      const consecutiveSpacesPattern = /\s{2,}/;
      if (consecutiveSpacesPattern.test(register.name) || consecutiveSpacesPattern.test(register.rollNo) || consecutiveSpacesPattern.test(register.department) || consecutiveSpacesPattern.test(register.cnic) || consecutiveSpacesPattern.test(register.batch) || consecutiveSpacesPattern.test(register.father)) {
        NotificationManager.error('Fields should not contain consecutive spaces.');
        return;
      }

      if (!rollNoPattern.test(register.rollNo)) {
        setRollNoError('Roll Number should be in the format XXXX-BSCS-XX');
        return;
      }

      // Validate CNIC length (exactly 13 characters) and that it contains only numbers
      const cnicPattern = /^[0-9]{13}$/;
      if (!cnicPattern.test(register.cnic)) {
        NotificationManager.error('CNIC should be exactly 13 digits long and contain only numbers');
        return;
      }

      // Validate semester (1 to 8)
      const semesterValue = parseInt(register.semester, 10);
      if (isNaN(semesterValue) || semesterValue < 1 || semesterValue > 8) {
        NotificationManager.error('Semester should be a number between 1 and 8');
        return;
      }

      const response = await fetch(`http://localhost:5000/student/edit/${id}`, // Assuming _id is the correct identifier for a student
        {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: register.name, father: register.father, department: register.department,
            batch: register.batch, semester: register.semester,
            cnic: register.cnic, rollNo: register.rollNo, email: register.email
          })
        }
      );

      const updatedStudent = await response.json();
      // console.log('updatedStudent is ', updatedStudent)
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
          name: '', father: '', department: '', batch: '', semester: '', cnic: '', rollNo: '', email: ""
        });
        NotificationManager.success('Edited Successfully');
        setRollNoError(false);
      }
    } catch (error) {
      console.log('Error:', error); // Log the error message
      NotificationManager.error('Error in Editing');
    }
  };


  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this student?');
    if (confirmed) {
      try {
        console.log('id is ', id)
        const response = await fetch(`http://localhost:5000/student/delete/${id}`,
          {
            method: "DELETE",
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('response os fetch')
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

  const getMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authorization token not found', 'danger');
        return;
      }
      const response = await axios.get("http://localhost:5000/student/get-students", {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const json = await response.data;
      console.log('students are ', json); // Log the response data to see its structure
      setData(json);
    } catch (error) {
      alert(`Some error occurred: ${error.message}`, 'danger');
    }
  }

  useEffect(() => {
    if (localStorage.getItem('token')) {
      // Set loading to true when starting data fetch
      setLoading(true);
      getDetail()
      getMembers().then(() => {
        // Once data is fetched, set loading to false
        setLoading(false);
      }).catch((error) => {
        setLoading(false); // Handle error cases
        console.error('Error fetching data:', error);
      });
    } else {
      history('/');
    }
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to the first page when performing a new search
  };

  const paginate = (array, page_size, page_number) => {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
  };

  const filteredData = Array.from(data.members).filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.father.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.cnic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.semester.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.batch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [register, setRegister] = useState({
    name: "", father: "", department: "", batch: "",
    semester: "", cnic: "", rollNo: "", email: ""
  });

  const handleChange1 = (e) => {
    const { name, value } = e.target;
    const trimmedValue = value.replace(/\s+/g, ' '); // Remove consecutive spaces and trim

    setRegister((prevRegister) => ({
      ...prevRegister,
      [name]: trimmedValue,
    }));
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

  const handleClose = () => {
    setRegister({
      name: "", father: "", department: "", batch: "",
      semester: "", cnic: "", rollNo: "", email: ""
    })
  }

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

  const location = useLocation();
  const [userData, setUserData] = useState({ member: [] })
  const pathsWithoutSidebar = ['/', '/committeeMain', '/committeeMain/members', '/committeeMain/student'];

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
      <div className="register"  >
        <style>{style}</style>
        <div className="modal fade" id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" >Register</h5>
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
                    <label htmlFor="name" className="form-label">
                      Father Name
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-user"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="father"
                        name="father"
                        value={register.father}
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
                    <label htmlFor="department" className="form-label">
                      {" "}
                      Batch{" "}
                    </label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="fas fa-building"></i></span>
                      <select
                        type="text"
                        className="form-control"
                        id="batch"
                        name="batch"
                        value={register.batch}
                        onChange={handleChange1}
                      >
                        <option value="">Select Batch</option>
                        <option value="2018-2022">2018-2022</option>
                        <option value="2019-2023">2019-2023</option>
                        <option value="2020-2024">2020-2024</option>
                        <option value="2021-2025">2021-2025</option>
                      </select>
                    </div>
                  </div>
                  <div className="col">
                    <label htmlFor="name" className="form-label">
                      Roll No
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i class="fa-solid fa-user-graduate"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="rollNo"
                        name="rollNo"
                        value={register.rollNo}
                        onChange={handleChange1}
                      />
                      {rollNoError && <div className="alert alert-danger" role="alert">
                        Roll No should be in XXXX-BSCS-XX format
                      </div>}
                    </div>
                  </div>

                  <div className="col">
                    <label htmlFor="name" className="form-label">
                      Cnic
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i class="fa-solid fa-address-card"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="cnic"
                        name="cnic"
                        value={register.cnic}
                        onChange={handleChange1}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="semester" className="form-label">
                      {" "}
                      Semester{" "}
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i class="fa-light fa-cassette-betamax"></i>
                      </span>
                      <select
                        type="text"
                        className="form-control"
                        id="semester"
                        name="semester"
                        value={register.semester}
                        onChange={handleChange1}
                      >
                        <option value="">Select Semester</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                      </select>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={() => { setEditMode(false); handleClose() }}>Close</button>
                    {editMode ? (
                      <button type="submit" className="btn btn-primary" disabled={!(register.name)
                        || !(register.department)
                      }>Save Changes</button>
                    ) : (
                      <button type="submit" className="btn btn-success" disabled={!(register.name)
                        || !(register.department)
                      }>
                        Register
                      </button>
                    )}</div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (<Loading />) : (<>
        <div className='container' style={{ width: "90%" }}>
          <h3 className='text-center' >Student List</h3>
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
              placeholder="Search...."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          {filteredDataPaginated.length > 0 ? (
            <table className="table text-center table-hover">
              <thead>
                <tr >
                  <th scope="col">Name</th>
                  <th scope="col">Father</th>
                  <th scope="col">Roll#</th>
                  <th scope="col">Batch</th>
                  <th scope="col">Semester</th>
                  <th scope="col">Cnic</th>
                  {(!showSidebar && !userData.member.isAdmin) &&
                    <>
                      <th scope="col">Edit</th>
                      <th scope="col">Remove</th>
                    </>}
                </tr>
              </thead>
              <tbody className='text-center'>
                {filteredDataPaginated.map((val, key) => (
                  <tr key={key}>
                    <td>{val.name}</td>
                    <td>{val.father}</td>
                    <td>{val.rollNo}</td>
                    <td>{val.batch}</td>
                    <td>{val.semester}</td>
                    <td>{val.cnic}</td>
                    {(!showSidebar && !userData.member.isAdmin) &&
                      <>
                        <td style={{ cursor: "pointer" }} data-toggle="modal" data-target="#exampleModal" onClick={() => openEditModal(val)}>
                          <i class="fa-solid fa-pen-to-square"></i>
                        </td>
                        <td style={{ cursor: "pointer", color: "maroon", textAlign: "center", fontSize: "25px" }} onClick={() => handleDelete(val._id)}><i class="fa-solid fa-trash"></i></td>
                      </>
                    }

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
      </>)}
    </>
  )
}

export default StudentList;