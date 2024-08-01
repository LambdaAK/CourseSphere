import $ from 'jquery';
import firebaseConfig from "./firebaseConfig";
import { FirebaseApp, initializeApp } from "firebase/app";
import { Database, getDatabase, set } from "firebase/database";
import { Auth, getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "react-toastify";

const app: FirebaseApp = initializeApp(firebaseConfig);
const database: Database = getDatabase(app);
const auth: Auth = getAuth();


// Helper
async function createUser (email: string, password: string) {
  const response = await fetch('http://127.0.0.1:5000/users/create', {
    method: 'POST',
    mode: "cors",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({email, password})
  });
  const json = await response.json();
  return json;
};

// Main for helper 
function performSignup() {
  const email: string = $("#signup-email-input").val();
  const password: string = $("#signup-password-input").val();

  createUser(email, password)
    .then(() => {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          window.location.replace("/");
        });
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
      });
    });
};

/**
 * This function performs the user login transaction with firebase.
 * 
 */
function performLogin() {
  const email: string = $("#login-email-input").val();
  const password: string = $("#login-password-input").val();
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.replace("/");
    })
    .catch((e) => {
      toast.error(`Login failed: ${e.message}`);
    });
}



/**
 * This function sets the profile information if the user is logged in.
 * 
 * @param setMajors 
 * @param setMinors 
 * @param setYear 
 * @param setCollege 
 * @param setCourses 
 */
async function setProfileInfoIfLoggedIn(
  setMajors: Function,
  setMinors: Function,
  setYear: Function,
  setCollege: Function,
  setCourses: Function,
  setAbout: Function
){
  onAuthStateChanged(auth, async (user) => {

    if (user == null) return

    const idToken = await user.getIdToken()

    try {
      const response = await fetch(`http://127.0.0.1:5000/users/info?id_token=${idToken}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
      })

      const data = await response.json()

      if (data["majors"]) {
        setMajors(data["majors"])
      }

      if (data["minors"]) {
        setMinors(data["minors"])
      }

      if (data["year"]) {
        //$("#year-output").val(data["year"])
        setYear(data["year"])
      }

      if (data["college"]) {
        //$("#college-output").val(data["college"])
        setCollege(data["college"])
      }

      if (data["courses"]) {
        setCourses(data["courses"])
      }

      if (data["about"]) {
        $("#info-output").val(data["about"])
        setAbout(data["about"])
      }

    }
    catch (e) {
      toast.error(`Failed to fetch data: ${e}`)
    }
})
}

/**
 * This function saves any profile changes that occurs on the user dashboard. 
 * 
 * @param majors 
 * @param minors 
 * @param courses 
 * @returns 
 */
async function saveProfileChanges (majors: string[], minors: string[], courses: string[]) {
  const user = auth.currentUser;
  if (user == null) {
    alert("Not logged in");
    return;
  }

  const about = $("#info-output").val()
  const year = $("#year-output").val()
  const college = $("#college-output").val()
  const idToken = await user.getIdToken();

  const data = {
    majors: majors,
    minors: minors,
    year: year,
    college: college,
    courses: courses,
    about: about,
    id_token: idToken
  };

  fetch("http://127.0.0.1:5000/users/info", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then(() => {
    toast.success("Successfully saved your information!");
  })
  .catch((e: Error) => {
    toast.error(`Failed to save your information: ${e}`);
  });
};

export {
  createUser,
  performSignup,
  performLogin,
  saveProfileChanges,
  setProfileInfoIfLoggedIn,
};
