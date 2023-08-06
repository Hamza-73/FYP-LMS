import React from 'react'
import {Link, useNavigate} from 'react-router-dom'
import image1 from '../images/logo.ico'

const SideBar = (props) => {
    let history = useNavigate()
    const handleLogout = ()=>{
        localStorage.removeItem('token')
        console.log('Logout successfully localStorage is :', localStorage.getItem('token'))
        history('/')
    }

    return (
        <>
            <nav className="navbar navbar-expand-lg bg-body-tertiary text-light">
                <div className="container-fluid">
                    <Link className="navbar-brand" to='/'><img src={image1} alt="" style={{"width":"60px"}} /></Link>
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
                            <li className="nav-item dropdown">
                                <Link className="nav-link dropdown-toggle" to='/' role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Dropdown
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
                            </li>
                        </ul>
                        <form className="d-flex" role="search">
                            <button className="btn btn-success">{props.username}</button>
                                <button className="btn btn-warning btn-sm " type="button" onClick={handleLogout}>Logout</button>
                        </form>
                    </div>
                </div>
            </nav>
        </>
    )
}

export default SideBar
