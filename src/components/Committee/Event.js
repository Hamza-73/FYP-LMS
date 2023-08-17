import React , {useEffect, useState} from 'react'
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';
import { useNavigate } from 'react-router-dom';


const Event = () => {
  const history = useNavigate()
  useEffect(() => {
    if(!localStorage.getItem('token'))
        history('/');
}, [])

  const [value, onChange] = useState(new Date());
  return (
    <div>
      <Calendar onChange={onChange} value={value} />
    </div>
  )
}

export default Event
