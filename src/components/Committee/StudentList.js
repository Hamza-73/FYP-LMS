import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loading from '../Loading';

const StudentList = (props) => {
  const history = useNavigate();

  const [data, setData] = useState({ members: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editMode, setEditMode] = useState(false);



  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/login/register", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: register.name, cnic: register.cnic, batch: register.batch, semester: register.semester,
          username: register.username, rollNo: register.rollNo, password: register.password, department: register.department,
          father: register.father
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
            name: register.name, father: register.father, username: register.username, department: register.department,
            batch: register.batch, semester: register.semester, cnic: register.cnic, rollNo: register.rollNo,
          }]
        }));

        // Clear the register form fields
        setRegister({ name: "", father: "", username: "", department: "", batch: "", semester: "", password: "", cnic: "", rollNo: "", });
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
      name: student.name, father: student.father, username: student.username, department: student.department, batch: student.batch, semester: student.semester, cnic: student.cnic, rollNo: student.rollNo,
    });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      console.log('selected Student is ', selectedStudent, ' type of ', typeof selectedStudent._id)
      const id = selectedStudent._id;
      console.log('id is ', id)

      const response = await axios.put(`http://localhost:5000/login/edit/${id}`, // Assuming _id is the correct identifier for a student
        {
          name: register.name, father: register.father, username: register.username,
          department: register.department, batch: register.batch, semester: register.semester,
          cnic: register.cnic, rollNo: register.rollNo, password: register.password
        },
        {
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
          name: '', father: '', username: '', department: '', batch: '', semester: '', password: '', cnic: '', rollNo: '',
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
        const response = await axios.delete(`http://localhost:5000/login/delete/${id}`,
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
      const response = await axios.get("http://localhost:5000/login/get-students", {
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
      getMembers()
        .then(() => {
          // Once data is fetched, set loading to false
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false); // Handle error cases
          console.error('Error fetching data:', error);
        });
    } else {
      history('/');
    }
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // console.log('data is ', data)

  // const members = [{
  //   name: "Hamza", father: "Khan", username: "hamza", department: "CS", batch: "2021", semester: "9", password: "1234", cnic: "35202-27891-101", rollNO: "0072",
  // }, {
  //   name: "Hamza", father: "Khan", username: "hamza", department: "CS", batch: "2021", semester: "9", password: "1234", cnic: "35202-27891-101", rollNO: "0072",
  // }, {
  //   name: "Hamza", father: "Khan", username: "hamza", department: "CS", batch: "2021", semester: "9", password: "1234", cnic: "35202-27891-101", rollNO: "0072",
  // }, {
  //   name: "Hamza", father: "Khan", username: "hamza", department: "CS", batch: "2021", semester: "9", password: "1234", cnic: "35202-27891-101", rollNO: "0072",
  // },]

  const filteredData = Array.from(data.members).filter((member) =>
    // const filteredData = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.father.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.cnic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.semester.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.batch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [register, setRegister] = useState({
    name: "", father: "", username: "", department: "", batch: "",
    semester: "", password: "", cnic: "", rollNo: "",
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
                  </div><div className="mb-3">
                    <label htmlFor="name" className="form-label">Father Name</label>
                    <input type="text" className="form-control" id="father" name='father' value={register.father} onChange={handleChange1} />
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
                    <label htmlFor="department" className="form-label">Batch</label>
                    <input type="text" className="form-control" id="batch" name='batch' value={register.batch} onChange={handleChange1} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="department" className="form-label">Roll #</label>
                    <input type="text" className="form-control" id="rollNo" name='rollNo' value={register.rollNo} onChange={handleChange1} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="department" className="form-label">Cnic</label>
                    <input type="text" className="form-control" id="cnic" name='cnic' value={register.cnic} onChange={handleChange1} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="department" className="form-label">Semester</label>
                    <input type="text" className="form-control" id="semester" name='semester' value={register.semester} onChange={handleChange1} />
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
          <h3 className='text-center' >Student List</h3>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search...."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          {filteredData.length > 0 ? (
            <table className="table text-center table-hover">
              <thead>
                <tr >
                  <th scope="col">Name</th>
                  <th scope="col">Father</th>
                  <th scope="col">Roll#</th>
                  <th scope="col">Batch</th>
                  <th scope="col">Username</th>
                  <th scope="col">Semester</th>
                  <th scope="col">Cnic</th>
                  <th scope="col">Edit</th>
                  <th scope="col">Remove</th>
                </tr>
              </thead>
              <tbody className='text-center'>
                {filteredData.map((val, key) => (
                  <tr key={key}>
                    <td>{val.name}</td>
                    <td>{val.father}</td>
                    <td>{val.rollNo}</td>
                    <td>{val.batch}</td>
                    <td>{val.username}</td>
                    <td>{val.semester}</td>
                    <td>{val.cnic}</td>
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

export default StudentList;
