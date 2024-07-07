import "./SignUp.css"
import $ from "jquery"


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
    <div className = "sign-up-button"
    onClick = {() => performSignup()}
    >
      Sign Up
    </div>
  )
}

const SignUpBox = () => {
  return (
    <div className = "sign-up-box">
      <SignUpHeader/>
      <input id = "signup-email-input" placeholder="email"></input>
      <input id = "signup-password-input" placeholder="password"></input>
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