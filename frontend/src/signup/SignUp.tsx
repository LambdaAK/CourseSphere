import "./SignUp.css"
import $ from "jquery"
import Button from '@mui/material/Button';
import { TextField } from "@mui/material";
import { useState } from "react";

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

const SignUpButton = (props: {email: string, password: string}) => {


  return (
    <Button style = {
      {
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: "20px",
      }
    } variant={"contained"}
    disabled = {props.email == '' || props.password == ''}
    onClick = {() => performSignup()}
    >Sign up</Button>
  )
}

const SignUpBox = () => {

  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  return (
    <div className = "sign-up-box">
      <TextField id="signup-email-input" label="Email" variant="filled"
        onChange = {(e) => setEmail(e.target.value)}
      />
      <br/>
      <TextField id="signup-password-input" label="Password" variant="filled"
        onChange = {(e) => setPassword(e.target.value)}
      />
      <br/>
      <SignUpButton email={email} password={password}/>
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