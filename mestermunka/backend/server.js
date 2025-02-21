const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const saltRounds = 10;
const JWT_SECRET = 'YOUR_SECRET_KEY';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sos_munka',
  port: '3307',
});

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const authenticateToken = (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token) return res.status(200).json({ success: false, message: 'Nincs bejelentkezve' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Érvénytelen token' });
    req.user = user;
    next();
  });
};

app.post('/register', (req, res) => {
  const { vezeteknev, keresztnev, felhasznalonev, jelszo, email, telefonszam, telepules, munkaltato } = req.body;
  const munkasreg = munkaltato ? 1 : 0;
  const letrehozasDatum = new Date().toISOString().slice(0, 19).replace('T', ' ');

  // Kiírjuk az érkező adatokat a log-ba
  console.log("Received registration data:", req.body);

  const query = `
    INSERT INTO felhasznaloi_adatok (vezeteknev, keresztnev, felhasznalonev, jelszo, emailcim, telefonszam, telepules, munkasreg, letrehozasDatum)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  bcrypt.hash(jelszo, saltRounds, (err, hash) => {
    if (err) {
      console.log("Jelszó hash hiba:", err);
      return res.status(500).json({ success: false, message: 'Hiba történt a jelszó hash-elése során' });
    }

    // Itt naplózunk egyértelműen, hogy mi történik a query előtt
    console.log("Executing SQL query...");

    db.query(query, [vezeteknev, keresztnev, felhasznalonev, hash, email, telefonszam, telepules, munkasreg, letrehozasDatum], (err, result) => {
      if (err) {
        // Most az egész `err` objektumot naplózzuk
        console.error('SQL hiba:', err);
        return res.status(500).json({ success: false, message: 'Hiba történt a regisztráció során', error: err.message || err });
      }

      res.status(200).json({
        success: true,
        message: 'Regisztráció sikeres!',
        userID: result.insertId
      });
    });
  });
});




app.post('/login', (req, res) => {
  const { felhasznalonev, jelszo } = req.body;

  db.query("SELECT * FROM felhasznaloi_adatok WHERE felhasznalonev = ?;", [felhasznalonev], (err, result) => {
    if (err) {
      console.error("Hiba a lekérdezés során:", err);
      return res.status(500).json({ success: false, message: "Szerverhiba!" });
    }

    if (result.length > 0) {
      bcrypt.compare(jelszo, result[0].jelszo, (error, response) => {
        if (response) {
          const token = jwt.sign({ id: result[0].id, felhasznalonev: result[0].felhasznalonev }, JWT_SECRET, { expiresIn: '1h' });

          res.cookie('authToken', token, {
            httpOnly: true,
            secure: false,  // Ha localhoston fejlesztesz, ezt állítsd false-ra!
            maxAge: 60 * 60 * 1000, 
            sameSite: 'Lax',  // 'Strict' helyett 'Lax'-ot próbálj
          });

          res.status(200).json({
            success: true,
            message: "Sikeres bejelentkezés!",
            user: {
              id: result[0].id,
              felhasznalonev: result[0].felhasznalonev,
              email: result[0].emailcim,
              telefonszam: result[0].telefonszam
            }
          });
        } else {
          res.status(401).json({ success: false, message: "Hibás jelszó!" });
        }
      });
    } else {
      res.status(404).json({ success: false, message: "A felhasználó nem létezik!" });
    }
  });
});

app.get('/user', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

app.post('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.status(200).json({ success: true, message: 'Sikeres kijelentkezés!' });
});

const PORT = 5020;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
