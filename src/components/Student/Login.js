import React, { useState } from 'react'
import image from '../../images/gcu-login.jpg'
import '../../css/login.css'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

const Login = (props) => {
    const imgStyle = {
        width: "400px",
        height: "450px",
        marginLeft: "10px"
    }

    const [login, setLogin] = useState({ username: '', password: '' })
    const [register, setRegister] = useState({ name: '', username: '', rollNo : '',  department: '', password: '' })


    const handleChange = (e) => {
        setLogin({ ...login, [e.target.name]: e.target.value })
    }
    const handleChange1 = (e) => {
        setRegister({ ...register, [e.target.name]: e.target.value })
    }

    let history = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch("http://localhost:5000/login/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: login.username, password: login.password})
        });
        const json = await response.json()
        console.log(json);
        if (json.success){ 
            // Save the auth token and redirect
            localStorage.setItem('token', json.token); 
            props.showAlert( `You've been loggen in`,'success')
            history("/student");
        }else{
            props.showAlert( `Wrong credentials`,'danger')
        }
    }

    const handleRegister = async  (e)=>{
        e.preventDefault();
        const response = await fetch("http://localhost:5000/login/register", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: register.name, username: register.username, rollNo: register.rollNo, password: register.password, department: register.department })
        });
        const json = await response.json()
        console.log(json);
        if(json.success){
        // Save the auth token and redirect
        localStorage.setItem('token', json.token);
        props.showAlert(`Account created successfully`,'success')
        history("/");
        }
        else{
            props.showAlert(`Wrong credentials`,'danger')    
        }
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
                                    <input type="text" className="form-control" id="name"  name='name' value={register.name}  onChange={handleChange1} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="exampleInputusername1" className="form-label">Username</label>
                                    <input type="text" className="form-control" id="exampleInputusername2" name='username' value={register.username}  onChange={handleChange1} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="department" className="form-label">Department</label>
                                    <input type="text" className="form-control" id="department" name='department' value={register.department}  onChange={handleChange1} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="department" className="form-label">Roll No.</label>
                                    <input type="text" className="form-control" id="rollNO" name='rollNo' value={register.rollNo}  onChange={handleChange1} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                                    <input type="password" className="form-control" id="exampleInputPassword2" name='password' value={register.password}  onChange={handleChange1} />
                                    <small>password should be of atleast 4 characters </small>
                                </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                <button type="submit" className="btn btn-success" disabled={register.password.length < 4 || !(register.name) || !(register.username)}>Register</button>
                            </div>
                                </form>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
            <h1 className='text-center' style={{ "fontSize": "56px" }}>FYP COMMITTEE</h1>
            <div className="container my-5 d-flex justify-content-between">
                <div className="form my-2">
                    <h1 className='text-center'>FYP PROCTORING</h1>
                    <form className='my-3' onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="exampleInputusername1" className="form-label">Username</label>
                            <input type="username" className="form-control" id="exampleInputusername1" aria-describedby="usernameHelp" name='username' value={login.username}   onChange={handleChange}/>
                            <div id="usernameHelp" className="form-text">We'll never share your username with anyone else.</div>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                            <input type="password" className="form-control" id="exampleInputPassword1" value={login.password} name='password'  onChange={handleChange} />
                            <small>password should be of atleast 4 characters </small>
                        </div>
                        <Link to="/forgotpassword" style={{ "textDecoration": "none" }}>Forgot Password?</Link>

                        {  // eslint-disable-next-line   
                            
                        }
                        <div className="button my-4">
                            <button type="submit" className="btn btn-success btn" disabled={login.password.length < 4}>Login</button>
                            <button type="button" className="btn btn-danger mx-5" data-toggle="modal" data-target="#exampleModal">
                                Register
                            </button>
                        </div>
                    </form>
                </div>
                <div className="image">
                    <img src={image} alt="GCU GOTHIC LADY" style={imgStyle} />
                </div>

            </div>
        </>
    )
}

export default Login
