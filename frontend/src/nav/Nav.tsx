import { useEffect, useState } from "react"
import hamburger from "./../assets/menu-burger.svg"
import "./Nav.css"
import { Button, ButtonGroup, Drawer, List, ListItem, ListItemText, Typography } from "@mui/material"
import { Auth, getAuth, onAuthStateChanged } from "firebase/auth"
import { FirebaseApp, initializeApp } from "firebase/app"
import { Database, getDatabase } from "firebase/database"
import firebaseConfig from "../firebaseConfig"

const app: FirebaseApp = initializeApp(firebaseConfig);
const database: Database = getDatabase(app)
const auth: Auth = getAuth()

function NavButton(props: {toggleVisible: Function}) {
  return (
    <div className="nav-button"
    onClick = {() => props.toggleVisible()}
    >
      <img src={hamburger} alt="menu" className="hamburger"/>
    </div>
  )
}

function NavLink(props: {text: string, path: string}) {
  return (
    <Button variant="outlined"
    onClick = {() => window.location.href = props.path}
    > {props.text} </Button>
  )
}

function NavLinks(props: {visible: boolean}) {

  if (!props.visible) return null

  return (
    <div className = "nav-links">
      <ButtonGroup variant="contained">
      <NavLink text = "Home" path = "/"/>
      <NavLink text = "Dashboard" path = "/dashboard"/>
      <NavLink text = "Sign in" path = "signin"/>
      <NavLink text = "Sign up" path = "signup"/>
      </ButtonGroup>
    </div>
  )
}

const LoggedInAs = (props: {loggedIn: boolean, email: string}) => {
  if (props.loggedIn) return (
    <Typography className = "logged-in-as" variant="h6">
      Logged in as: {props.email}
    </Typography>
  )
  else return (
    <Typography className = "logged-in-as" variant="h6">
      Not logged in
    </Typography>
  )
}

export default function Nav() {

  const [loggedIn, setLoggedIn] = useState<boolean>(false)
  const [email, setEmail] = useState<string>("")

  useEffect(() => {
    onAuthStateChanged(auth, (user) => { 
      if (user) {
        // signed in
        setLoggedIn(true)
        if (user.email != null) {
          setEmail(user.email)
        }
      } 
      
      else {
        // not signed in
        setLoggedIn(false)
        setEmail("")
      }
    })
  }, [])

  const [visible, setVisible] = useState<boolean>(true)

  const toggleVisible = () => setVisible(!visible)

  const [open, setOpen] = useState<boolean>(false)

  const toggleDrawer = (open: boolean) => (event: any) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setOpen(open)
  }

  const list = () =>
  <div
    role="presentation"
    onClick={toggleDrawer(false)}
    onKeyDown={toggleDrawer(false)}
  >
    <List>
        <ListItem key="Home" onClick={() => window.location.href = "/"}>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem key="Dashboard" onClick={() => window.location.href = "/dashboard"}>
          <ListItemText primary="Dashboard" />
        </ListItem>
        {!loggedIn &&
        <ListItem key="Sign Up" onClick={() => window.location.href = "/signup"}>
          <ListItemText primary="Sign Up" />
        </ListItem>
        }
        {!loggedIn &&
        <ListItem key="Sign In" onClick={() => window.location.href = "/signin"}>
          <ListItemText primary="Sign In" />
        </ListItem>
        }
        {loggedIn &&
        <ListItem key="Sign Out" onClick={() => {
          auth.signOut()
          window.location.href = "/"
        }}>
          <ListItemText primary="Sign Out" />
        </ListItem>
        }

    </List>
  </div>

  return (
    <div className="nav">
      <img src={hamburger
      } alt="menu" className="hamburger"
      onClick = {toggleDrawer(true)}
      />
      <Drawer anchor = {"top"} open={open} onClose={toggleDrawer(false)}>
        {list()}
      </Drawer>
      <LoggedInAs loggedIn = {loggedIn} email = {email}/>
    </div>
  )
}



