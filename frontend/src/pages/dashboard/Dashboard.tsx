import { useEffect, useState } from "react";
import "./Dashboard.css";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import majorOptions from "./majorOptions";
import minorOptions from "./minorOptions";
import SearchIcon from "@mui/icons-material/Search";
import { Database, getDatabase} from "firebase/database";
import allCourses from "../../public/courses";
import { FirebaseApp, initializeApp } from "firebase/app";
import { Auth, getAuth, onAuthStateChanged } from "firebase/auth";
import firebaseConfig from "../../firebaseConfig";
import { toast } from "react-toastify";
import $ from "jquery";

const app: FirebaseApp = initializeApp(firebaseConfig);
const database: Database = getDatabase(app)
const auth: Auth = getAuth()


const sendInfoToBackend = async (
  majors: string[], 
  minors: string[], 
  year: string, 
  college: string, 
  courses: string[], 
  about: string) => {

  // send the data to /users/info

  const user = auth.currentUser
  if (user == null) {
    alert("Not logged in")
    return
  }

  const idToken = await user.getIdToken()
  
  const data = {
    majors: majors,
    minors: minors,
    year: year,
    college: college,
    courses: courses,
    about: about,
    id_token: idToken
  }

  fetch("http://127.0.0.1:5000/users/info", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then(() => {
    toast.success("Successfully saved your information!")
  })
  .catch((e: Error) => {
    toast.error(`Failed to save your information: ${e}`)
  })

}

const MajorSelection = (props: {majors: string[], setMajors: Function}) => {
  const {majors, setMajors} = props;
  return (
    <Autocomplete
      sx={{
        width: 200,
      }}
      id = "major-output"
      className="selector"
      multiple
      limitTags={3}
      options={majorOptions}
      getOptionLabel={(option) => option}
      value={majors}
      onChange={(event, newValue: string[]) => {
        setMajors(newValue);
      }}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip variant="outlined" label={option} {...getTagProps({ index })} />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label="Major(s)"
          placeholder="Up to 3"
        />
      )}
    />
  );
};

const MinorSelection = (props: {minors: string[], setMinors: Function}) => {
  const {minors, setMinors} = props

  return (
    <Autocomplete
      sx={{
        width: 200,
      }}
      className="selector"
      multiple
      limitTags={3}
      options={minorOptions}
      getOptionLabel={(option) => option}
      value={minors}
      onChange={(event, newValue: string[]) => {
        setMinors(newValue);
      }}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip variant="outlined" label={option} {...getTagProps({ index })} />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          id = "minor-output"
          variant="outlined"
          label="Minor(s)"
          placeholder="Up to 3"
        />
      )}
    />
  );
};

const yearOptions = ["freshman", "sophomore", "junior", "senior", "graduate"];

const collegeOptions = [
  "College of Agriculture & Life Sciences",
  "College of Architecture, Art, and Planning",
  "College of Arts & Sciences",
  "Cornell Jeb E.",
  "College of Engineering",
  "College of Human Ecology",
  "School of Industrial and Labor Relations",
  "Cornell SC Johnson College of Business",
];

const YearSelection = (props: {year: string, setYear: Function}) => {
  const {year, setYear} = props
  return (
    <Autocomplete
      className="selector"
      id = "year-output"
      disablePortal 
      value = {year}
      onChange = {(event, newValue) => {
        setYear(newValue)
      }}
      options={yearOptions}
      sx={{ width: 200 }}
      renderInput={(params) => <TextField {...params} label="Year" />}
    />
  );
};

const CollegeSelection = (props: {college: string, setCollege: Function}) => {
  const {college, setCollege} = props
  return (
    <Autocomplete
      className="selector"
      id = "college-output"
      value = {college}
      onChange = {(event, newValue) => {
        setCollege(newValue)
      }}
      disablePortal
      options={collegeOptions}
      sx={{ width: 200 }}
      renderInput={(params) => {
        return <TextField {...params} label="College" />
      }}
    />);
};

const CourseList = (props: {courses: string[], handleRemove: Function}) => {
  const {courses, handleRemove} = props;
  return (
    <Box
      sx={{ flex: "1 1 auto", height: 200, width: 300, overflow: "auto" }}
    >
      <List>
        {Array.from(courses).map((course, index: any) => (
          <ListItem
            key={index}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleRemove(course)}
              >
                X
              </IconButton>
            }
          >
            <ListItemText primary={course} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

const CoursesInput = (props: {courses: string[], setCourses: Function}) => {
  const [course, setCourse] = useState<string>("");
  const {courses, setCourses} = props;

  return (
    <>
      <Grid item xs={8}>
        <Typography variant="h6" sx={{ marginBottom: 3 }}>
          Past Courses You've Taken
        </Typography>
        <Box sx={{ display: "flex", alignItems: "flex-end" }}>
          <SearchIcon
            sx={{ color: "action.active", mr: 1, my: 0.5, width: 50 }}
          />
          <Autocomplete
            options={allCourses}
            value={course}
            id = "courses-output"
            onChange={(event: any, newValue: string | null) => {
              if (newValue) {
                setCourse(newValue);
                const newSet:string[] = Array.from(courses);
                newSet.push(newValue);
                setCourses(newSet);
              }
            }}
            fullWidth
            renderInput={(params) => (
              <TextField {...params} variant="standard" label="Enter Course" />
            )}
          />
        </Box>
      </Grid>
      <Grid item xs={4}>
        <CourseList
          courses={courses}
          handleRemove={(course: string) => {
            let newSet: string[] = Array.from(courses)
            newSet = newSet.filter((c: string) => c != course)
            setCourses(newSet);
            console.log(newSet);
          }}
        />
      </Grid>
    </>
  );
};

const TellMeAboutYourself = () => {
  return (
    <Grid item xs={12}>
      <Typography variant="h6">Tell me about yourself</Typography>
      <Typography 
      variant="body2" sx={{ marginBottom: 2 }}>
        This will be used to create a personalized experience. Our model will
        extract relevant insights from this text to steer our AI to make more
        targetted recommendations. Please fill this in concisely and
        responsibly. Pricing is based on the length and how often you update
        this field.
      </Typography>
      <TextField
        id = "info-output"
        multiline
        fullWidth
        rows={4}
        placeholder="I'm interested in machine learning and artificial intelligence. I have a background in computer science and would like to learn more about the applications of AI in the healthcare industry. I'm also interested in entrepreneurship and would like to start my own company one day."
      />
    </Grid>
  );
};

const SaveButton = (props: {majors: string[], minors: string[], courses: string[]}) => {
  return (
    <Button
      variant="contained"
      sx = {{
        marginTop: "10px"
      }}
      onClick={() => {

        const about = $("#info-output").val()
        const year = $("#year-output").val()
        const college = $("#college-output").val()

        sendInfoToBackend(props.majors, props.minors, year, college, props.courses, about)

      }}
    >
      Save changes
    </Button>
  )
}

const fetchAndSetDataIfLoggedIn = async (
  setMajors: Function,
  setMinors: Function,
  setYear: Function,
  setCollege: Function,
  setCourses: Function,
) => {
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
        //setAbout(data["about"])
      }

    }

    catch (e) {
      toast.error(`Failed to fetch data: ${e}`)
    }
})
}

const Dashboard = () => {

  const [majors, setMajors] = useState<string[]>([]);
  const [minors, setMinors] = useState<string[]>([]);
  const [year, setYear] = useState<string>("");
  const [college, setCollege] = useState<string>("");
  const [courses, setCourses] = useState<string[]>([]);

  useEffect(() => {

      fetchAndSetDataIfLoggedIn(
        setMajors,
        setMinors,
        setYear,
        setCollege,
        setCourses,
      )
    }, [])
  
    

  return (
    <div className="dashboard">
      <Typography variant="h1">Edit your profile</Typography>
      <Typography variant="body1" sx={{ marginTop: 2 }}>
        We use the following information for our LLM to make the best
        recommendations.
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <MajorSelection majors = {majors} setMajors = {setMajors} />
        </Grid>
        <Grid item xs={3}>
          <MinorSelection minors = {minors} setMinors = {setMinors} />
        </Grid>
        <Grid item xs={3}>
          <YearSelection year = {year} setYear = {setYear} />
        </Grid>
        <Grid item xs={3}>
          <CollegeSelection college = {college} setCollege = {setCollege} />
        </Grid>
        <CoursesInput courses = {courses} setCourses = {setCourses} />
        <TellMeAboutYourself />
      </Grid>
      <SaveButton majors = {majors} minors = {minors} courses = {courses}/>
    </div>
  );
};

export default Dashboard;