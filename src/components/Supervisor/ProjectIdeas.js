import React, { useState } from 'react'

const ProjectIdeas = () => {

  const [fypIdea, setFypIdea] = useState({
    projectTitle: '', description: '', scope: ''
  });

  const ideas = [
    {
      _id: "64f24bbe692319b37513afbb",
      students: [],
      projectTitle: "IDEA",
      description: "BANK MANAGEMENT SYSTEM",
      scope: "THIS IS SCOPE",
      status: false,
      __v: 0
    },
    {
      _id: "64f24c29639ed9120fd57794",
      supervisor: "64f1c55f957a7cb325355dce",
      students: [],
      projectTitle: "NEW IDEA",
      description: "BANK MANAGEMENT SYSTEM",
      scope: "THIS IS SCOPE",
      status: false,
      __v: 0
    },
    {
      _id: "64f24c29639ed9120fd57794",
      supervisor: "64f1c55f957a7cb325355dce",
      students: [],
      projectTitle: "NEW IDEA",
      description: "BANK MANAGEMENT SYSTEM",
      scope: "THIS IS SCOPE",
      status: false,
      __v: 0
    }
  ]

  const handleChange = (e)=>{
    setFypIdea({...fypIdea,[e.target.name]: e.target.value})
  }

  return (
    <div>

      <div className="fypIdea"  >
        <div className="modal fade" id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" >Register</h5>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Project Title</label>
                    <input type="text" className="form-control" id="projectTitle" name='projectTitle' value={fypIdea.projectTitle} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                    <input type="text" className="form-control" id="scope" name='scope' value={fypIdea.scope} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="exampleInputPassword1" className="form-label">Description</label>
                    <textarea className="form-control" id="description" name='description' value={fypIdea.description} onChange={handleChange} />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="submit" className="btn" style={{background:"maroon", color:"white"}} disabled={!fypIdea.projectTitle || !fypIdea.scope || !fypIdea.description}>
                      Add Idea
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div div className='container my-5' style={{ width: "100%" }}>
        <h3 className='text-center'>My FYP Ideas</h3>
        {ideas.length > 0 ? (
          <div>
            <div>
              <table className='table table-hover'>
                <thead style={{ textAlign: "center" }}>
                  <tr>
                    <th scope="col">Sr No.</th>
                    <th scope="col">Supervisor</th>
                    <th scope="col">Project Title</th>
                    <th scope="col">Scope</th>
                    <th scope="col">Description</th>
                  </tr>
                </thead>
                <tbody className='text-center'>
                  {ideas.map((group, groupKey) => (
                    <tr key={groupKey}>
                      <td>{groupKey + 1}</td>
                      <td>Ijaz</td>
                      <td>{group.projectTitle}</td>
                      <td>{group.description}</td>
                      <td>{group.scope}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>No matching members found.</div>
        )}
      </div>

      <div class="d-grid gap-2 d-md-flex justify-content-md-end">
        <button class="btn" data-toggle="modal" data-target="#exampleModal"style={{ background: "maroon", color: "white", position: "relative", right: "7rem" }} type="button">Add FYP Idea</button>
      </div>
    </div>
  )
}

export default ProjectIdeas
