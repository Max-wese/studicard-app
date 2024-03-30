import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QRCode from "react-qr-code";
import './Karten.css';
import getB_kennung from './getB_kennung.mjs';
const config = require('../config.js');

function Semesterticket() {
    const [studentData, setStudentData] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get('http://'+ config.api.host + ':' + config.api.port +'/api/semesterticket/' + getB_kennung());
                setStudentData(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        fetchData();
    }, []);

    const d = studentData ? new Date(studentData.geburtsdatum) : null || new Date();
    const gebdatum = d ? d.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }) : '';

    const d2 = studentData ? new Date(studentData.guetigkeitsdatum): null || new Date();
    const gueltig = d2.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    console.log(studentData);

    return (
        <div className="Semesterticket">
            <div className='head2'>
                <div className="Überschrift"><h2>Semesterticket</h2></div>
                <div className="Überschrift"><h2>hvv</h2></div>
            </div>
            {studentData ? (
                <div className="Ticketdaten">
                    <p>Matrikelnummer: {studentData.matrikelnummer}</p>
                    <p>Name: {studentData.name}, {studentData.vorname}</p>
                    <p>geboren am: {gebdatum}</p>
                    <p>Gültig bis: {gueltig}</p>
                    <p>Gültigkeitsbereich: {studentData.gueltigkeitsbereich}</p>
                    <div style={{ height: "auto", margin: "0 auto", maxWidth: 64, width: "100%" }}>
                        <QRCode
                            size={256}
                            style={{ height: "auto", maxWidth: "100%", width: "100%", padding: "20px"}}
                            value={studentData.ticket_wert}
                            viewBox={`0 0 256 256`}
                        />
                        <p>{studentData.ticket_wert}</p>
                    </div>
                </div>
            ) : (
                <p>Lade Ticketdaten...</p>
            )}
        </div>
    );
}

export default Semesterticket;