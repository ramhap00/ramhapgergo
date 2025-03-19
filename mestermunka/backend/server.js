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
  
  const token = req.cookies.authToken;
  
  
  if (!token) {
    console.log("Nincs token"); // Debug
    return res.status(401).json({ success: false, message: 'Nincs bejelentkezve' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      
      return res.status(403).json({ success: false, message: 'Érvénytelen token' });
    }
    
    req.user = { id: user.userID, ...user }; // Explicit módon állítjuk be az id-t
    
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
      const times = result.map(row => `${row.nap} ${row.ora}`); // Formátum: "YYYY-MM-DD HH:mm"
      res.json({ success: true, times });
    }
  );
});

app.post('/api/book-time', authenticateToken, (req, res) => {
  const { postId, day, hour } = req.body;
  const userId = req.user.id;

  if (!postId || !day || !hour) {
    return res.status(400).json({ success: false, message: 'Minden mezőt ki kell tölteni!' });
  }

  // Ellenőrizzük, hogy a poszt létezik-e és ki a létrehozója (munkáltató)
  db.query('SELECT userID FROM posztok WHERE posztID = ?', [postId], (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).json({ success: false, message: 'A poszt nem található!' });
    }

    const munkaltatoID = result[0].userID;

    // Üzenet küldése a munkáltatónak
    const tartalom = `Időpont foglalási kérelem: ${day} ${hour}`;
    db.query(
      'INSERT INTO uzenetek (feladoID, cimzettID, posztID, nap, ora, tartalom, allapot) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, munkaltatoID, postId, day, hour, tartalom, 'pending'],
      (err, result) => {
        if (err) {
          console.error("Hiba az üzenet mentésekor:", err);
          return res.status(500).json({ success: false, message: 'Hiba történt a kérelem küldésekor!' });
        }
        res.json({ success: true, message: 'A kérelmedet elküldtük a munkáltatónak!' });
      }
    );
  });
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
app.post('/api/accept-booking', authenticateToken, (req, res) => {
  const { uzenetID, posztID, nap, ora } = req.body;
  const userId = req.user.id;

  if (!uzenetID || !posztID || !nap || !ora) {
    return res.status(400).json({
      success: false,
      message: 'Minden mezőt ki kell tölteni!',
      missingFields: { uzenetID: !uzenetID, posztID: !posztID, nap: !nap, ora: !ora }
    });
  }

  // Ellenőrizzük, hogy az üzenet létezik-e és pending állapotú-e
  db.query(
    'SELECT feladoID, allapot FROM uzenetek WHERE uzenetID = ?',
    [uzenetID],
    (err, messageResult) => {
      if (err || messageResult.length === 0) {
        return res.status(404).json({ success: false, message: 'Az üzenet nem található!' });
      }
      if (messageResult[0].allapot !== 'pending') {
        return res.status(400).json({ success: false, message: 'Ez az üzenet már feldolgozásra került!' });
      }

      const feladoID = messageResult[0].feladoID;

      // Ellenőrizzük, hogy a poszt feladója a bejelentkezett felhasználó-e
      db.query('SELECT userID, fejlec FROM posztok WHERE posztID = ?', [posztID], (err, result) => {
        if (err || result.length === 0) {
          return res.status(500).json({ success: false, message: 'Hiba a poszt ellenőrzésekor!' });
        }
        if (result[0].userID !== userId) {
          return res.status(403).json({ success: false, message: 'Nincs jogosultságod az időpont rögzítésére!' });
        }

        const posztFejlec = result[0].fejlec;

        // Ellenőrizzük, hogy az időpont már foglalt-e
        db.query(
          'SELECT * FROM naptar WHERE posztID = ? AND nap = ? AND ora = ?',
          [posztID, nap, ora],
          (err, existingBooking) => {
            if (err) {
              console.error("Hiba az időpont ellenőrzésekor:", err);
              return res.status(500).json({ success: false, message: 'Hiba történt az időpont ellenőrzésekor!' });
            }
            if (existingBooking.length > 0) {
              return res.status(400).json({ success: false, message: 'Ez az időpont már foglalt!' });
            }

            // Üzenet állapotának frissítése
            db.query('UPDATE uzenetek SET allapot = ? WHERE uzenetID = ?', ['accepted', uzenetID], (err) => {
              if (err) {
                console.error("Hiba az üzenet állapotának frissítésekor:", err);
                return res.status(500).json({ success: false, message: 'Hiba az üzenet elfogadása közben!' });
              }

              // Időpont rögzítése a naptárban
              db.query(
                'INSERT INTO naptar (posztID, userID, nap, ora) VALUES (?, ?, ?, ?)',
                [posztID, feladoID, nap, ora],
                (err, result) => {
                  if (err) {
                    console.error("Hiba az időpont rögzítésekor:", err);
                    return res.status(500).json({ success: false, message: 'Hiba az időpont rögzítésekor!' });
                  }

                  // Visszajelzés küldése a feladónak
                  const notificationContent = `Az időpont-foglalási kérelmedet elfogadták a következő poszthoz: "${posztFejlec}" - ${nap} ${ora}`;
                  db.query(
                    'INSERT INTO uzenetek (feladoID, cimzettID, posztID, nap, ora, tartalom, allapot) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [userId, feladoID, posztID, nap, ora, notificationContent, 'accepted'],
                    (err) => {
                      if (err) {
                        console.error("Hiba a visszajelzés küldésekor:", err);
                        return res.status(500).json({ success: false, message: 'Hiba a visszajelzés küldésekor!' });
                      }
                      res.json({ success: true, message: 'Időpont elfogadva és rögzítve!' });
                    }
                  );
                }
              );
            });
          }
        );
      });
    }
  );
});

app.post('/api/send-message', authenticateToken, (req, res) => {
  const { cimzettID, posztID, nap, ora, tartalom } = req.body;
  const feladoID = req.user.id;

  if (!cimzettID || !posztID || !nap || !ora || !tartalom) {
    return res.status(400).json({ success: false, message: 'Minden mezőt ki kell tölteni!' });
  }

  const query = `
    INSERT INTO uzenetek (feladoID, cimzettID, posztID, nap, ora, tartalom)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [feladoID, cimzettID, posztID, nap, ora, tartalom], (err, result) => {
    if (err) {
      console.error("Hiba az üzenet mentésekor:", err);
      return res.status(500).json({ success: false, message: 'Hiba történt az üzenet küldésekor!' });
    }
    res.status(201).json({ success: true, message: 'Üzenet sikeresen elküldve!', uzenetID: result.insertId });
  });
}); 

// Üzenetek lekérdezése (átnevezve /api/uzenetek-ről /api/messages-re a konzisztencia érdekében)
app.get('/api/messages', authenticateToken, (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT u.uzenetID, u.feladoID, u.cimzettID, u.posztID, u.nap, u.ora, u.tartalom, u.allapot, u.kuldesIdopont,
           f.vezeteknev AS feladoNev, c.vezeteknev AS cimzettNev, p.fejlec, p.kategoria, p.leiras, p.telepules, p.telefonszam, p.fotok
    FROM uzenetek u
    LEFT JOIN felhasznaloi_adatok f ON u.feladoID = f.userID
    LEFT JOIN felhasznaloi_adatok c ON u.cimzettID = c.userID
    LEFT JOIN posztok p ON u.posztID = p.posztID
    WHERE u.cimzettID = ? OR u.feladoID = ?
  `;

  db.query(query, [userId, userId], (err, result) => {
    if (err) {
      console.error("Hiba az üzenetek lekérdezésekor:", err);
      return res.status(500).json({ success: false, message: 'Hiba történt az üzenetek lekérdezésekor!' });
    }
    res.status(200).json({ success: true, messages: result });
  });
});

app.put('/api/update-message-status', authenticateToken, (req, res) => {
  const { uzenetID, allapot } = req.body;
  const userId = req.user.id;

  if (!uzenetID || !allapot || !['accepted', 'rejected'].includes(allapot)) {
    return res.status(400).json({ success: false, message: 'Érvénytelen adatok!' });
  }

  const query = `
    UPDATE uzenetek SET allapot = ? WHERE uzenetID = ? AND cimzettID = ?
  `;

  db.query(query, [allapot, uzenetID, userId], (err, result) => {
    if (err) {
      console.error("Hiba az üzenet állapotának frissítésekor:", err);
      return res.status(500).json({ success: false, message: 'Hiba történt az üzenet állapotának frissítésekor!' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Üzenet nem található vagy nem a tiéd!' });
    }

    // Üzenet lekérdezése a feladó és a poszt azonosításához
    db.query(
      'SELECT feladoID, posztID, nap, ora FROM uzenetek WHERE uzenetID = ?',
      [uzenetID],
      (err, messageResult) => {
        if (err || messageResult.length === 0) {
          console.error("Hiba az üzenet lekérdezésekor:", err);
          return res.status(500).json({ success: false, message: 'Hiba történt az üzenet lekérdezésekor!' });
        }

        const feladoID = messageResult[0].feladoID;
        const posztID = messageResult[0].posztID;
        const nap = messageResult[0].nap;
        const ora = messageResult[0].ora;

        // Poszt adatainak lekérdezése a fejlec miatt
        db.query('SELECT fejlec FROM posztok WHERE posztID = ?', [posztID], (err, posztResult) => {
          if (err || posztResult.length === 0) {
            console.error("Hiba a poszt lekérdezésekor:", err);
            return res.status(500).json({ success: false, message: 'Hiba történt a poszt lekérdezésekor!' });
          }

          const posztFejlec = posztResult[0].fejlec;

          // Visszajelzés küldése a feladónak a poszt nevével
          const notificationContent = allapot === 'accepted'
            ? `Az időpont-foglalási kérelmedet elfogadták a következő poszthoz: "${posztFejlec}" - ${nap} ${ora}`
            : `Az időpont-foglalási kérelmedet elutasították a következő poszthoz: "${posztFejlec}" - ${nap} ${ora}`;
          db.query(
            'INSERT INTO uzenetek (feladoID, cimzettID, posztID, nap, ora, tartalom, allapot) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, feladoID, posztID, nap, ora, notificationContent, 'accepted'],
            (err) => {
              if (err) {
                console.error("Hiba a visszajelzés küldésekor:", err);
                return res.status(500).json({ success: false, message: 'Hiba a visszajelzés küldésekor!' });
              }
              res.json({ success: true, message: `Üzenet ${allapot === 'accepted' ? 'elfogadva' : 'elutasítva'}` });
            }
          );
        });
      }
    );
  });
});
app.get('/beszelgetesek', authenticateToken, (req, res) => {
  const userID = req.user.id;

  const query = `
    SELECT b.beszelgetesID, b.feladoID, b.cimzettID, b.tartalom, b.kuldesIdopont, b.olvasott,
           f.vezeteknev AS feladoVezeteknev, f.keresztnev AS feladoKeresztnev, f.profilkep AS feladoProfilkep,
           c.vezeteknev AS cimzettVezeteknev, c.keresztnev AS cimzettKeresztnev, c.profilkep AS cimzettProfilkep
    FROM beszelgetesek b
    LEFT JOIN felhasznaloi_adatok f ON b.feladoID = f.userID
    LEFT JOIN felhasznaloi_adatok c ON b.cimzettID = c.userID
    WHERE b.feladoID = ? OR b.cimzettID = ?
    ORDER BY b.kuldesIdopont ASC
  `;

  db.query(query, [userID, userID], (err, result) => {
    if (err) {
      console.error("Hiba az üzenetek lekérdezésekor:", err);
      return res.status(500).json({ success: false, message: "Hiba történt az üzenetek lekérdezésekor!" });
    }
    res.status(200).json({ success: true, messages: result });
  });
});

app.post('/beszelgetesek', authenticateToken, (req, res) => {
  const feladoID = req.user.id;
  const { cimzettID, tartalom } = req.body;

  if (!cimzettID || !tartalom) {
    return res.status(400).json({ success: false, message: "Címzett és üzenet megadása kötelező!" });
  }

  const query = `
    INSERT INTO beszelgetesek (feladoID, cimzettID, tartalom)
    VALUES (?, ?, ?)
  `;

  db.query(query, [feladoID, cimzettID, tartalom], (err, result) => {
    if (err) {
      console.error("Hiba az üzenet mentésekor:", err);
      return res.status(500).json({ success: false, message: "Hiba történt az üzenet mentésekor!" });
    }
    res.status(201).json({ success: true, message: "Üzenet sikeresen elküldve!", beszelgetesID: result.insertId });
  });
});

// Üzenet olvasott állapotának frissítése
app.put('/beszelgetesek/:id/read', authenticateToken, (req, res) => {
  const userID = req.user.id;
  const beszelgetesID = req.params.id;

  const query = `
    UPDATE beszelgetesek 
    SET olvasott = 1 
    WHERE beszelgetesID = ? AND cimzettID = ?
  `;

  db.query(query, [beszelgetesID, userID], (err, result) => {
    if (err) {
      console.error("Hiba az olvasott állapot frissítésekor:", err);
      return res.status(500).json({ success: false, message: "Hiba történt az állapot frissítésekor!" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Üzenet nem található vagy nem neked szól!" });
    }
    res.status(200).json({ success: true, message: "Üzenet olvasottként jelölve!" });
  });
});
const PORT = 5020;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});