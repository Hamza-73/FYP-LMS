import React, { useContext, useState } from 'react'
import { projectContext } from '../context/projects/ProjectState.js'


const SubmitProject = () => {
// eslint-disable-next-line 
    const {projects, createProject} = useContext(projectContext)

    const [text, setText] = useState({
        title:'',
        description:""
    })

    const handleChange = (e)=>{
        setText({...text, [e.target.name]: e.target.value})
    }

    const handleClick = (e)=>{
        e.preventDefault()
        createProject(text.title,text.description)
        setText({title:"", description:""})
    }

    return (
        <div>
            <form onSubmit={handleClick}>
                <div className="mb-3">
                    <label htmlFor="exampleInputEmail1" className="form-label">Title</label>
                    <input type="text" className="form-control" id="exampleInputEmail1" name='title' value={text.title} balu aria-describedby="emailHelp" onChange={handleChange} />
                    <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
                </div>
                <div className="mb-3">
                    <label htmlFor="exampleInputPassword1" className="form-label">Description</label>
                    <input type="text" className="form-control" id="exampleInputPassword1" value={text.description} name='description' onChange={handleChange} />
                </div>
                <div className="mb-3 form-check">
                    <input type="checkbox" className="form-check-input" id="exampleCheck1" />
                    <label className="form-check-label" htmlFor="exampleCheck1">Check me out</label>
                </div>
                <button type="submit" className="btn btn-primary" >Submit</button>
            </form>
        </div>
    )
}

export default SubmitProject
