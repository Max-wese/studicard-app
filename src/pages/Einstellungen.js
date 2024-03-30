import React, { useState, useEffect } from 'react';
import axios from 'axios';
import getB_kennung from './getB_kennung.mjs';
const config = require('../config.js');

function Einstellungen() {
  const [settings, setSettingsData] = useState(null);
  const [uniMail, setUniMail] = useState('');
  const [successMessage1, setSuccessMessage1] = useState('');
  const [errorMessage1, setErrorMessage1] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage2, setSuccessMessage2] = useState('');
  const [errorMessage2, setErrorMessage2] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('http://' + config.api.host + ':' + config.api.port + '/api/settings/' + getB_kennung());
        setSettingsData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  const handleInputChange1 = (event) => {
    setUniMail(event.target.value);
  };
  const handleInputChange2 = (event) => {
    setPassword(event.target.value);
  };

  const handleSave1 = () => {
    fetch('http://' + config.api.host + ':' + config.api.port + '/api/studicard/update/email/' + getB_kennung(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uni_mail: uniMail }),
    })
      .then(response => {
        if (response.ok) {
          setSuccessMessage1('Änderungen gespeichert.');
          setErrorMessage1('');
        } else {
          throw new Error('Fehler beim Speichern der Änderungen.');
        }
      })
      .catch(error => {
        setErrorMessage1(error.message);
        setSuccessMessage1('');
      });
  };
  const handleSave2 = () => {
    fetch('http://' + config.api.host + ':' + config.api.port + '/api/studicard/update/password/' + getB_kennung(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: password }),
    })
      .then(response => {
        if (response.ok) {
          setSuccessMessage2('Änderungen gespeichert.');
          setErrorMessage2('');
        } else {
          throw new Error('Fehler beim Speichern der Änderungen.');
        }
      })
      .catch(error => {
        setErrorMessage2(error.message);
        setSuccessMessage2('');
      });
  };

  return (
    <div className="Einstellungen">
      <div>
        <h1> Einstellungen</h1>
        <br />
      </div>
      <br />
      <table>
        <tbody>
          <tr>
            <td><h2>E-Mail-Adresse</h2></td>
            <td><h2>Passwort</h2></td>
          </tr>
          <tr>
            <td><p>Deine E-Mail-Adresse ist: </p></td>
            <td><p></p></td>
          </tr>
          <tr>
            {settings ? (
              <td><input type="email" placeholder={settings.uni_mail} value={uniMail} onChange={handleInputChange1}/> <br /></td>
            ) : (
              <td><input type="email" placeholder="Lade E-Mail-Adresse..."/> <br /></td>
            )}
            <td><input type="text" placeholder="Passwort" value={password} onChange={handleInputChange2}/></td>
          </tr>
          <tr>
            <td><button onClick={handleSave1}>E-Mail ändern</button><br /></td>
            <td><button onClick={handleSave2}>Passwort ändern</button></td>
          </tr>
          <tr>
            <td>{successMessage1 && <label style={{ color: 'green' }}>{successMessage1}</label>}
      {errorMessage1 && <label style={{ color: 'red' }}>{errorMessage1}</label>}</td>
            <td>{successMessage2 && <label style={{ color: 'green' }}>{successMessage2}</label>}
      {errorMessage2 && <label style={{ color: 'red' }}>{errorMessage2}</label>}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Einstellungen;