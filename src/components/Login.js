import React, { useState } from 'react'
import image from '../images/gcu-login.jpg'
import '../css/login.css'
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
        const response = await fetch(`http://localhost:5000${props.loginRoute}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: login.username, password: login.password})
        });
        const json = await response.json()
        console.log('login json ',json);
        if (json.success && json.message){ 
            // Save the auth token and redirect
            localStorage.setItem('token', json.token); 
            props.showAlert( json.message,'success')
            history(props.path);
        }else{
            props.showAlert( json.message,'danger')
        }
    }

    return (
        <>

            <div className="container my-5 d-flex justify-content-between" style={{borderLeft:"0", borderRight:"0"}}>
                <div className="form my-2">
                    <h1 className='text-center'>{props.formHeading}</h1>
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

                        <div className="button my-4">
                            <button type="submit" className="btn btn-success btn" disabled={login.password.length < 4}>Login</button>
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
