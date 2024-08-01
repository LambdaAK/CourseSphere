import { Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import $ from "jquery";
import { toast } from "react-toastify";
import { Auth, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseApp, initializeApp } from "firebase/app";
import firebaseConfig from "../../firebaseConfig";
import { Database, getDatabase } from "firebase/database";
import './login.css'; // Ensure the CSS file is imported

const app: FirebaseApp = initializeApp(firebaseConfig);
const database: Database = getDatabase(app);
const auth: Auth = getAuth();

const performLogin = () => {
  const email: string = $("#login-email-input").val();
  const password: string = $("#login-password-input").val();

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.replace("/");
    })
    .catch((e) => {
      toast.error(`Login failed: ${e.message}`);
    });
};

const LoginHeader = () => {
  return (
    <Typography
      className="login-header" 
      variant="h1"
      sx={{
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: "10px",
        marginBottom: "20px",
      }}
    >
      Login
    </Typography>
  );
};

const LoginButton = (props: { email: string; password: string }) => {
  return (
    <Button
      className="login-button" 
      variant="contained"
      disabled={props.email === '' || props.password === ''}
      onClick={() => performLogin()}
    >
      Login
    </Button>
  );
};

const LoginBox = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  return (
    <div className="login-box"> {/* Reuse the class name from SignUp.css */}
      <LoginHeader />
      <TextField
        id="login-email-input"
        label="Email"
        variant="filled"
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        sx={{ marginBottom: "1em" }}
      />
      <TextField
        id="login-password-input"
        label="Password"
        variant="filled"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        sx={{ marginBottom: "1em" }}
      />
      <LoginButton email={email} password={password} />
      <Typography
        className="login-footer" // Reuse the class name from SignUp.css
        variant="body2"
      >
        Don't have an account?{' '}
        <Button
          variant="text"
          onClick={() => window.location.href = '/signup'}
          sx={{ textDecoration: 'underline' }}
        >
          Click here to sign up.
        </Button>
      </Typography>
    </div>
  );
};

const Login = () => {
  return (
    <div className="login"> 
      <LoginBox />
    </div>
  );
};

export default Login;
