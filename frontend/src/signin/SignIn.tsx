import { Button, TextField } from "@mui/material"
import { useState } from "react"
import $ from "jquery"

const performSignin = () => {
  const email: string = $("#signup-email-input").val()
  const password: string = $("#signup-password-input").val()

  alert(`Signing in with email: ${email} and password: ${password}`)
}


const SignInButton = (props: {email: string, password: string}) => {

  return (
    <Button style = {
      {
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: "20px",
      }
    } variant={"contained"}
    disabled = {props.email == '' || props.password == ''}
    onClick = {() => performSignin()}
    >Sign in</Button>
  )
}

const SignInBox = () => {

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
      <SignInButton email={email} password={password}/>
    </div>
  )
}


const SignIn = () => {
  return (
    <div className = "sign-up">
      <SignInBox/>
    </div>
  )
}

export default SignIn