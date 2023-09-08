import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

const ForgotPassword = (props) => {


    const [text, setText] = useState({
        username : '',
        newPassword : ''
    })
    const handleChange = (e)=>{
        setText({ ...text, [e.target.name]: e.target.value });
    }
    
    let history = useNavigate();

    const handleSubmit = async  (e)=>{
        e.preventDefault();
        const response = await fetch(`http://localhost:5000/${props.detailLink}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username : text.username , newPassword : text.newPassword})
        });
        const json = await response.json()
        console.log(json);
        if(json.success){
        NotificationManager.success('Password Updated Successfully');
        setTimeout(()=>{
        history("/");
        },1500)
        }
        else{
            NotificationManager.error('User does not exist');   
        }
    }


    return (
        <div className='container  my-5'>
            <h1 className='my-3'>Update Password</h1>
            <form className='my-5 mx-3' onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="exampleInputusername1" className="form-label">Username</label>
                    <input type="text" required className="form-control" id="exampleInputusername1" aria-describedby="usernameHelp" value={text.username} name='username' onChange={handleChange}/>
                        <div id="usernameHelp" className="form-text">We'll never share your username with anyone else.</div>
                </div>
                <div className="mb-3">
                    <label for="exampleInputPassword1" className="form-label" >Password</label>
                    <input type="password" className="form-control" id="exampleInputPassword1" value={text.newPassword} name='newPassword' onChange={handleChange}/>
                </div>
                <button type="submit" disabled={text.newPassword.length<4 || !text.username} className="btn btn-warning">Submit</button>
            </form>
                <NotificationContainer />
        </div>
    )
}

export default ForgotPassword
