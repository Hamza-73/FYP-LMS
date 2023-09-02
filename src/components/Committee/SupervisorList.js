import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loading from '../Loading';

const SupervisorList = (props) => {
  const history = useNavigate();

  const [data, setData] = useState({ members: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/supervisor/create", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: register.name, username: register.username, designation: register.designation,
          password: register.password, department: register.department, slots: register.slots
        })
      });
      const json = await response.json()
      console.log(json);
      if (json.success) {
        // Save the auth token and redirect
        localStorage.setItem('token', json.token);
        props.showAlert(`Account created successfully`, 'success')
        // history("/"); 
        setData(prevData => ({
          ...prevData,
          members: [...prevData.members, {
            name: register.name, username: register.username, designation: register.designation,
            password: register.password, department: register.department, slots: register.slots
          }]
        }));

        // Clear the register form fields
        setRegister({ name: "", username: "", department: "", designation: "", password: "", slots: "" });

      }
      else {
        props.showAlert(`Wrong credentials`, 'danger')
      }
    } catch (error) {
      props.showAlert('Internal Server Error', 'danger')
    }
  }

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setEditMode(true); // Set edit mode when opening the modal
    setRegister({
      name: student.name, username: student.username, department: student.department,
      designation: student.designation, slots: student.slots, password: student.password
    });
  };


  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      console.log('selected Student is ', selectedStudent, ' type of ', typeof selectedStudent._id)
      const id = selectedStudent._id;
      console.log('id is ', id)

      const response = await axios.put(
        `http://localhost:5000/supervisor/edit/${id}`, // Assuming _id is the correct identifier for a student
        {
          name: register.name, username: register.username,
          department: register.department, designation: register.designation,
          slots: register.slots, password: register.password
        },
        {
          // method:"PUT",
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const updatedStudent = await response.data;
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
          name: '', username: '', department: '', designation: '', password: '', slots: ''
        });
      }

    } catch (error) {
      console.log('Error:', error); // Log the error message
      alert(`Some error occurred: ${error.message}`, 'danger');
    }
  };


  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this student?');
    if (confirmed) {

      try {

        console.log('id is ', id)
        const response = await axios.delete(
          `http://localhost:5000/supervisor/delete/${id}`,
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
          props.showAlert('Student deleted successfully', 'success');
        }

      } catch (error) {
        console.log('Error:', error); // Log the error message
        alert(`Some error occurred: ${error.message}`, 'danger');
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
      console.log('students are ', json); // Log the response data to see its structure
      setData(json);
    } catch (error) {
      alert(`Some error occurred: ${error.message}`, 'danger');
    }
  }

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      history('/');

    } else {
      // Set loading to true when starting data fetch
      setLoading(true);
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

  // console.log('data is ', data)

  const filteredData = Array.from(data.members).filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [register, setRegister] = useState({
    name: "", username: "", department: "", designation: "", password: "", slots: ""
  });

  const handleChange1 = (e) => {
    setRegister({ ...register, [e.target.name]: e.target.value })
  }

  return (
    <>
      {/* REGISTER */}
      <div className="register"  >
        <div className="modal fade" id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" >Register</h5>
              </div>
              <div className="modal-body">
                <form onSubmit={editMode ? handleEdit : handleRegister}>

                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input type="text" className="form-control" id="name" name='name' value={register.name} onChange={handleChange1} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="exampleInputusername1" className="form-label">Username</label>
                    <input type="text" className="form-control" id="exampleInputusername2" name='username' value={register.username} onChange={handleChange1} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="department" className="form-label">Department</label>
                    <input type="text" className="form-control" id="department" name='department' value={register.department} onChange={handleChange1} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="department" className="form-label">Designation</label>
                    <input type="text" className="form-control" id="designation" name='designation' value={register.designation} onChange={handleChange1} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="department" className="form-label">Slots</label>
                    <input type="text" className="form-control" id="semester" name='slots' value={register.slots} onChange={handleChange1} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                    <input type="password" className="form-control" id="exampleInputPassword2" name='password' value={register.password} onChange={handleChange1} />
                    <small>password should be of atleast 4 characters </small>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                    {editMode ? (
                      <button type="submit" className="btn btn-primary">Save Changes</button>
                    ) : (
                      <button type="submit" className="btn btn-success" disabled={register.password.length < 4 || !(register.name)
                        || !(register.username) || !(register.department)
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
        <div className='container'>
          <h3 className='text-center' >Supervisor List</h3>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, department, or designation"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          {filteredData.length > 0 ? (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Department</th>
                  <th scope="col">Designation</th>
                  <th scope="col">Slots</th>
                  <th scope="col">Edit</th>
                  <th scope="col">Remove</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((val, key) => (
                  <tr key={key}>
                    <td>{val.name}</td>
                    <td>{val.department}</td>
                    <td>{val.designation}</td>
                    <td>{val.slots}</td>
                    <td style={{ cursor: "pointer" }} data-toggle="modal" data-target="#exampleModal" onClick={() => openEditModal(val)}>
                      <i class="fa-solid fa-pen-to-square"></i>
                    </td>
                    <td style={{ cursor: "pointer", color: "maroon", textAlign: "center", fontSize: "25px" }} onClick={() => handleDelete(val._id)}><i class="fa-solid fa-trash"></i></td>

                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>No matching members found.</div>
          )}
        </div>
        <div className="d-grid gap-2 col-6 mx-auto my-4">
          <button style={{background:"maroon"}} type="button" className="btn btn-danger mx-5" data-toggle="modal" data-target="#exampleModal">
            Register
          </button>
        </div>
      </>)}
    </>
  )
}

export default SupervisorList;
