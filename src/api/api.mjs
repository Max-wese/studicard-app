/* API-Server für die Studicard-App
  * author: Max Weseloh
  * version: 1.0.2
*/

import Express from 'express';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';

export const app = Express();
const PORT = 3001;
const DB_PATH = './src/api/studicard.db';

// Verbindung zur SQLite-Datenbank
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to database');
  }
});

// Dfiniere einen JWT-Schlüssel.
const jwtSecretKey = '29a874e06801cbf3b72d8aed7cc33ed3';

//Foriegn Key Support
db.get("PRAGMA foreign_keys = ON")

// Einstellungen für die JSON-Ausgabe untereinander
app.set('json spaces', 2)

// Middleware für das Parsen von JSON-Daten im Request-Body
app.use(Express.json());
// Middleware für das Parsen von URL-encodierten Daten im Request-Body
app.use(Express.urlencoded({ extended: true }))

// Middleware für CORS
app.use(cors());

//******************************************************* AUTH ********************************************
// Der Authentifizierungs-Endpunkt, der einen Benutzer anhand eines vorhandenen Datensatzes authentifiziert
app.post('/auth', (req, res) => {
  const { b_kennung, password } = req.body;

  // Suchen Sie den Benutzereintrag in der Datenbank
  db.get("SELECT b.b_kennung, pw_hash FROM sc_benutzer AS b WHERE b_kennung = ?", [b_kennung], (err, user) => {
    if (err) {
      console.error('Error querying database', err);
      res.status(500).json({ message: 'Error querying database' });
    } else {
      if (user) {
        // Wenn gefunden, vergleichen Sie die gehashten Passwörter und generieren Sie das JWT-Token für den Benutzer
        bcrypt.compare(password, user.pw_hash, function (_err, result) {
          if (!result) {
            return res.status(401).json({ message: 'Falsches Passwort' });
          } else {
            let loginData = {
              b_kennung,
              signInTime: Date.now(),
            };

            const token = jwt.sign(loginData, jwtSecretKey);
            res.status(200).json({ message: 'Erfolgreich', token });
          }
        });
      }
    }
  });
});


// Der Überprüfungs-Endpunkt, der überprüft, ob ein gegebener JWT-Token gültig ist
app.post('/verify', (req, res) => {
  const tokenHeaderKey = 'jwt-token'
  const authToken = req.headers[tokenHeaderKey]
  try {
    const verified = jwt.verify(authToken, jwtSecretKey)
    if (verified) {
      return res.status(200).json({ status: 'logged in', message: 'Erfolgreich' })
    } else {
      // Zugriff verweigert
      return res.status(401).json({ status: 'invalid auth', message: 'Error' })
    }
  } catch (error) {
    // Zugriff verweigert
    return res.status(401).json({ status: 'invalid auth', message: 'Error' })
  }
})

// Überprüfen Sie, ob ein Konto für eine angegebene B-Kennung vorhanden ist
app.post('/check-account', (req, res) => {
  const { b_kennung } = req.body

  console.log(req.body);

  // Überprüfen Sie, ob ein Benutzer mit der angegebenen B-Kennung vorhanden ist
  db.get("SELECT b.b_kennung FROM sc_benutzer AS b WHERE b_kennung = ?", [b_kennung], (err, row) => {
    if (err) {
      console.error('Error querying database', err);
      res.status(500).json({ status: 'Error querying database' });
    } else {
      // Wenn ein Benutzer gefunden wurde, senden Sie 'User exists', sonst 'User does not exist'
      if (row) {
        res.status(200).json({ status: 'User exists', userExists: true });
      } else {
        res.status(200).json({ status: 'User does not exist', userExists: false });
      }
    }
  });
});

//******************************************************* GET ******************************************** 
// GET-Endpoint um den Namen und Vornamen für Studicard-Datensätze abrufen
app.get('/api/homescreen/:id', (req, res) => {
  const id = req.params.id;
  const query = 'SELECT b.name, b.vorname FROM sc_benutzer AS b WHERE b.b_kennung LIKE ?;';
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else if (!row) {
      res.status(404).json({ error: 'Data not found' });
    } else {
      res.json(row);
    }
  });
});

// GET-Endpoint um alle B-Kennungen abzurufen zu denen es eine StudiCard, aber noch keinen Bibliotheksausweis gibt
app.get('/api/new-bibliotheksausweis', (req, res) => {
  const query = 'SELECT b.b_kennung FROM sc_benutzer AS b LEFT JOIN sc_bibliothek AS t ON b.b_kennung = t.b_kennung WHERE t.b_kennung IS NULL;';
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(rows);
    }
  });
});

// GET-Endpoint um alle B-Kennungen abzurufen zu denen es eine StudiCard, aber noch kein Semesterticket gibt
app.get('/api/new-semesterticket', (req, res) => {
  const query = 'SELECT b.b_kennung FROM sc_benutzer AS b LEFT JOIN sc_semesterticket AS t ON b.b_kennung = t.b_kennung WHERE t.b_kennung IS NULL;';
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(rows);
    }
  });
});

// GET-Endpoint für alle Studicard-Datensätze abrufen
app.get('/api/studicard', (req, res) => {
  const query = 'SELECT `b_kennung`, `name`, `vorname`, `semester`, `fachsemester`, `studiengang`, `matrikelnummer`, `geburtsdatum`, `startsemester` FROM `sc_benutzer` WHERE 1;'; //`uni_mail`, `status`, `eingeschrieben_bis`
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(rows);
    }
  });
});

// GET-Endpoint um einen bestimmten Studicard-Datensatz abrufen
app.get('/api/studicard/:id', (req, res) => {
  const id = req.params.id;
  const query = 'SELECT b_kennung, uni_mail, `name`, `vorname`, `semester`, `fachsemester`, `studiengang`, `matrikelnummer`, `geburtsdatum`, `startsemester`, `status`, `eingeschrieben_bis` FROM `sc_benutzer` WHERE b_kennung LIKE ?;';
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else if (!row) {
      res.status(404).json({ error: 'Data not found' });
    } else {
      res.json(row);
    }
  });
});

// GET-Endpoint um einen bestimmten Studicard-Passwort-Hash-Datensatz abrufen
app.get('/api/studicard/pw_hash/:id', (req, res) => {
  const id = req.params.id;
  const query = 'SELECT b_kennung, `pw_hash` FROM `sc_benutzer` WHERE b_kennung LIKE ?;';
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else if (!row) {
      res.status(404).json({ error: 'Data not found' });
    } else {
      res.json(row);
    }
  });
});

// GET-Endpoint um einen bestimmten Bibliotheksausweis-Datensatz abrufen
app.get('/api/bibliotheksausweis/:id', (req, res) => {
  const id = req.params.id;
  const query = 'SELECT u.b_kennung, u.name, u.vorname, b.bibliotheksnummer FROM sc_benutzer AS u INNER JOIN sc_bibliothek AS b ON u.b_kennung = b.b_kennung WHERE u.b_kennung LIKE ?;';
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else if (!row) {
      res.status(404).json({ error: 'Data not found' });
    } else {
      res.json(row);
    }
  });
});

// GET-Endpoint um einen bestimmtes Semesterticket abrufen
app.get('/api/semesterticket/:id', (req, res) => {
  const id = req.params.id;
  const query = 'SELECT b.b_kennung, b.matrikelnummer, b.name, b.vorname, b.geburtsdatum, t.gueltigkeitsbereich, t.guetigkeitsdatum, t.ticket_wert FROM sc_benutzer AS b INNER JOIN sc_semesterticket AS t ON b.b_kennung = t.b_kennung WHERE b.b_kennung LIKE ?;';
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else if (!row) {
      res.status(404).json({ error: 'Data not found' });
    } else {
      res.json(row);
    }
  });
});

// GET-Endpoint um einen bestimmtes Semesterticket zur Validierung abrufen
app.get('/api/semesterticket/validation/:id', (req, res) => {
  const id = req.params.id;
  const query = 'SELECT b.name, b.vorname, s.gueltigkeitsbereich, s.guetigkeitsdatum, s.ticket_wert FROM sc_semesterticket AS s INNER JOIN sc_benutzer AS b ON s.b_kennung = b.b_kennung WHERE ticket_wert LIKE ?;';
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else if (!row) {
      res.status(404).json({ error: 'Data not found' });
    } else {
      var v;
      var d1 = Date.parse(row.guetigkeitsdatum);
      console.log("gueltig bis in Unix Time Stamp" + d1 + 86399000);
      var d2 = Date.parse(new Date);
      console.log("Unix Time Stamp jetzt" + d2);
      if ((d1 + 86399000) >= d2) { // 86399000 = 23:59:59 gesamter Tag in Sekunden
        v = 'true'; //Semesterticket ist gültig
      } else {
        v = 'false'; //Semesterticket ist nicht gültig
      }

      const ticket = row;
      ticket.valid = v;
      console.log(ticket);
      res.json(ticket);
    }
  });
});

// GET-Endpoint um eine bestimmte Studicard-Mail nach ID für die Einstellungenabrufen
app.get('/api/settings/:id', (req, res) => {
  const id = req.params.id;
  const query = 'SELECT uni_mail FROM sc_benutzer AS b WHERE b.b_kennung LIKE ?;';
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else if (!row) {
      res.status(404).json({ error: 'Data not found' });
    } else {
      res.json(row);
    }
  });
});


//******************************************************* POST ******************************************** 
// POST-Endpoint zum Hinzufügen eines neuen StudiCard-Datensatzes
app.post('/api/studicard', (req, res) => {
  const { b_kennung, uni_mail, password, name, vorname, semester, fachsemester, studiengang, matrikelnummer, geburtsdatum, startsemester, status, eingeschrieben_bis } = req.body;
  const pw_hash = bcrypt.hashSync(password, 10);
  if (!b_kennung || !uni_mail || !pw_hash || !name || !vorname || !semester || !fachsemester || !studiengang || !matrikelnummer || !geburtsdatum || !startsemester || !status || !eingeschrieben_bis) {
    return res.status(400).json({ error: 'All values are required' });
  }

  const query = 'INSERT INTO `sc_benutzer`(`b_kennung`, `uni_mail`, `pw_hash`, `name`, `vorname`, `semester`, `fachsemester`, `studiengang`, `matrikelnummer`, `geburtsdatum`, `startsemester`, `status`, `eingeschrieben_bis`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
  db.run(query, [b_kennung, uni_mail, pw_hash, name, vorname, semester, fachsemester, studiengang, matrikelnummer, geburtsdatum, startsemester, status, eingeschrieben_bis], function (err) {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    console.log(`A new row has been inserted with ID: ${this.lastID}`);
    res.status(201).json({ id: this.lastID });
  });
});

// POST-Endpoint zum Hinzufügen eines neuen Bibliotheksausweis-Datensatzes
app.post('/api/bibliotheksausweis', (req, res) => {
  const { b_kennung, bibliotheksnummer } = req.body;
  if (!b_kennung || !bibliotheksnummer) {
    return res.status(400).json({ error: 'All values are required' });
  }

  const query = 'INSERT INTO `sc_bibliothek`(`b_kennung`, `bibliotheksnummer`) VALUES (?, ?);';
  db.run(query, [b_kennung, bibliotheksnummer], function (err) {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    console.log(`A new row has been inserted with ID: ${this.lastID}`);
    res.status(201).json({ id: this.lastID });
  });
});

// POST-Endpoint zum Hinzufügen eines neuen Semesterticket-Datensatzes
app.post('/api/semesterticket', (req, res) => {
  const { b_kennung, gueltigkeitsbereich, guetigkeitsdatum, ticket_wert } = req.body;
  if (!b_kennung || !gueltigkeitsbereich || !guetigkeitsdatum || !ticket_wert) {
    return res.status(400).json({ error: 'All values are required' });
  }

  const query = 'INSERT INTO `sc_semesterticket`(`b_kennung`, `gueltigkeitsbereich`, `guetigkeitsdatum`, `ticket_wert`) VALUES (?, ?, ?, ?);';
  db.run(query, [b_kennung, gueltigkeitsbereich, guetigkeitsdatum, ticket_wert], function (err) {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    console.log(`A new row has been inserted with ID: ${this.lastID}`);
    res.status(201).json({ id: this.lastID });
  });
});

//******************************************************* UPDATE ********************************************
// sc_benutzer update
// UPDATE-Endpoint zum Aktualisieren der E-Mailadresse einer Studicard
app.put('/api/studicard/update/email/:id', (req, res) => {
  const id = req.params.id;
  const { uni_mail } = req.body;
  if (!uni_mail) {
    return res.status(400).json({ error: 'E-Mail is required' });
  }

  const query = 'UPDATE sc_benutzer SET uni_mail = ? WHERE b_kennung = ?';
  db.run(query, [uni_mail, id], function (err) {
    if (err) {
      console.error('Error updating data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }
    console.log(`Row with ID ${id} has been updated`);
    res.sendStatus(204); // Erfolgreiche Anfrage, keine Inhalte zu senden
  });
});

// UPDATE-Endpoint zum Aktualisieren des Status eines Studierenden
app.put('/api/studicard/update/status/:id', (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const query = 'UPDATE sc_benutzer SET status = ? WHERE b_kennung = ?';
  db.run(query, [status, id], function (err) {
    if (err) {
      console.error('Error updating data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }
    console.log(`Row with ID ${id} has been updated`);
    res.sendStatus(204); // Erfolgreiche Anfrage, keine Inhalte zu senden
  });
});

// UPDATE-Endpoint zum Aktualisieren des Ende der Gueltigkeit einer Studicard
app.put('/api/studicard/update/eingeschrieben_bis/:id', (req, res) => {
  const id = req.params.id;
  const { eingeschrieben_bis } = req.body;
  if (!eingeschrieben_bis) {
    return res.status(400).json({ error: 'eingeschrieben_bis is required' });
  }

  const query = 'UPDATE sc_benutzer SET eingeschrieben_bis = ? WHERE b_kennung = ?';
  db.run(query, [eingeschrieben_bis, id], function (err) {
    if (err) {
      console.error('Error updating data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }
    console.log(`Row with ID ${id} has been updated`);
    res.sendStatus(204); // Erfolgreiche Anfrage, keine Inhalte zu senden
  });
});

// UPDATE-Endpoint zum Aktualisieren des Passworthash einer Studicard
app.put('/api/studicard/update/password/:id', (req, res) => {
  const id = req.params.id;
  const { password } = req.body;
  const pw_hash = bcrypt.hashSync(password, 10);
  if (!pw_hash) {
    return res.status(400).json({ error: 'pw_hash is required' });
  }

  const query = 'UPDATE sc_benutzer SET pw_hash = ? WHERE b_kennung = ?';
  db.run(query, [pw_hash, id], function (err) {
    if (err) {
      console.error('Error updating data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }
    console.log(`Row with ID ${id} has been updated`);
    res.sendStatus(204); // Erfolgreiche Anfrage, keine Inhalte zu senden
  });
});

//sc_ticket update
// UPDATE-Endpoint zum Aktualisieren der Ticketwert eines Semestertickets
app.put('/api/semesterticket/update/ticket_wert/:id', (req, res) => {
  const id = req.params.id;
  const { ticket_wert } = req.body;
  if (!ticket_wert) {
    return res.status(400).json({ error: 'ticket_wert is required' });
  }

  const query = 'UPDATE sc_semesterticket SET ticket_wert = ? WHERE b_kennung = ?';
  db.run(query, [ticket_wert, id], function (err) {
    if (err) {
      console.error('Error updating data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }
    console.log(`Row with ID ${id} has been updated`);
    res.sendStatus(204); // Erfolgreiche Anfrage, keine Inhalte zu senden
  });
});

// UPDATE-Endpoint zum Aktualisieren des Gueltigkeitsbereich eines Semestertickets
app.put('/api/semesterticket/update/gueltigkeitsbereich/:id', (req, res) => {
  const id = req.params.id;
  const { gueltigkeitsbereich } = req.body;
  if (!gueltigkeitsbereich) {
    return res.status(400).json({ error: 'gueltigkeitsbereich is required' });
  }

  const query = 'UPDATE sc_semesterticket SET gueltigkeitsbereich = ? WHERE b_kennung = ?';
  db.run(query, [gueltigkeitsbereich, id], function (err) {
    if (err) {
      console.error('Error updating data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }
    console.log(`Row with ID ${id} has been updated`);
    res.sendStatus(204); // Erfolgreiche Anfrage, keine Inhalte zu senden
  });
});

// UPDATE-Endpoint zum Aktualisieren des Gueltigkeitsdatum eines Semestertickets
app.put('/api/semesterticket/update/guetigkeitsdatum/:id', (req, res) => {
  const id = req.params.id;
  const { guetigkeitsdatum } = req.body;
  if (!guetigkeitsdatum) {
    return res.status(400).json({ error: 'guetigkeitsdatum is required' });
  }

  const query = 'UPDATE sc_semesterticket SET guetigkeitsdatum = ? WHERE b_kennung = ?';
  db.run(query, [guetigkeitsdatum, id], function (err) {
    if (err) {
      console.error('Error updating data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }
    console.log(`Row with ID ${id} has been updated`);
    res.sendStatus(204); // Erfolgreiche Anfrage, keine Inhalte zu senden
  });
});

//sc_bibliothek update
// UPDATE-Endpoint zum Aktualisieren der E-Mailadresse einer Studicard
app.put('/api/bibliotheksausweis/update/bibliotheksnummer/:id', (req, res) => {
  const id = req.params.id;
  const { bibliotheksnummer } = req.body;
  if (!bibliotheksnummer) {
    return res.status(400).json({ error: 'bibliotheksnummer is required' });
  }

  const query = 'UPDATE sc_bibliothek SET bibliotheksnummer = ? WHERE b_kennung = ?';
  db.run(query, [eingeschrieben_bis, id], function (err) {
    if (err) {
      console.error('Error updating data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }
    console.log(`Row with ID ${id} has been updated`);
    res.sendStatus(204); // Erfolgreiche Anfrage, keine Inhalte zu senden
  });
});

//******************************************************* DELETE ******************************************** 
// DELETE-Endpoint zum Löschen eines Datensatzes nach ID
app.delete('/api/studicard/:id', (req, res) => {
  const id = req.params.id;
  const query = 'DELETE FROM sc_benutzer WHERE b_kennung = ?';
  db.run(query, [id], function (err) {
    if (err) {
      console.error('Error deleting data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }
    console.log(`Row with ID ${id} has been deleted`);
    res.sendStatus(204); // Erfolgreiche Anfrage, keine Inhalte zu senden
  });
});

// DELETE-Endpoint zum Löschen eines Datensatzes nach ID
app.delete('/api/bibliotheksausweis/:id', (req, res) => {
  const id = req.params.id;
  const query = 'DELETE FROM sc_bibliothek WHERE b_kennung = ?';
  db.run(query, [id], function (err) {
    if (err) {
      console.error('Error deleting data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }
    console.log(`Row with ID ${id} has been deleted`);
    res.sendStatus(204); // Erfolgreiche Anfrage, keine Inhalte zu senden
  });
});

// DELETE-Endpoint zum Löschen eines Datensatzes nach ID
app.delete('/api/semesterticket/:id', (req, res) => {
  const id = req.params.id;
  const query = 'DELETE FROM sc_semesterticket WHERE b_kennung = ?';
  db.run(query, [id], function (err) {
    if (err) {
      console.error('Error deleting data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }
    console.log(`Row with ID ${id} has been deleted`);
    res.sendStatus(204); // Erfolgreiche Anfrage, keine Inhalte zu senden
  });
});

// Starte den Server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
