import React, { useEffect, useState } from 'react'
import Navbar from './Navbar'
import SideBar from './SideBar'
import Loading from './Loading';
import axios from 'axios';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { useNavigate } from 'react-router-dom';

const Dashboard = (props) => {
  const history = useNavigate()
  
  const [rules, setRules] = useState({ rule: [] });
  const [loading, setLoading] = useState(false);
  const getRules = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authorization token not found', 'danger');
        return;
      }
      setLoading(true);
      const response = await axios.get("http://localhost:5000/committee/getrules", {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      });
      const json = await response.data;
      setRules(json);
      setLoading(false);
    } catch (error) {
      NotificationManager.error('Some Error occurred reload page/ try again');
      console.log('error', error);
    }
  }

  useEffect(() => {
    if (localStorage.getItem('token')) {
      getRules();
    } else {
      history('/');
    }
  }, []);
  
  const capitilize = (word) => {
    return word[0].toUpperCase() + word.slice(1, word.length)
  }

  return (
    <div>
      <div className='my-2 mx-4' style={{ border: "none" }}>
        {!loading ? rules.rule.map((elm, index) => {
          return (
            <div className="rules" key={index}>
              <h3 style={{ fontWeight: "600", fontFamily: " 'Libre Baskerville', sans-serif" }}>{capitilize(elm.role)}</h3>
              <ol style={{ paddingRight: "300px" }}>
                {elm.rules.map((rule, ruleIndex) => (
                  <li key={ruleIndex}>{rule}</li>
                ))}
              </ol>
            </div>
          );
        }) : <Loading />}
      </div>
        <NotificationContainer />
    </div>
  )
}

export default Dashboard
