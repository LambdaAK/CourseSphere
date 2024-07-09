import { initializeApp } from "firebase/app";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from "@mui/material";
import { createTheme } from '@mui/material/styles';
import Nav from "./nav/Nav";
import Home from "./home/Home";
import Dashboard from "./dashboard/Dashboard";
import SignIn from "./signin/SignIn";
import SignUp from "./signup/SignUp";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import firebaseConfig from "./firebaseConfig";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log(app.name) // testing and my linter throws errors when stuff is not used

// Define theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#5c6bc0', // Primary color
    },
    secondary: {
      main: '#ff4081', // Secondary color
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif', // Custom font family
    h1: {
      fontSize: '2rem', // Custom font size for h1
    },
    // Add more typography settings as needed
  },
  spacing: 8, // Default spacing unit
  // Add more customizations as needed
});

export default function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <Nav />
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </Router>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </ThemeProvider>
    </>
  );
}


