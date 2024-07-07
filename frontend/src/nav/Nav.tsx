import { useState } from "react"
import hamburger from "./../assets/menu-burger.svg"
import "./Nav.css"
import { Button, ButtonGroup, Drawer, List, ListItem, ListItemText, Typography } from "@mui/material"

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

export default function Nav() {

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
      {['Home', 'Dashboard', 'Sign in', 'Sign up'].map((text: string) => (
        <ListItem key={text} onClick={() => window.location.href = `/${text.toLowerCase().replace(' ', '')}`}>

            <ListItemText primary={text} />

        </ListItem>
      ))}
    </List>
  </div>

  return (
    <div className="nav">
      <Button variant="outlined"
      onClick = {toggleDrawer(true)}>Open Nav</Button>
      <Drawer anchor = {"top"} open={open} onClose={toggleDrawer(false)}>
        {list()}
      </Drawer>
    </div>
  )
}



