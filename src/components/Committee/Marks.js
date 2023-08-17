import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

const Marks = () => {

  const history = useNavigate()
  useEffect(() => {
    if(!localStorage.getItem('token'))
        history('/');
}, [])

  return (
    <div>
      Marks will be evaluated here
    </div>
  )
}

export default Marks