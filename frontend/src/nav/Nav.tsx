import { useState } from "react"
import hamburger from "./../assets/menu-burger.svg"
import "./Nav.css"
import { Button, ButtonGroup } from "@mui/material"

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

  return (
    <div className="nav">
      <NavButton toggleVisible = {toggleVisible}/>
      <NavLinks visible = {visible}/>
    </div>
  )
}

