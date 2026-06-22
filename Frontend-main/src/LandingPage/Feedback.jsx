import { IoMdPeople } from "react-icons/io";

// Function: Feedbaack.
function Feedbaack({ name, grade, univ, star, message }) {
// Render the component JSX.
  return (
    <div className="feedback">
      <div className="icon"><IoMdPeople /></div>
      {name && <h2 className='name'>{name}</h2>}
      <h2 className='grade'>{grade}</h2>
      <h4 className='univ'>{univ}</h4>
      <span className='starts'>{star}</span>
      <p className='message'>"{message}"</p>
    </div>
  )
}

export default Feedbaack;
