const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors'); // CORS csomag importálása

// Adatbázis kapcsolódás
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sos_munka'
});

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));  // A frontend URL-je
app.use(bodyParser.json());

// Regisztrációs végpont
app.post('/register', (req, res) => {
  const {
    vezeteknev,
    keresztnev,
    felhasznalonev,
    jelszo,
    email,
    telefonszam,
    telepules,
    munkaltato
  } = req.body;

  // Ha munkáltató, akkor munkasreg = 1, egyébként 0
  const munkasreg = munkaltato ? 1 : 0;

  // Aktuális dátum
  const letrehozasDatum = new Date().toISOString().slice(0, 19).replace('T', ' ');  // YYYY-MM-DD HH:MM:SS formátum

  // SQL lekérdezés a felhasználó adatainak beszúrására
  const query = `
    INSERT INTO felhasznaloi_adatok (vezeteknev, keresztnev, felhasznalonev, jelszo, emailcim, telefonszam, telepules, munkasreg, letrehozasDatum)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [vezeteknev, keresztnev, felhasznalonev, jelszo, email, telefonszam, telepules, munkasreg, letrehozasDatum], (err, result) => {
    if (err) {
      console.error('Hiba történt:', err);
      return res.status(500).json({ success: false, message: 'Hiba történt a regisztráció során' });
    }

    res.status(200).json({
      success: true,
      message: 'Regisztráció sikeres!',
      userID: result.insertId
    });
  });
});

// Szerver indítása
const PORT = 5020;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
