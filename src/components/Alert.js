import React from 'react'

export default function Alert(props) {

    const capitilize = (word)=>{
        let i = word.charAt(0).toUpperCase();
        return i + word.slice(1)
    }


  return (
    <div>
    {props.alert &&  <div>   
         <div className={`alert alert-${props.alert.type}`} role="alert">
                 <strong>{capitilize(props.alert.type)}</strong> {props.alert.msg}.
             </div>
     </div>}
    </div>
  )
}
