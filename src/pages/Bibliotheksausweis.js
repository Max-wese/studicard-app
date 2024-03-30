import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Karten.css';
import Barcode from 'react-barcode';
import getB_kennung from './getB_kennung.mjs';
const config = require('../config.js');

function Bibliotheksausweis() {
        const [studentData, setStudentData] = useState(null);
    
        useEffect(() => {
            async function fetchData() {
                try {
                    const response = await axios.get('http://'+ config.api.host + ':' + config.api.port +'/api/bibliotheksausweis/' + getB_kennung());
                    setStudentData(response.data);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
    
            fetchData();
        }, []);
    
        return (
            <div className="Bibliotheksausweis">
                <div className='head'>
                    <div className="Überschrift"><h2>Bibliotheksausweis</h2></div><br/>
                    <div className="Überschrift"><h3>Staats- und Universitätsbibliothek</h3></div>
                </div>
                {studentData ? (
                    <div className="Ausweisdaten">
                        <p>Name: {studentData.name}, {studentData.vorname}</p>
                        <Barcode className ="Barcode "value= {studentData.bibliotheksnummer} displayValue= {true} width= {3}/>
                    </div>
                ) : (
                    <p>Lade Ausweisdaten...</p>
                )}
            </div>
        );
    }

export default Bibliotheksausweis;