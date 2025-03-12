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
const JWT_SECRET = 'YOUR_SECRET_KEY';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sos_munka',
  port: '3307',
});

app.use(cors({ origin: 'http://localhost:5173', credentials: true , methods: ['GET', 'POST', 'PUT', 'DELETE'], }));
app.use(bodyParser.json());
app.use(cookieParser());

const authenticateToken = (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token) return res.status(401).json({ success: false, message: 'Nincs bejelentkezve' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Érvénytelen token' });
    req.user = user;
    next();
  });
};
const uploadPath = path.join(__dirname, "uploads");

// Ha nem létezik, létrehozzuk az uploads mappát
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.post('/register', (req, res) => {
  const { vezeteknev, keresztnev, felhasznalonev, jelszo, emailcim, telefonszam, telepules, munkaltato } = req.body;
  const munkasreg = munkaltato ? 1 : 0;
  const letrehozasDatum = new Date().toISOString().slice(0, 19).replace('T', ' ');

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

    console.log("Executing SQL query...");

    db.query(query, [vezeteknev, keresztnev, felhasznalonev, hash, emailcim, telefonszam, telepules, munkasreg, letrehozasDatum], (err, result) => {
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
                munkasreg: result[0].munkasreg
              },
              JWT_SECRET,
              { expiresIn: "1h" }
            );

            res.cookie("authToken", token, {
              httpOnly: false, // JavaScript is olvashatja
              secure: false,   // localhost esetén
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

app.get('/user', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

app.post('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.status(200).json({ success: true, message: 'Sikeres kijelentkezés!' });
});

app.get('/profile', authenticateToken, (req, res) => {
  const userID = req.user.userID;

  db.query(
    "SELECT felhasznalonev, emailcim, vezeteknev, keresztnev FROM felhasznaloi_adatok WHERE userID = ?",
    [userID],
    (err, result) => {
      if (err) {
        console.error("Hiba a felhasználó lekérésekor:", err);
        return res.status(500).json({ success: false, message: "Hiba történt!" });
      }

      if (result.length > 0) {
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

app.put('/update-profile', authenticateToken, (req, res) => {
  const userID = req.user.userID;
  const { felhasznalonev, emailcim, vezeteknev, keresztnev } = req.body;

  if (!felhasznalonev || !emailcim || !vezeteknev || !keresztnev) {
    return res.status(400).json({ success: false, message: "Minden mezőt ki kell tölteni!" });
  }

  db.query(
    "UPDATE felhasznaloi_adatok SET felhasznalonev = ?, emailcim = ?, vezeteknev = ?, keresztnev = ? WHERE userID = ?",
    [felhasznalonev, emailcim, vezeteknev, keresztnev, userID],
    (err, result) => {
      if (err) {
        console.error("Hiba a frissítés során:", err);
        return res.status(500).json({ success: false, message: "Hiba történt a frissítés során." });
      }
      
      res.json({ success: true, message: "Adatok sikeresen frissítve!" });
    }
  );
});

app.put('/update-password', authenticateToken, (req, res) => {
  const userID = req.user.userID;
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

  const userID = req.user.userID;  // Bejelentkezett felhasználó ID-ja
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
  const userID = req.user.userID;
  const { postId, rating } = req.body;

  if (!postId || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'Érvénytelen poszt ID vagy értékelés!' });
  }

  // Ellenőrizzük, hogy a felhasználó már értékelte-e ezt a posztot
  db.query(
    'SELECT * FROM ertekelesek WHERE post_id = ? AND user_id = ?',
    [postId, userID],
    (err, result) => {
      if (err) {
        console.error('Hiba az értékelés ellenőrzésekor:', err);
        return res.status(500).json({ success: false, message: 'Hiba történt az ellenőrzés során!' });
      }

      const updateAverageRating = () => {
        // Számoljuk ki az új átlagot és az értékelések számát
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
        // Ha már létezik értékelés, frissítjük
        db.query(
          'UPDATE ertekelesek SET rating = ?, created_at = NOW() WHERE post_id = ? AND user_id = ?',
          [rating, postId, userID],
          (err, updateResult) => {
            if (err) {
              console.error('Hiba az értékelés frissítésekor:', err);
              return res.status(500).json({ success: false, message: 'Hiba történt a frissítés során!' });
            }
            updateAverageRating(); // Frissítjük az átlagot
            return res.status(200).json({ success: true, message: 'Értékelés frissítve!' });
          }
        );
      } else {
        // Ha még nem létezik, új értékelést hozunk létre
        db.query(
          'INSERT INTO ertekelesek (post_id, user_id, rating) VALUES (?, ?, ?)',
          [postId, userID, rating],
          (err, insertResult) => {
            if (err) {
              console.error('Hiba az értékelés mentésekor:', err);
              return res.status(500).json({ success: false, message: 'Hiba történt a mentés során!' });
            }
            updateAverageRating(); // Frissítjük az átlagot
            return res.status(201).json({ success: true, message: 'Értékelés sikeresen mentve!' });
          }
        );
      }
    }
  );
});
// API a posztok lekérésére
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
  const userID = req.user.userID;
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
        res.status(200).json({ success: true, rating: 0 }); // Ha nincs értékelés
      }
    }
  );
});
const PORT = 5020;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
