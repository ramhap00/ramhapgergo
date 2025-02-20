const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // JWT importálása
const cookieParser = require('cookie-parser'); // Cookie parser importálása

const saltRounds = 10;
const JWT_SECRET = 'YOUR_SECRET_KEY'; // Titkos kulcs a JWT-hez

// Adatbázis kapcsolódás
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sos_munka',
  port: '3307',
});

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));  // A frontend URL-je
app.use(bodyParser.json());
app.use(cookieParser());  // Cookie parser használata

// Hitelesítés middleware
const authenticateToken = (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token) return res.sendStatus(401); // Ha nincs token, akkor 401-et adunk vissza

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Ha a token érvénytelen, akkor 403-at adunk vissza
    req.user = user;
    next();
  });
};

// Regisztrációs végpont
app.post('/register', (req, res) => {
  const { vezeteknev, keresztnev, felhasznalonev, jelszo, email, telefonszam, telepules, munkaltato } = req.body;
  const munkasreg = munkaltato ? 1 : 0;
  const letrehozasDatum = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const query = `
    INSERT INTO felhasznaloi_adatok (vezeteknev, keresztnev, felhasznalonev, jelszo, emailcim, telefonszam, telepules, munkasreg, letrehozasDatum)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  bcrypt.hash(jelszo, saltRounds, (err, hash) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: 'Hiba történt a jelszó hash-elése során' });
    }

    db.query(query, [vezeteknev, keresztnev, felhasznalonev, hash, email, telefonszam, telepules, munkasreg, letrehozasDatum], (err, result) => {
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
});

// Bejelentkezés végpont
app.post("/login", (req, res) => {
  const { felhasznalonev, jelszo } = req.body;

  db.query(
    "SELECT * FROM felhasznaloi_adatok WHERE felhasznalonev = ?;",
    [felhasznalonev],
    (err, result) => {
      if (err) {
        console.error("Hiba a lekérdezés során:", err);
        return res.status(500).send({ success: false, message: "Szerverhiba!" });
      }

      if (result.length > 0) {
        bcrypt.compare(jelszo, result[0].jelszo, (error, response) => {
          if (response) {
            // JWT létrehozása
            const token = jwt.sign({ id: result[0].id, felhasznalonev: result[0].felhasznalonev }, JWT_SECRET, { expiresIn: '1h' });

            // Token beállítása cookie-ban
            res.cookie('authToken', token, {
              httpOnly: true, // A cookie nem elérhető JavaScript-ből
              secure: process.env.NODE_ENV === 'production', // Csak HTTPS-en küldi el a sütit
              maxAge: 60 * 60 * 1000, // A süti élettartama (1 óra)
              sameSite: 'Strict', // A sütik csak ugyanazon originről érkező kérésekhez lesznek küldve
            });

            res.status(200).send({
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
            res.status(401).send({ success: false, message: "Hibás jelszó!" });
          }
        });
      } else {
        res.status(404).send({ success: false, message: "A felhasználó nem létezik!" });
      }
    }
  );
});

// Szerver oldali hitelesítés
app.get('/user', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Kijelentkezés végpont
app.post('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.status(200).send({ success: true, message: 'Sikeres kijelentkezés!' });
});

// Szerver indítása
const PORT = 5020;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
