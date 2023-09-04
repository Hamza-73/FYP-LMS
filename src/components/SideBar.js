import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import image1 from '../images/logo.ico'
import axios from 'axios'

const SideBar = (props) => {
    let history = useNavigate()
    const handleLogout = () => {
        localStorage.removeItem('token')
        console.log('Logout successfully localStorage is :', localStorage.getItem('token'))
        history('/')
    }

    const [userData, setUserData] = useState({member:[]});
    const [loading,setLoading] = useState(false);

    useEffect(() => {
        const getDetail = async () => {
          try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
              console.log('token not found');
              return;
            }
            
            const response = await fetch(`http://localhost:5000/supervisor/detail`, {
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
              console.log('User data is: ', json);
              setUserData(json);
              setLoading(false)
            }
          } catch (err) {
            console.log('error is in sidebar: ', err);
          }
        };
      
        if (localStorage.getItem('token')) {
            setTimeout(()=>{
                getDetail();
                console.log('user data is in ', userData)
                console.log('user data is in ', userData.member)
            },2000)
        }
      }, []); // Empty dependency array to run the effect only once    

    return (
        <>
            <nav className="navbar navbar-expand-lg bg-body-tertiary text-dark">
                <div className="container-fluid">
                    <p className="navbar-brand" to='/dashboard' ><img src={image1} alt="" style={{ "width": "60px", "cursor": "pointer" }} /></p>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link active" aria-current="page" to={`/${props.link1}`} >{props.title1}</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to={`/${props.link2}`}>{props.title2}</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to={`/${props.link3}`}>{props.title3}</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to={`/${props.link4}`}>{props.title4}</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to={`/${props.link5}`}>{props.title5}</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to={`/${props.link6}`}>{props.title6}</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to={`/${props.link7}`}>{props.title7}</Link>
                            </li>
                            {/* <li className="nav-item dropdown">
                                <Link className="nav-link dropdown-toggle" to='/' role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    {props.title0}
                                </Link>
                                <ul className="dropdown-menu">
                                    <li><Link className="dropdown-item" to='/'>Action</Link></li>
                                    <li><Link className="dropdown-item" to='/'>Another action</Link></li>
                                    <li><hr className="dropdown-divider"/></li>
                                    <li><Link className="dropdown-item" to='/'>Something else here</Link></li>
                                </ul>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link disabled" aria-disabled="true">Disabled</Link>
                            </li> */}
                        </ul>
                        <form className={`d-flex ${!localStorage.getItem('token') ? 'd-none' : ''} `} role="search">
                            <h6 className={`text-center`}>{!loading? (userData? userData.member.username: "username") : 'loading...'}<br /> BS Computer Science</h6>
                            <button style={{ background: "maroon", color: "white" }} className="btn mx-3" type="button" onClick={handleLogout}>Logout</button>
                        </form>
                    </div>
                </div>
            </nav>
        </>
    )
}
SideBar.defaultProps = {
    title5: "",
    title6: "",
    title7: "",
    link5: "/",
    link6: "/",
    link7: "/",
}
export default SideBar