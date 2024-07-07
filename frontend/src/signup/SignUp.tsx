import "./SignUp.css"
import $ from "jquery"
import Button from '@mui/material/Button';
import { TextField } from "@mui/material";

const performSignup = () => {
  const email: string = $("#signup-email-input").val()
  const password: string = $("#signup-password-input").val()

  alert(`Signing up with email: ${email} and password: ${password}`)
}

const SignUpHeader = () => {
  return (
    <div className = "sign-up-header">
      Sign Up
    </div>
  )
}

const SignUpButton = () => {
  return (
    <Button style = {
      {
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: "20px",
      }
    } variant="contained"
    
    onClick = {() => performSignup()}
    >Sign up</Button>
  )
}

const SignUpBox = () => {
  return (
    <div className = "sign-up-box">
      <TextField id="signup-email-input" label="Email" variant="filled" />
      <TextField id="signup-password-input" label="Password" variant="filled" />
      <SignUpButton/>
    </div>
  )
}

const SignUp = () => {
  return (
    <div className = "sign-up">
      <SignUpBox/>
    </div>
  )
}

export default SignUp