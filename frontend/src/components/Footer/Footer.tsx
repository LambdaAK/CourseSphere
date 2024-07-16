import { Typography } from '@mui/material';
import './footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <Typography variant="body2" align="center">
        © {new Date().getFullYear()} CourseSphere
      </Typography>
    </footer>
  );
}