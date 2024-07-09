import { useState } from "react"
import "./Dashboard.css"
import { Autocomplete, Chip, TextField } from "@mui/material"
import majorOptions from "./majorOptions"
import minorOptions from "./minorOptions"

const MajorSelection = () => {

  const [selectedMajors, setSelectedMajors] = useState<string[]>([])
  
  return (
    <Autocomplete
    sx = {{
      width: 300,
    
    }}
    className = "selector"
    multiple
    limitTags={3}
    options={majorOptions}
    getOptionLabel={(option) => option}
    value={selectedMajors}
    onChange={(event, newValue: string[]) => {
      setSelectedMajors(newValue)
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
        placeholder="Choose up to 3 majors"
      />
    )}
  />
  )
}

const MinorSelection = () => {
  
    const [selectedMinors, setSelectedMinors] = useState<string[]>([])
    
    return (
      <Autocomplete
      sx = {{
        width: 300,
      
      }}
      className = "selector"
      multiple
      limitTags={3}
      options={minorOptions}
      getOptionLabel={(option) => option}
      value={selectedMinors}
      onChange={(event, newValue: string[]) => {
        setSelectedMinors(newValue)
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
          placeholder="Choose up to 3 minors"
        />
      )}
    />
    )
  
}

const yearOptions = [
  "freshman",
  "sophomore",
  "junior",
  "senior",
  "graduate"
]

const collegeOptions = [
  "College of Agriculture & Life Sciences",
  "College of Architecture, Art, and Planning",
  "College of Arts & Sciences",
  "Cornell Jeb E.",
  "College of Engineering",
  "College of Human Ecology",
  "School of Industrial and Labor Relations",
  "Cornell SC Johnson College of Business"
]


const YearSelection = () => {
  return (
    <Autocomplete
      className = "selector"
      disablePortal
      options={yearOptions}
      sx={{ width: 300 }}
      renderInput={(params) => <TextField {...params} label="Year" />}
    />
  )
}

const CollegeSelection = () => {
  return (
    <Autocomplete
      className = "selector"
      disablePortal
      options={collegeOptions}
      sx={{ width: 300 }}
      renderInput={(params) => <TextField {...params} label="College" />}
    />
  )
}

const Dashboard = () => {
  return (
    <div className = "dashboard">
      <YearSelection/>
      <MajorSelection/>
      <MinorSelection/>
      <CollegeSelection/>
    </div>
  )
}

export default Dashboard