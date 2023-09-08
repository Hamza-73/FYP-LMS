import './App.css';
import React, { useState } from 'react';
import StudentMain from './components/StudentMain';
import Alert from './components/Alert';
import CommitteeMain from './components/CommitteeMain';
import SupervisorMain from './components/SupervisorMain';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import logo from './images/logo.png'

const App = () => {
  const [alert, setAlert] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation()

  const showAlert = (message, type) => {
    setAlert({ msg: message, type: type });
    setTimeout(() => setAlert(null), 2000);
  }

  const path = useNavigate();

  const handleStudent = () => {
    path('/studentMain');
  }

  const handleSupervisor = () => {
    path('/supervisorMain');
  }

  const handleCommittee = () => {
    path('/committeeMain');
  }

  const pathsWithoutSidebar = ['/'];

  // Check if the current location is in the pathsWithoutSidebar array
  const showSidebar = pathsWithoutSidebar.includes(location.pathname);

  const style = `
  body{
    
  background-color: #ceb070;
  }
  .cards{
    border:none;
  }
  .m-box{
    display : flex;
    margin-top:13%;
  }
  .boxs{
    border: 1px solid black;
    border-radius : 5px;
    margin: 8px;
    border-radius : 10px;
    height: 340px;
    width : 400px;
    display: flex;
    flex-direction : column;
    justify-content: center;
    align-items:center;
    transition : 1s ;
    padding: 20px;
    cursor:pointer;
    background : rgba(90,0,6,.7);
    background-image: linear-gradient(#00005b,#5a0006);
    color : white;
    box-shadow: 0 0 80px 80px rgba(0,0,0,.15);
    -webkit-backdrop-filter: blur(106px);
    backdrop-filter: blur(106px);
  }
  .boxs img{
    width: 60%;
    margin : 0 auto;
    margin-bottom : 10px;
  }
  .boxs:hover{
    z-index: 3;
    transform : scale(1.2);
  }
  `
  return (
    <div>
      <Alert alert={alert} />
      <Routes>
        <Route path='/studentMain/*' element={<StudentMain showAlert={showAlert} />} />
        <Route path='/supervisorMain/*' element={<SupervisorMain showAlert={showAlert} />} />
        <Route path='/committeeMain/*' element={<CommitteeMain showAlert={showAlert} />} />
      </Routes>
      {showSidebar && (
        <div>
          <style>{style}</style>
          <div className="cards text-center container">
            <div className='m-box'>
              <div className="boxs" onClick={handleCommittee}>
                <img src={logo} alt="" />
                <h5>I'm A Committee Member</h5>
              </div>
              <div className="boxs" onClick={handleSupervisor}>
                <img src={logo} alt="" />
                <h5>I'm A Supervisor</h5>
              </div>
              <div className="boxs" onClick={handleStudent}>
                <img src={logo} alt="" />
                <h5>I'm A Student</h5>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App;
