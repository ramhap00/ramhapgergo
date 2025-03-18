const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const saltRounds = 10;
const JWT_SECRET = 'YOUR_SECRET_KEY'; // Ezt érdemes .env fájlba tenni

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sos_munka',
  port: '3306',
});

app.use(cors({ origin: 'http://localhost:5173', credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(bodyParser.json());
app.use(cookieParser());

// AuthenticateToken middleware javítása
const authenticateToken = (req, res, next) => {
  console.log("Middleware elindult"); // Debug
  const token = req.cookies.authToken;
  console.log("Token:", token); // Debug
  
  if (!token) {
    console.log("Nincs token"); // Debug
    return res.status(401).json({ success: false, message: 'Nincs bejelentkezve' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Token ellenőrzési hiba:", err); // Debug
      return res.status(403).json({ success: false, message: 'Érvénytelen token' });
    }
    console.log("Dekódolt user:", user); // Debug
    req.user = { id: user.userID, ...user }; // Explicit módon állítjuk be az id-t
    console.log("Beállított req.user:", req.user); // Debug
    next();
  });
};

// Fájl feltöltés konfiguráció
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });
app.use("/uploads", express.static(uploadPath));

// Regisztráció végpont
app.post('/register', (req, res) => {
  const { vezeteknev, keresztnev, felhasznalonev, jelszo, emailcim, telefonszam, telepules, munkaltato } = req.body;
  const munkasreg = munkaltato ? 1 : 0;
  const letrehozasDatum = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const profilkep = 'default-profile.png'; // Alapértelmezett kép neve

  const query = `
    INSERT INTO felhasznaloi_adatok (vezeteknev, keresztnev, felhasznalonev, jelszo, emailcim, telefonszam, telepules, munkasreg, letrehozasDatum, profilkep)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  bcrypt.hash(jelszo, saltRounds, (err, hash) => {
    if (err) {
      console.log("Jelszó hash hiba:", err);
      return res.status(500).json({ success: false, message: 'Hiba történt a jelszó hash-elése során' });
    }

    console.log("Executing SQL query...");

    db.query(query, [vezeteknev, keresztnev, felhasznalonev, hash, emailcim, telefonszam, telepules, munkasreg, letrehozasDatum, profilkep], (err, result) => {
      if (err) {
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

// Bejelentkezés végpont
app.post('/login', (req, res) => {
  const { felhasznalonev, jelszo } = req.body;

  db.query(
    "SELECT userID, felhasznalonev, emailcim, telefonszam, munkasreg, jelszo FROM felhasznaloi_adatok WHERE felhasznalonev = ?;",
    [felhasznalonev],
    (err, result) => {
      if (err) {
        console.error("Hiba a lekérdezés során:", err);
        return res.status(500).json({ success: false, message: "Szerverhiba!" });
      }

      if (result.length > 0) {
        bcrypt.compare(jelszo, result[0].jelszo, (error, response) => {
          if (response) {
            const token = jwt.sign(
              {
                userID: result[0].userID,
                felhasznalonev: result[0].felhasznalonev,
                munkasreg: result[0].munkasreg,
                profilkep: result[0].profilkep
              },
              JWT_SECRET,
              { expiresIn: "1h" }
            );

            res.cookie("authToken", token, {
              httpOnly: false,
              secure: false,
              maxAge: 60 * 60 * 1000,
              sameSite: "Lax",
            });

            res.status(200).json({
              success: true,
              message: "Sikeres bejelentkezés!",
              user: {
                userID: result[0].userID,
                felhasznalonev: result[0].felhasznalonev,
                emailcim: result[0].emailcim,
                telefonszam: result[0].telefonszam,
                munkasreg: result[0].munkasreg,
                profilkep: result[0].profilkep,
              },
            });
          } else {
            res.status(401).json({ success: false, message: "Hibás jelszó!" });
          }
        });
      } else {
        res.status(404).json({ success: false, message: "A felhasználó nem létezik!" });
      }
    }
  );
});

// Egyéb végpontok (nem módosítom őket)
app.get('/user', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

app.post('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.status(200).json({ success: true, message: 'Sikeres kijelentkezés!' });
});

app.get('/profile', authenticateToken, (req, res) => {
  const userID = req.user.id;

  db.query(
    "SELECT felhasznalonev, emailcim, vezeteknev, keresztnev, profilkep, munkasreg FROM felhasznaloi_adatok WHERE userID = ?",
    [userID],
    (err, result) => {
      if (err) {
        console.error("Hiba a felhasználó lekérésekor:", err);
        return res.status(500).json({ success: false, message: "Hiba történt!" });
      }
      if (result.length > 0) {
        console.log("Profil válasz:", result[0]); // Hibakeresés
        res.status(200).json({ success: true, user: result[0] });
      } else {
        res.status(404).json({ success: false, message: "Felhasználó nem található!" });
      }
    }
  );
});

app.post('/check-username', (req, res) => {
  const { felhasznalonev } = req.body;

  db.query("SELECT * FROM felhasznaloi_adatok WHERE felhasznalonev = ?", [felhasznalonev], (err, result) => {
    if (err) {
      console.error("Hiba a felhasználónév ellenőrzésekor:", err);
      return res.status(500).json({ success: false, message: "Hiba történt a felhasználónév ellenőrzésekor." });
    }

    if (result.length > 0) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  });
});

app.put('/update-profile', authenticateToken, upload.single('profilkep'), (req, res) => {
  const userID = req.user.id;
  const { felhasznalonev, emailcim, vezeteknev, keresztnev } = req.body;
  const profilkep = req.file ? req.file.filename : null;

  if (!felhasznalonev || !emailcim || !vezeteknev || !keresztnev) {
    return res.status(400).json({ success: false, message: "Minden mezőt ki kell tölteni!" });
  }

  const updateQuery = `
    UPDATE felhasznaloi_adatok 
    SET felhasznalonev = ?, emailcim = ?, vezeteknev = ?, keresztnev = ?, profilkep = COALESCE(?, profilkep)
    WHERE userID = ?
  `;

  db.query(
    updateQuery,
    [felhasznalonev, emailcim, vezeteknev, keresztnev, profilkep, userID],
    (err, result) => {
      if (err) {
        console.error("Hiba a frissítés során:", err);
        return res.status(500).json({ success: false, message: "Hiba történt a frissítés során." });
      }

      // Lekérdezzük a frissített rekordot
      db.query(
        "SELECT profilkep FROM felhasznaloi_adatok WHERE userID = ?",
        [userID],
        (err, updatedResult) => {
          if (err) {
            console.error("Hiba a frissített adat lekérdezésekor:", err);
            return res.status(500).json({ success: false, message: "Hiba történt az adatok lekérdezésekor." });
          }
          const updatedProfilkep = updatedResult[0].profilkep;
          res.json({
            success: true,
            message: "Adatok sikeresen frissítve!",
            profilkep: updatedProfilkep,
          });
        }
      );
    }
  );
});

app.put('/update-password', authenticateToken, (req, res) => {
  const userID = req.user.id;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Régi és új jelszó megadása szükséges!' });
  }

  db.query("SELECT jelszo FROM felhasznaloi_adatok WHERE userID = ?", [userID], (err, result) => {
    if (err) {
      console.error("Hiba a jelszó lekérdezésekor:", err);
      return res.status(500).json({ success: false, message: 'Hiba történt a jelszó ellenőrzésekor!' });
    }

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'A felhasználó nem található!' });
    }

    const currentPasswordHash = result[0].jelszo;

    bcrypt.compare(oldPassword, currentPasswordHash, (err, match) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Hiba történt a jelszó összehasonlítása során!' });
      }

      if (!match) {
        return res.status(401).json({ success: false, message: 'Hibás régi jelszó!' });
      }

      bcrypt.hash(newPassword, saltRounds, (err, hashedPassword) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Hiba történt az új jelszó titkosítása során!' });
        }

        db.query('UPDATE felhasznaloi_adatok SET jelszo = ? WHERE userID = ?', [hashedPassword, userID], (error, result) => {
          if (error) {
            console.error('Hiba a jelszó frissítésekor:', error);
            return res.status(500).json({ success: false, message: 'Hiba történt a jelszó frissítésekor!' });
          }

          if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Jelszó sikeresen frissítve!' });
          } else {
            return res.status(404).json({ success: false, message: 'A felhasználó nem található!' });
          }
        });
      });
    });
  });
});

app.post("/api/poszt", authenticateToken, upload.single("fotok"), (req, res) => {
  console.log("Kapott adatok:", req.body);
  console.log("Kapott fájl:", req.file);

  const userID = req.user.id;
  const { vezeteknev, keresztnev, fejlec, telepules, telefonszam, kategoria, datum, leiras } = req.body;
  const fotok = req.file ? req.file.filename : null;

  if (!vezeteknev || !keresztnev || !fejlec || !telepules || !telefonszam || !kategoria || !datum || !leiras) {
    return res.status(400).json({ success: false, message: "Minden mezőt ki kell tölteni!" });
  }

  const query = `
    INSERT INTO posztok (userID, vezeteknev, keresztnev, fejlec, telepules, telefonszam, kategoria, datum, leiras, fotok)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [userID, vezeteknev, keresztnev, fejlec, telepules, telefonszam, kategoria, datum, leiras, fotok], (err, result) => {
    if (err) {
      console.error("Hiba a poszt mentésekor:", err);
      return res.status(500).json({ success: false, message: "Hiba történt a poszt mentésekor!" });
    }

    res.status(201).json({ success: true, message: "Poszt sikeresen létrehozva!", posztID: result.insertId });
  });
});

app.post('/api/ertekelesek', authenticateToken, (req, res) => {
  const userID = req.user.id;
  const { postId, rating } = req.body;

  if (!postId || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'Érvénytelen poszt ID vagy értékelés!' });
  }

  db.query(
    'SELECT * FROM ertekelesek WHERE post_id = ? AND user_id = ?',
    [postId, userID],
    (err, result) => {
      if (err) {
        console.error('Hiba az értékelés ellenőrzésekor:', err);
        return res.status(500).json({ success: false, message: 'Hiba történt az ellenőrzés során!' });
      }

      const updateAverageRating = () => {
        db.query(
          'SELECT AVG(rating) as averageRating, COUNT(*) as ratingCount FROM ertekelesek WHERE post_id = ?',
          [postId],
          (err, stats) => {
            if (err) {
              console.error('Hiba az átlag kiszámításakor:', err);
              return;
            }
            const { averageRating, ratingCount } = stats[0];
            db.query(
              'UPDATE posztok SET averageRating = ?, ratingCount = ? WHERE posztID = ?',
              [averageRating, ratingCount, postId],
              (err) => {
                if (err) {
                  console.error('Hiba a poszt frissítésekor:', err);
                }
              }
            );
          }
        );
      };

      if (result.length > 0) {
        db.query(
          'UPDATE ertekelesek SET rating = ?, created_at = NOW() WHERE post_id = ? AND user_id = ?',
          [rating, postId, userID],
          (err, updateResult) => {
            if (err) {
              console.error('Hiba az értékelés frissítésekor:', err);
              return res.status(500).json({ success: false, message: 'Hiba történt a frissítés során!' });
            }
            updateAverageRating();
            return res.status(200).json({ success: true, message: 'Értékelés frissítve!' });
          }
        );
      } else {
        db.query(
          'INSERT INTO ertekelesek (post_id, user_id, rating) VALUES (?, ?, ?)',
          [postId, userID, rating],
          (err, insertResult) => {
            if (err) {
              console.error('Hiba az értékelés mentésekor:', err);
              return res.status(500).json({ success: false, message: 'Hiba történt a mentés során!' });
            }
            updateAverageRating();
            return res.status(201).json({ success: true, message: 'Értékelés sikeresen mentve!' });
          }
        );
      }
    }
  );
});

app.get('/api/posztok', (req, res) => {
  const query = "SELECT * FROM posztok";
  
  db.query(query, (err, result) => {
    if (err) {
      console.error("Hiba a posztok lekérésekor:", err);
      return res.status(500).json({ success: false, message: "Hiba történt a posztok lekérésekor!" });
    }
    
    res.status(200).json({ success: true, posts: result });
  });
});

app.get('/api/user-rating/:postId', authenticateToken, (req, res) => {
  const userID = req.user.id;
  const { postId } = req.params;

  db.query(
    'SELECT rating FROM ertekelesek WHERE post_id = ? AND user_id = ?',
    [postId, userID],
    (err, result) => {
      if (err) {
        console.error('Hiba az értékelés lekérdezésekor:', err);
        return res.status(500).json({ success: false, message: 'Hiba történt!' });
      }

      if (result.length > 0) {
        res.status(200).json({ success: true, rating: result[0].rating });
      } else {
        res.status(200).json({ success: true, rating: 0 });
      }
    }
  );
});

// Foglalt időpontok lekérése MySQL-lel
app.get('/api/booked-times/:postId', authenticateToken, (req, res) => {
  const { postId } = req.params;
  
  db.query(
    'SELECT nap, ora FROM naptar WHERE posztID = ?',
    [postId],
    (err, result) => {
      if (err) {
        console.error('Hiba az időpontok lekérésekor:', err);
        return res.status(500).json({ success: false, message: 'Hiba az időpontok lekérésekor' });
      }
      const times = result.map(row => `${row.nap}-${row.ora}`);
      res.json({ success: true, times });
    }
  );
});

// Időpont foglalás végpont
app.post('/api/book-time', authenticateToken, (req, res) => {
  const { postId, day, hour } = req.body;
  const userId = req.user.id;

  console.log("Beérkező adatok:", { postId, day, hour, userId });

  if (!userId) {
    console.log("Hiányzó userId"); // Debug
    return res.status(400).json({ success: false, message: 'Hiányzó userID a kérésben!' });
  }

  db.query(
    'INSERT INTO naptar (posztID, userID, nap, ora) VALUES (?, ?, ?, ?)',
    [postId, userId, day, hour],
    (err, result) => {
      if (err) {
        console.error("Hiba az időpont mentésekor:", err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ success: false, message: 'Ez az időpont már foglalt!' });
        }
        return res.status(500).json({
          success: false,
          message: 'Hiba az időpont mentésekor',
          error: {
            code: err.code,
            message: err.sqlMessage || err.message,
            sql: err.sql
          }
        });
      }
      console.log("Időpont sikeresen mentve:", { postId, day, hour, insertId: result.insertId });
      res.json({ success: true });
    }
  );
});
// server.js - új végpont a meglévő app.get('/api/booked-times/:postId', ...) után
app.get('/api/user-bookings', authenticateToken, (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT n.naptarID, n.posztID, n.nap, n.ora, p.vezeteknev, p.keresztnev, p.telepules, p.telefonszam, p.kategoria, p.datum, p.leiras, p.fotok, p.fejlec
    FROM naptar n
    JOIN posztok p ON n.posztID = p.posztID
    WHERE n.userID = ?
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Hiba a foglalások lekérésekor:", err);
      return res.status(500).json({ success: false, message: "Hiba történt a foglalások lekérésekor!" });
    }
    res.status(200).json({ success: true, bookings: result });
  });
});
// server.js - új végpont az app.post('/api/book-time', ...) után
app.delete('/api/cancel-booking/:naptarID', authenticateToken, (req, res) => {
  const { naptarID } = req.params;
  const userId = req.user.id;

  const query = `
    DELETE FROM naptar 
    WHERE naptarID = ? AND userID = ?
  `;

  db.query(query, [naptarID, userId], (err, result) => {
    if (err) {
      console.error("Hiba a foglalás törlésekor:", err);
      return res.status(500).json({ success: false, message: "Hiba történt a foglalás törlésekor!" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "A foglalás nem található vagy nem a tiéd!" });
    }
    res.status(200).json({ success: true, message: "Foglalás sikeresen törölve!" });
  });
});
const PORT = 5020;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});