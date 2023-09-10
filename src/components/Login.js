import React, { useState } from 'react'
import image from '../images/back.jpeg'
import '../css/login.css'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

const Login = (props) => {
    const imgStyle = {
        width: "400px",
        height: "450px",
        marginLeft: "10px"
    }

    const [login, setLogin] = useState({ username: '', password: '' })


    const handleChange = (e) => {
        setLogin({ ...login, [e.target.name]: e.target.value })
    }
    

    let history = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch(`http://localhost:5000${props.loginRoute}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: login.username, password: login.password })
        });
        const json = await response.json()
        console.log('login json ', json);
        if (json.success && json.message) {
            // Save the auth token and redirect
            localStorage.setItem('token', json.token);
            setTimeout(()=>history(props.path), 800)
            
            NotificationManager.success(json.message,'',700);
        } else {
            NotificationManager.error(json.message,'',700);
        }
    }

    
    return (
        <>
            {/* Student/Supervisor/Committee heading */}
            <h1 className='text-center' style={{ "fontSize": "50px", "fontFamily":"Georgia, 'Times New Roman', Times, serif", "fontStyle":"italic"  }}>{props.formHeading}</h1> 
            <div className="container my-5 d-flex justify-content-between" style={{borderLeft:"0", borderRight:"0"}}>
                <div className="form my-2">
                    <form className='my-3' onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label id="C1" htmlFor="exampleInputusername1" className="form-label">Username</label>
                            <input type="username" placeholder="Username" className="form-control, C3" id="exampleInputusername1" aria-describedby="usernameHelp" name='username' value={login.username}   onChange={handleChange}/>
                            <p id="C2">We'll never share your username with anyone else</p>
                        </div>
                        <div className="mb-3">
                            <label id="C1" htmlFor="exampleInputPassword1" className="form-label">Password</label>
                            <input type="password" placeholder="Password" className="form-control, C3" id="exampleInputPassword1" value={login.password} name='password'  onChange={handleChange} />
                            <p id="C2">password should be of atleast 4 characters </p>
                        </div>
                        <Link to={`/${props.user}/forgotpassword`} style={{ "textDecoration": "none", "color":"black", "fontFamily":"Georgia, 'Times New Roman', Times, serif", "fontStyle":"italic" }}>Forgot Password?</Link>

                        <div className="button my-4">
                            <button id="C4" type="submit" className="btn btn-success btn" disabled={login.password.length < 4}>Login</button>
                        </div>
                    </form>
                </div>
                <div className="image">
                    <img src={image} alt="GCU GOTHIC LADY" style={imgStyle} />
                </div>
                <NotificationContainer />

            </div>
        </>
    )
}

export default Login