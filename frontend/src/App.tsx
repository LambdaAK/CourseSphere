


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD_i3HIL4SYkf2AEmKWs2dunhq7m1Glbc4",
  authDomain: "coursesphere-8bd9a.firebaseapp.com",
  projectId: "coursesphere-8bd9a",
  storageBucket: "coursesphere-8bd9a.appspot.com",
  messagingSenderId: "728789297654",
  appId: "1:728789297654:web:6b699e8b5ebebc8a8d3fd7",
  measurementId: "G-PM7PMGBE0R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);




function App() {

  return (
    <>
      <h1>Welcome to CourseSphere</h1>
    </>
  )
}

export default App

