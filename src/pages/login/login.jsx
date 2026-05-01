import React from 'react'
import "./login.css"
import assets from '../../assets/assets'
import { useState } from 'react'
import { signup, login } from '../../config/firebase'

const Login = () => {
    const [currState, setCurrState] = useState("Sign up");
    const [userName, setuserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onSubmitHandler = (event) => {
        event.preventDefault();
        if (currState === "Sign up") {
            signup(userName, email, password)
        }
        else{
            login(email, password)
        }
    }
    
  return (

    
    <div className='login'>
        <img src={assets.Logo} alt="" className='logo' style={{height: '100vh'}} />
        <form onSubmit={onSubmitHandler} className="login-form">
            <h2>{currState}</h2>
            {currState ==="Sign up" ? <input onChange={(e)=>setuserName(e.target.value)} value={userName} type="text" placeholder='Username' className="forminput" required/> : null }
            <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" placeholder='Email' className="forminput" required/> 
            <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" placeholder='Password' className="forminput" required/>
            <div className='login-term' required>
                
                <div className='why'>
                    <div style={{display:'flex',justifyContent:'space-between'}}>
                        <input type="checkbox"/>
                        <p>I agree to the Terms & Conditions </p>
                    </div>
                    
                    <p>(it’s not that deep, but here’s <a href='https://share.google/e5ImaAF492Vrv4hOE' target="_blank"  style={{ textDecoration: "none" }} className='thing' >the thing…</a>)</p>
                </div>
            </div>
            <button>{currState}</button>
            
            <div className="login-forgot">
                {currState === "Sign up" ?
                 <p>Already have an Account? <span onClick={()=>setCurrState("Log In")}>Login here!</span></p>:
                  <p>Don't Have an Account? <span onClick={()=>setCurrState("Sign up")}>Click here!</span></p>}
                <p>Forgot Password? <span>Click here!</span></p>
            </div>
        </form>

    </div>
  )
}

export default Login