import { Button, TextField, Typography } from "@mui/material"
import { useState } from "react"
import $ from "jquery"
import { usersCreate } from "../api"
import { toast } from "react-toastify"
import { Auth, getAuth, signInWithEmailAndPassword } from "firebase/auth"
import { FirebaseApp, initializeApp } from "firebase/app"
import firebaseConfig from "../firebaseConfig"
import { Database, getDatabase } from "firebase/database"


const app: FirebaseApp = initializeApp(firebaseConfig);
const database: Database = getDatabase(app)
const auth: Auth = getAuth()

const performSignIn = () => {

  const email: string = $("#signup-email-input").val()
  const password: string = $("#signup-password-input").val()

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.replace("/")
    })
    .catch((e) => {
      toast.error(`Sign in failed: ${e}`)
    })
}

const SignInHeader = () => {
  return (
    <Typography className = "signin-header" variant="h1" sx = {{
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: "20px",
      }}
    >Sign in</Typography>
  )
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
    onClick = {() => performSignIn()}
    >Sign in</Button>
  )
}

const SignInBox = () => {

  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  return (
    <div className = "sign-up-box">
      <SignInHeader/>
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