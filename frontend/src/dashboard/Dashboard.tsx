import { useState } from "react";
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
import { set } from "firebase/database";
import courses from "../public/courses";

const MajorSelection = () => {
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);

  return (
    <Autocomplete
      sx={{
        width: 200,
      }}
      className="selector"
      multiple
      limitTags={3}
      options={majorOptions}
      getOptionLabel={(option) => option}
      value={selectedMajors}
      onChange={(event, newValue: string[]) => {
        setSelectedMajors(newValue);
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

const MinorSelection = () => {
  const [selectedMinors, setSelectedMinors] = useState<string[]>([]);

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
      value={selectedMinors}
      onChange={(event, newValue: string[]) => {
        setSelectedMinors(newValue);
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

const YearSelection = () => {
  return (
    <Autocomplete
      className="selector"
      disablePortal
      options={yearOptions}
      sx={{ width: 200 }}
      renderInput={(params) => <TextField {...params} label="Year" />}
    />
  );
};

const CollegeSelection = () => {
  return (
    <Autocomplete
      className="selector"
      disablePortal
      options={collegeOptions}
      sx={{ width: 200 }}
      renderInput={(params) => <TextField {...params} label="College" />}
    />
  );
};

const CourseList = ({ courses, handleRemove }) => {
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

const CoursesInput = () => {
  const [course, setCourse] = useState<string>("");
  const [selectedCourses, setSelectedCourses] = useState([] as Set);

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
            options={courses}
            value={course}
            onChange={(event, newValue) => {
              if (newValue) {
                setCourse(newValue);
                const newSet = new Set(selectedCourses);
                newSet.add(newValue);
                setSelectedCourses(newSet);
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
          courses={selectedCourses}
          handleRemove={(course: string) => {
            const newSet = new Set(selectedCourses);
            newSet.delete(course);
            setSelectedCourses(newSet);
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
      <Typography variant="body2" sx={{ marginBottom: 2 }}>
        This will be used to create a personalized experience. Our model will
        extract relevant insights from this text to steer our AI to make more
        targetted recommendations. Please fill this in concisely and
        responsibly. Pricing is based on the length and how often you update
        this field.
      </Typography>
      <TextField
        multiline
        fullWidth
        rows={4}
        placeholder="I'm interested in machine learning and artificial intelligence. I have a background in computer science and would like to learn more about the applications of AI in the healthcare industry. I'm also interested in entrepreneurship and would like to start my own company one day."
      />
    </Grid>
  );
};

const Dashboard = () => {
  return (
    <div className="dashboard">
      <Typography variant="h1">Edit your profile</Typography>
      <Typography variant="body1" sx={{ marginTop: 2 }}>
        We use the following information for our LLM to make the best
        recommendations.
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <MajorSelection />
        </Grid>
        <Grid item xs={3}>
          <MinorSelection />
        </Grid>
        <Grid item xs={3}>
          <YearSelection />
        </Grid>
        <Grid item xs={3}>
          <CollegeSelection />
        </Grid>
        <CoursesInput />
        <TellMeAboutYourself />
      </Grid>
    </div>
  );
};

export default Dashboard;
