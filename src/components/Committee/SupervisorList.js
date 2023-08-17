import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SupervisorList = (props) => {

  const history = useNavigate();

  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

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
      console.log(json); // Log the response data to see its structure
      setData(json);
    } catch (error) {
      alert(`Some error occurred: ${error.message}`, 'danger');
    }
  }

  useEffect(() => {
    if (localStorage.getItem('token')) {
      getMembers();
    } else {
      history('/')
    }
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };


  const members = [{
    name: 'Sufyan',  department: "CS", designation: "President" , slots:"4"
  }, {
    name: 'Hamza',  department: "CSE", designation: "President" , slots:"4"
  }, {
    name: 'Hamid',  department: "CS", designation: "President" , slots:"4"
  },]

  const filteredData = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.slots.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [register, setRegister] = useState({
    name: "",
    username: "",
    department: "",
    designation: "",
    password: "",
    slots:""

  });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/supervisor/create", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: register.name, username: register.username, designation: register.designation, password: register.password, department: register.department, slots:register.slots })
    });
    const json = await response.json()
    console.log(json);
    if (json.success) {
      // Save the auth token and redirect
      localStorage.setItem('token', json.token);
      props.showAlert(`Account created successfully`, 'success')
      // history("/");
    }
    else {
      props.showAlert(`Wrong credentials`, 'danger')
    }
    } catch (error) {
      props.showAlert('Internal Server Error', 'danger')
    }
    


  }

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
                <form onSubmit={handleRegister}>

                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input type="text" className="form-control" id="name" name='name' value={register.name} onChange={handleChange1} />
                  </div><div className="mb-3">
                    <label htmlFor="name" className="form-label">Slots</label>
                    <input type="text" className="form-control" id="slots" name='slots' value={register.slots} onChange={handleChange1} />
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
                    <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                    <input type="password" className="form-control" id="exampleInputPassword2" name='password' value={register.password} onChange={handleChange1} />
                    <small>password should be of atleast 4 characters </small>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="submit" className="btn btn-success" disabled={register.password.length < 4 || !(register.name) || !(register.slots) || !(register.username) || !(register.department) || !(register.designation)}>Register</button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      </div>


      <div className='container'>
        <h3 className='text-center' style={{ borderBottom: "1px solid rgb(187, 174, 174)" }} >Supervisor List</h3>
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
                  <td>Edit</td>
                  <td>Remove</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>No matching members found.</div>
        )}
      </div>
      <div className="d-grid gap-2 col-6 mx-auto my-4">
        <button type="button" className="btn btn-danger mx-5" data-toggle="modal" data-target="#exampleModal">
          Register
        </button>
      </div>
    </>
  )
}

export default SupervisorList;