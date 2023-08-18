import React , {useEffect, useState} from 'react'
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';
import { useNavigate } from 'react-router-dom';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';

const Event = () => {
  const history = useNavigate()
  

  const [value, onChange] = useState(new Date());
  const [date, setDate] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setDate(new Date()), 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);
  return (
    <div>
      <Calendar onChange={onChange} value={value} />
      <h1>Time</h1>
      <Clock value={date} />
    </div>

  )
}

export default Event
