import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import image1 from '../images/logo.ico'

const SideBar = (props) => {
    let history = useNavigate()
    const handleLogout = () => {
        localStorage.removeItem('token')
        console.log('Logout successfully localStorage is :', localStorage.getItem('token'))
        history('/')
    }

    const [userData, setUserData] = useState([])

    const getDetail = async () => {
        try {
          const token = localStorage.getItem('token');
          console.log(token)
          if (!token) {
            console.log('token not found')
            return;
          }
      
          const response = await fetch("http://localhost:5000/committee/detail", {
            method: "GET",
            headers: {
              'Content-Type': 'application/json',
              'authorization': `Bearer ${token}` // Use the Bearer token scheme
            },
          });
      
          if (!response.ok) {
            console.log('error fetching detail')
            return;
          }
      
          const json = await response.json();
          console.log('Details', json);
          setUserData(json);
        } catch (err) {
          console.error(err);
          alert('An error occurred: ' + err.message);
        }
      }
      

    useEffect(() => {
        if (localStorage.getItem('token'))
            getDetail()
        else{
            alert('error')
        }

    }, [])

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
                            <h5>{userData.username}</h5>
                            <button className="btn btn-outline-danger mx-3" type="button" onClick={handleLogout}>Logout</button>
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
    link5: "/",
    link6: "/"
}
export default SideBar
