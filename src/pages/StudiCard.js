import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Karten.css';
import getB_kennung from './getB_kennung.mjs';
const config = require('../config.js');

  function StudiCard() {
    const [studentData, setStudentData] = useState(null);
  
    useEffect(() => {
      async function fetchData() {
        try {
          const response = await axios.get('http://'+ config.api.host + ':' + config.api.port +'/api/studicard/' + getB_kennung());
          setStudentData(response.data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
  
      fetchData();
    }, []);

    const d = studentData ? new Date(studentData.geburtsdatum) : null || new Date();
    const gebdatum = d.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const d2 =studentData ? new Date(studentData.eingeschrieben_bis) : null || new Date();
    const gueltig = d2.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  return (
    <div className="Studierendenausweis">
      <div className="Kopfzeile">
        <div className="Überschrift"><h2>Universität Hamburg</h2></div>
        <div className="Überschrift"><h2>Studierendenausweis</h2></div>
      </div>
      {studentData ? (
        <div className="Studentendaten">
        <div className="restlicheDaten">
          <p><strong>Matrikelnummer:</strong> <span className="inlineH3">{studentData.matrikelnummer}</span></p>
          <p><span className="inlineH3">{studentData.name}, {studentData.vorname}</span></p>
          <p><strong>geboren am:</strong> <span className="inlineH3">{gebdatum}</span></p>
          <p><strong>ist im:</strong> <span className="inlineH3">{studentData.semester}</span> Semester</p><br/>
          <p><strong>an der Universität Hamburg immatrikuliert.</strong></p>
          <p><strong>angestrebte Abschlussprüfung/Studienfach</strong></p><br/>
          <p><span className="inlineH3"><strong style={{ fontWeight: 400 }}>{studentData.studiengang}</strong></span></p>
        </div>
        <div className="additionalInfo">
          <p><strong>gültig bis: </strong><span className="inlineH3">{gueltig}</span></p><br/>
          <br/>
          <br/>
          <p><strong>FS:</strong> <span className="inlineH3">{studentData.fachsemester}</span></p>
        </div>
      </div>
      
      
      ) : (
        <p>Lade Studentendaten...</p>
      )}
      <div className="Fusszeile"></div>
    </div>
  );
}

export default StudiCard;

