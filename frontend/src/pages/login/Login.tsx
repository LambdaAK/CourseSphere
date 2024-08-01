import { Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { performLogin } from "../../api.ts";

import './login.css'; 

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
    <div className="login-box"> 
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
        className="login-footer" 
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

export default function Login() {
  return (
    <div className="login"> 
      <LoginBox />
    </div>
  );
}

