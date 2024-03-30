import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import getB_kennung from './getB_kennung.mjs';
const config = require('../config.js');

function Startseite() {
    const [studentData, setStudentData] = useState(null);
  
    useEffect(() => {
      async function fetchData() {
        try {
          const response = await axios.get('http://'+ config.api.host + ':' + config.api.port +'/api/homescreen/' + getB_kennung());
          setStudentData(response.data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
  
      fetchData();
    }, []);

    return (
        <div>
            {studentData ? (
                <h1>Hallo {studentData.vorname} {studentData.name}</h1>
            ) : (
            <h1>Hallo Lade Namen...</h1>
            )}
        <div className ="Startseite">
            <Link to="/StudiCard"><button><h3>StudiCard</h3></button></Link>
            <Link to="/Bibliotheksausweis"><button><h3>Bibliotheksausweis</h3></button></Link>
            <Link to="/Semesterticket"><button><h3>Semesterticket</h3></button></Link>
            <Link to="/Mensakarte"><button><h3>Mensakarte</h3></button></Link>
            <Link to="/Impressum"><button><h3>Impressum/Lizenzen</h3></button></Link>
            <Link to="/Einstellungen"><button><h3>Einstellungen</h3></button></Link>
        </div>
        </div>
    )
}

export default Startseite;