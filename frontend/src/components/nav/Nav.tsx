import { useEffect, useState } from 'react';
import {
  AppBar,
  Button,
  ButtonGroup,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Typography,
  Hidden,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Auth, getAuth, onAuthStateChanged } from 'firebase/auth';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Database, getDatabase } from 'firebase/database';
import firebaseConfig from '../../firebaseConfig';

const app: FirebaseApp = initializeApp(firebaseConfig);
const database: Database = getDatabase(app);
const auth: Auth = getAuth();

function NavLink(props: { text: string, path: string }) {
  return (
    <Button variant="outlined" onClick={() => window.location.href = props.path}>
      {props.text}
    </Button>
  );
}

const NavLinks = ({ isLoggedIn }: { isLoggedIn: boolean }) => (
  <ButtonGroup variant="contained" color="inherit">
    <NavLink text="Home" path="/" />
    <NavLink text="Dashboard" path="/dashboard" />
    {!isLoggedIn ? (
      <NavLink text="Login" path="/login" />
    ) : (
      <Button variant="outlined" onClick={() => {
        auth.signOut();
        window.location.replace("/");
      }}>
        Logout
      </Button>
    )}
  </ButtonGroup>
);

export default function Nav() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
    });
  }, []);

  const toggleDrawer = (open: boolean) => (event: any) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const drawerList = (
    <List>
      <ListItem button onClick={() => window.location.href = '/'}>
        <ListItemText primary="Home" />
      </ListItem>
      <ListItem button onClick={() => window.location.href = '/dashboard'}>
        <ListItemText primary="Dashboard" />
      </ListItem>
      {!loggedIn ? (
        <ListItem button onClick={() => window.location.href = '/login'}>
          <ListItemText primary="Login" />
        </ListItem>
      ) : (
        <ListItem button onClick={() => { auth.signOut(); window.location.href = '/'; }}>
          <ListItemText primary="Logout" />
        </ListItem>
      )}
    </List>
  );

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          CourseSphere
        </Typography>
        <Hidden smDown>
          <NavLinks isLoggedIn={loggedIn} />
        </Hidden>
        <Hidden smUp>
          <IconButton edge="end" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
        </Hidden>
        <Drawer anchor="top" open={drawerOpen} onClose={toggleDrawer(false)}>
          {drawerList}
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}
