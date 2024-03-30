import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState } from 'react'
import Startseite from "./pages/Startseite";
import Navbar from "./pages/Navbar";
import Login from "./pages/Login";
import Einstellungen from "./pages/Einstellungen";
import Impressum from "./pages/Impressum";
import StudiCard from "./pages/StudiCard";
import Bibliotheksausweis from "./pages/Bibliotheksausweis";
import Semesterticket from "./pages/Semesterticket";
import Mensakarte from "./pages/Mensakarte";
const config = require('./config.js');

function App () {
  const [loggedIn, setLoggedIn] = useState(false)
  const [b_kennung, setB_kennung] = useState('')

  useEffect(() => {
    // Holt die Benutzer-B-Kennung und das Token aus dem lokalen Speicher
    const user = JSON.parse(localStorage.getItem('user'))
  
    // Wenn das Token/B-Kennung nicht existiert, markieren Sie den Benutzer als ausgeloggt
    if (!user || !user.token) {
      setLoggedIn(false)
      return
    }
  
    // Wenn das Token existiert, überprüfen Sie es mit API, ob es gültig ist
    fetch('http://'+ config.api.host + ':' + config.api.port +'/verify', {
      method: 'POST',
      headers: {
        'jwt-token': user.token,
      },
    })
      .then((r) => r.json())
      .then((r) => {
        setLoggedIn('success' === r.message)
        setB_kennung(user.b_kennung || '')
      })
  }, [])
  
  return (
    <Router>
      <div className="App">
        <Navbar/>
        <div className="content">
          <Routes>
            <Route path="/Startseite" element={<Startseite b_kennung={b_kennung} loggedIn={loggedIn} setLoggedIn={setLoggedIn}/>}/>
            <Route path="/" element={<Navigate to="/Login"/>} />
            <Route path="/Login" element={<Login setLoggedIn={setLoggedIn} setB_kennung={setB_kennung} />} />
            <Route path="/Einstellungen" element={<Einstellungen b_kennung={b_kennung} loggedIn={loggedIn} setLoggedIn={setLoggedIn}/>}/>
            <Route path="/Impressum" element={<Impressum b_kennung={b_kennung} loggedIn={loggedIn} setLoggedIn={setLoggedIn}/>}/>
            <Route path="/StudiCard" element={<StudiCard b_kennung={b_kennung} loggedIn={loggedIn} setLoggedIn={setLoggedIn}/>}/>
            <Route path="/Bibliotheksausweis" element={<Bibliotheksausweis b_kennung={b_kennung} loggedIn={loggedIn} setLoggedIn={setLoggedIn}/>}/>
            <Route path="/Semesterticket" element={<Semesterticket b_kennung={b_kennung} loggedIn={loggedIn} setLoggedIn={setLoggedIn}/>}/>
            <Route path="/Mensakarte" element={<Mensakarte b_kennung={b_kennung} loggedIn={loggedIn} setLoggedIn={setLoggedIn}/>}/>
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App;