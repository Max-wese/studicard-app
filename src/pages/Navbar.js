import { Link, useNavigate } from 'react-router-dom';

const Navbar = (props) => {

  const { loggedIn} = props;
  const navigate = useNavigate()

  const onButtonClick = () => {
    if (loggedIn) {
      localStorage.removeItem('user')
      props.setLoggedIn(false)
    } else {
      navigate('/Login')
    }
  }

  return (
    <nav className="navbar">
      <Link to="/Startseite"><h2>StudiCard</h2></Link>
      <div className="links">
        <Link to="/Startseite">Startseite</Link>
        <Link to="/Einstellungen">Einstellungen</Link>
        <Link to={"/"} onClick={onButtonClick}>An-/Abmelden</Link>
      </div>
    </nav>
  );
/*
  if (props.loggedIn) {
    return (
      <nav className="navbar">
        <Link to="/Startseite"><h2>StudiCard</h2></Link>
        <div className="links">
          <Link to="/Startseite">Startseite</Link>
          <Link to="/Einstellungen">Einstellungen</Link>
          <Link to={"/"} onClick={onButtonClick}>Abmelden</Link>
        </div>
      </nav>
    );
  } else {
    return (
      <nav className="navbar">
        <Link to="/"><h2>StudiCard</h2></Link>
        <div className="links">
          <Link to="/">Startseite</Link>
          <Link to="/">Einstellungen</Link>
          <Link to={"/"} onClick={onButtonClick}>Anmelden</Link>
        </div>
      </nav>
    );
  }
*/

}

export default Navbar;