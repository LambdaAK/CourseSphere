import "./SignUp.css"
import $ from "jquery"
import Button from '@mui/material/Button';
import { TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import firebaseConfig from "./../firebaseConfig"
import { FirebaseApp, initializeApp } from "firebase/app";
import { Database, getDatabase } from "firebase/database";
import { Auth, getAuth } from "firebase/auth";
import { usersCreate } from "../api";
import { Id, toast } from "react-toastify";


const app: FirebaseApp = initializeApp(firebaseConfig);
const database: Database = getDatabase(app)
const auth: Auth = getAuth()


const performSignup = () => {
  const email: string = $("#signup-email-input").val()
  const password: string = $("#signup-password-input").val()

  usersCreate(email, password)
    .then(() => {

    })
    .catch((e) => {
      toast(`Sign up failed: ${e}`, {
        position: "top-right",
        hideProgressBar: true,
        closeOnClick: true,   
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light"
        })
    })

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

const SignUpHeader = () => {
  return (
    <Typography className = "signup-header" variant="h1" sx = {{
        marginLeft: "auto",
        marginRight: "auto",
        marginBottom: "20px",
        marginTop: "10px"
      }}
    >Sign up</Typography>
  )
}

const SignUpBox = () => {

  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  return (
    <div className = "sign-up-box">
      <SignUpHeader/>
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