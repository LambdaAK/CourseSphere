import Nav from '../nav/Nav';
import './header.css';

export default function Header() {
  return (
    <header className="header">
      <h1 className="header-title">CourseSphere</h1>
      <Nav />
    </header>
  );
}
