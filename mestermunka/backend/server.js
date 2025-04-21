const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Konstansok
const PORT = 5020;
const SALT_ROUNDS = 10;
const JWT_SECRET = 'YOUR_SECRET_KEY'; 
const DEFAULT_PROFILE_PIC = 'default-profile.png';
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Express alkalmazás inicializálása
const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(bodyParser.json());
app.use(cookieParser());

// Adatbázis kapcsolat
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sos_munka',
  port: '3306',
});

// Fájl feltöltés konfiguráció
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });
app.use('/uploads', express.static(UPLOADS_DIR));

// Segédfüggvények
const logger = {
  info: (message, ...args) => console.log(`[INFO] ${message}`, ...args),
  error: (message, ...args) => console.error(`[ERROR] ${message}`, ...args),
};

const sendSuccessResponse = (res, data, status = 200) => {
  res.status(status).json({ success: true, ...data });
};

const sendErrorResponse = (res, message, status = 500, error = null) => {
  logger.error(message, error || '');
  res.status(status).json({ success: false, message, ...(error && { error: error.message }) });
};

const validateRequiredFields = (fields, res) => {
  const missingFields = Object.keys(fields).filter(key => !fields[key]);
  if (missingFields.length > 0) {
    sendErrorResponse(res, 'Minden mezőt ki kell tölteni!', 400, { missingFields });
    return false;
  }
  return true;
};

const executeQuery = (query, params, res, successMessage, successData = {}) => {
  return new Promise((resolve, reject) => {
    logger.info('Executing SQL query:', query, params);
    db.query(query, params, (err, result) => {
      if (err) {
        sendErrorResponse(res, `Hiba történt: ${successMessage}`, 500, err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const sendNotificationMessage = async (feladoID, cimzettID, posztID, nap, ora, content, allapot, res) => {
  const query = `
    INSERT INTO uzenetek (feladoID, cimzettID, posztID, nap, ora, tartalom, allapot)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  await executeQuery(query, [feladoID, cimzettID, posztID, nap, ora, content, allapot], res, 'Üzenet küldése sikertelen');
};

// Middleware-ek
const authenticateToken = (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token) {
    return sendErrorResponse(res, 'Nincs bejelentkezve', 401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return sendErrorResponse(res, 'Érvénytelen token', 403);
    }
    req.user = { id: user.userID, ...user };
    next();
  });
};

app.use((req, res, next) => {
  const token = req.cookies.authToken;
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err && user) {
        executeQuery(
          'UPDATE felhasznaloi_adatok SET lastActive = NOW() WHERE userID = ?',
          [user.userID],
          res,
          'Hiba a lastActive frissítésekor'
        );
      }
    });
  }
  next();
});

// Felhasználói műveletek
app.post('/register', async (req, res) => {
  const { vezeteknev, keresztnev, felhasznalonev, jelszo, emailcim, telefonszam, telepules, munkaltato } = req.body;
  if (!validateRequiredFields({ vezeteknev, keresztnev, felhasznalonev, jelszo, emailcim, telefonszam, telepules }, res)) return;

  const letrehozasDatum = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const query = `
    INSERT INTO felhasznaloi_adatok (
      vezeteknev, keresztnev, felhasznalonev, jelszo, emailcim, telefonszam, telepules, munkasreg, letrehozasDatum, profilkep
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const hashedPassword = await bcrypt.hash(jelszo, SALT_ROUNDS);
    const result = await executeQuery(
      query,
      [vezeteknev, keresztnev, felhasznalonev, hashedPassword, emailcim, telefonszam, telepules, munkaltato ? 1 : 0, letrehozasDatum, DEFAULT_PROFILE_PIC],
      res,
      'Regisztráció sikertelen'
    );
    sendSuccessResponse(res, { message: 'Regisztráció sikeres!', userID: result.insertId }, 200);
  } catch (err) {
    sendErrorResponse(res, 'Hiba történt a jelszó hash-elése során', 500, err);
  }
});

app.post('/login', async (req, res) => {
  const { felhasznalonev, jelszo } = req.body;
  if (!validateRequiredFields({ felhasznalonev, jelszo }, res)) return;

  const query = `
    SELECT userID, felhasznalonev, emailcim, telefonszam, munkasreg, jelszo, profilkep
    FROM felhasznaloi_adatok
    WHERE felhasznalonev = ?
  `;
  try {
    const result = await executeQuery(query, [felhasznalonev], res, 'Bejelentkezés sikertelen');
    if (result.length === 0) {
      return sendErrorResponse(res, 'A felhasználó nem létezik!', 404);
    }

    const user = result[0];
    const match = await bcrypt.compare(jelszo, user.jelszo);
    if (!match) {
      return sendErrorResponse(res, 'Hibás jelszó!', 401);
    }

    const token = jwt.sign(
      { userID: user.userID, felhasznalonev: user.felhasznalonev, munkasreg: user.munkasreg, profilkep: user.profilkep },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('authToken', token, {
      httpOnly: false,
      secure: false,
      maxAge: 60 * 60 * 1000,
      sameSite: 'Lax',
    });

    sendSuccessResponse(res, {
      message: 'Sikeres bejelentkezés!',
      user: {
        userID: user.userID,
        felhasznalonev: user.felhasznalonev,
        emailcim: user.emailcim,
        telefonszam: user.telefonszam,
        munkasreg: user.munkasreg,
        profilkep: user.profilkep,
      },
    });
  } catch (err) {
    sendErrorResponse(res, 'Hiba történt a bejelentkezés során', 500, err);
  }
});

app.get('/user', authenticateToken, (req, res) => {
  sendSuccessResponse(res, { user: req.user });
});

app.post('/logout', (req, res) => {
  const token = req.cookies.authToken;
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err && user) {
        executeQuery(
          'UPDATE felhasznaloi_adatok SET lastActive = NULL WHERE userID = ?',
          [user.userID],
          res,
          'Hiba a lastActive nullázásakor'
        );
      }
    });
  }
  res.clearCookie('authToken');
  sendSuccessResponse(res, { message: 'Sikeres kijelentkezés!' });
});

app.get('/profile', authenticateToken, async (req, res) => {
  const query = `
    SELECT userID, felhasznalonev, emailcim, vezeteknev, keresztnev, profilkep, munkasreg
    FROM felhasznaloi_adatok
    WHERE userID = ?
  `;
  const result = await executeQuery(query, [req.user.id], res, 'Felhasználó lekérése sikertelen');
  if (result.length === 0) {
    return sendErrorResponse(res, 'Felhasználó nem található!', 404);
  }
  sendSuccessResponse(res, { user: result[0] });
});

app.post('/check-username', async (req, res) => {
  const { felhasznalonev } = req.body;
  const result = await executeQuery(
    'SELECT * FROM felhasznaloi_adatok WHERE felhasznalonev = ?',
    [felhasznalonev],
    res,
    'Felhasználónév ellenőrzése sikertelen'
  );
  sendSuccessResponse(res, { exists: result.length > 0 });
});

app.put('/update-profile', authenticateToken, upload.single('profilkep'), async (req, res) => {
  const { felhasznalonev, emailcim, vezeteknev, keresztnev } = req.body;
  const profilkep = req.file ? req.file.filename : null;
  if (!validateRequiredFields({ felhasznalonev, emailcim, vezeteknev, keresztnev }, res)) return;

  const query = `
    UPDATE felhasznaloi_adatok 
    SET felhasznalonev = ?, emailcim = ?, vezeteknev = ?, keresztnev = ?, profilkep = COALESCE(?, profilkep)
    WHERE userID = ?
  `;
  await executeQuery(
    query,
    [felhasznalonev, emailcim, vezeteknev, keresztnev, profilkep, req.user.id],
    res,
    'Profil frissítése sikertelen'
  );

  const updatedResult = await executeQuery(
    'SELECT profilkep FROM felhasznaloi_adatok WHERE userID = ?',
    [req.user.id],
    res,
    'Frissített profil lekérdezése sikertelen'
  );
  sendSuccessResponse(res, { message: 'Adatok sikeresen frissítve!', profilkep: updatedResult[0].profilkep });
});

app.put('/update-password', authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!validateRequiredFields({ oldPassword, newPassword }, res)) return;

  const result = await executeQuery(
    'SELECT jelszo FROM felhasznaloi_adatok WHERE userID = ?',
    [req.user.id],
    res,
    'Jelszó lekérdezése sikertelen'
  );
  if (result.length === 0) {
    return sendErrorResponse(res, 'A felhasználó nem található!', 404);
  }

  const match = await bcrypt.compare(oldPassword, result[0].jelszo);
  if (!match) {
    return sendErrorResponse(res, 'Hibás régi jelszó!', 401);
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await executeQuery(
    'UPDATE felhasznaloi_adatok SET jelszo = ? WHERE userID = ?',
    [hashedPassword, req.user.id],
    res,
    'Jelszó frissítése sikertelen'
  );
  sendSuccessResponse(res, { message: 'Jelszó sikeresen frissítve!' });
});

// Posztok kezelése
app.post('/api/poszt', authenticateToken, upload.single('fotok'), async (req, res) => {
  const { vezeteknev, keresztnev, fejlec, telepules, telefonszam, kategoria, datum, leiras } = req.body;
  const tempFileName = req.file ? req.file.filename : null;
  if (!validateRequiredFields({ vezeteknev, keresztnev, fejlec, telepules, telefonszam, kategoria, datum, leiras }, res)) return;
  if (!tempFileName) return sendErrorResponse(res, 'Egy képet fel kell tölteni!', 400);

  const query = `
    INSERT INTO posztok (userID, vezeteknev, keresztnev, fejlec, telepules, telefonszam, kategoria, datum, leiras, fotok)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const result = await executeQuery(
    query,
    [req.user.id, vezeteknev, keresztnev, fejlec, telepules, telefonszam, kategoria, datum, leiras, JSON.stringify([tempFileName])],
    res,
    'Poszt mentése sikertelen'
  );

  const posztID = result.insertId;
  const oldPath = path.join(UPLOADS_DIR, tempFileName);
  const newFileName = `${posztID}_1${path.extname(tempFileName)}`;
  const newPath = path.join(UPLOADS_DIR, newFileName);

  fs.rename(oldPath, newPath, async (renameErr) => {
    if (renameErr) {
      logger.error(`Hiba a fájl átnevezésekor (${tempFileName} -> ${newFileName})`, renameErr);
    }

    const updateQuery = `
      UPDATE posztok
      SET fotok = ?
      WHERE posztID = ?
    `;
    await executeQuery(updateQuery, [JSON.stringify([newFileName]), posztID], res, 'Fájlnév frissítése sikertelen');
    sendSuccessResponse(res, { message: 'Poszt sikeresen létrehozva!', post: { posztID } }, 201);
  });
});

app.get('/api/posztok', async (req, res) => {
  const query = `
    SELECT p.*, COALESCE(f.profilkep, ?) AS profilkep 
    FROM posztok p
    LEFT JOIN felhasznaloi_adatok f ON p.userID = f.userID
  `;
  const result = await executeQuery(query, [DEFAULT_PROFILE_PIC], res, 'Posztok lekérése sikertelen');

  const postsWithProfilePic = result.map(post => {
    const profilePicPath = path.join(UPLOADS_DIR, post.profilkep);
    if (!fs.existsSync(profilePicPath)) {
      post.profilkep = DEFAULT_PROFILE_PIC;
    }
    post.fotok = post.fotok ? (typeof post.fotok === 'string' ? JSON.parse(post.fotok) : post.fotok) : [];
    return post;
  });

  sendSuccessResponse(res, { posts: postsWithProfilePic });
});

app.delete('/api/poszt/:posztID', authenticateToken, async (req, res) => {
  const { posztID } = req.params;
  const userID = req.user.id;

  const checkQuery = 'SELECT userID, fotok FROM posztok WHERE posztID = ?';
  const postResult = await executeQuery(checkQuery, [posztID], res, 'Poszt ellenőrzése sikertelen');
  if (postResult.length === 0) {
    return sendErrorResponse(res, 'A poszt nem található!', 404);
  }
  if (postResult[0].userID !== userID) {
    return sendErrorResponse(res, 'Nincs jogosultságod törölni ezt a posztot!', 403);
  }

  const deleteQuery = 'DELETE FROM posztok WHERE posztID = ?';
  await executeQuery(deleteQuery, [posztID], res, 'Poszt törlése sikertelen');

  const fotok = postResult[0].fotok ? JSON.parse(postResult[0].fotok) : [];
  fotok.forEach(foto => {
    const filePath = path.join(UPLOADS_DIR, foto);
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) logger.error(`Hiba a fájl törlésekor (${foto})`, unlinkErr);
    });
  });

  sendSuccessResponse(res, { message: 'Poszt sikeresen törölve!' });
});

// Időpontfoglalások kezelése
app.get('/api/booked-times/:postId', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const query = 'SELECT nap, ora FROM naptar WHERE posztID = ?';
  const result = await executeQuery(query, [postId], res, 'Időpontok lekérése sikertelen');
  const times = result.map(row => `${row.nap} ${row.ora}`);
  sendSuccessResponse(res, { times });
});

app.post('/api/book-time', authenticateToken, async (req, res) => {
  const { postId, day, hour } = req.body;
  const userId = req.user.id;
  if (!validateRequiredFields({ postId, day, hour }, res)) return;

  const postQuery = 'SELECT userID FROM posztok WHERE posztID = ?';
  const postResult = await executeQuery(postQuery, [postId], res, 'Poszt ellenőrzése sikertelen');
  if (postResult.length === 0) {
    return sendErrorResponse(res, 'A poszt nem található!', 404);
  }

  const munkaltatoID = postResult[0].userID;
  const tartalom = `Időpont foglalási kérelem: ${day} ${hour}`;
  const query = `
    INSERT INTO uzenetek (feladoID, cimzettID, posztID, nap, ora, tartalom, allapot)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  await executeQuery(
    query,
    [userId, munkaltatoID, postId, day, hour, tartalom, 'pending'],
    res,
    'Kérelem küldése sikertelen'
  );
  sendSuccessResponse(res, { message: 'A kérelmedet elküldtük a munkáltatónak!' });
});

app.get('/api/user-bookings', authenticateToken, async (req, res) => {
  const query = `
    SELECT n.naptarID, n.posztID, n.nap, n.ora, p.vezeteknev, p.keresztnev, p.telepules, p.telefonszam, p.kategoria, p.datum, p.leiras, p.fotok, p.fejlec
    FROM naptar n
    JOIN posztok p ON n.posztID = p.posztID
    WHERE n.userID = ?
  `;
  const result = await executeQuery(query, [req.user.id], res, 'Foglalások lekérése sikertelen');
  sendSuccessResponse(res, { bookings: result });
});

app.delete('/api/cancel-booking/:naptarID', authenticateToken, async (req, res) => {
  const { naptarID } = req.params;
  const query = 'DELETE FROM naptar WHERE naptarID = ? AND userID = ?';
  const result = await executeQuery(query, [naptarID, req.user.id], res, 'Foglalás törlése sikertelen');
  if (result.affectedRows === 0) {
    return sendErrorResponse(res, 'A foglalás nem található vagy nem a tiéd!', 404);
  }
  sendSuccessResponse(res, { message: 'Foglalás sikeresen törölve!' });
});

app.post('/api/accept-booking', authenticateToken, async (req, res) => {
  const { uzenetID, posztID, nap, ora } = req.body;
  const userId = req.user.id;
  if (!validateRequiredFields({ uzenetID, posztID, nap, ora }, res)) return;

  const messageQuery = 'SELECT feladoID, allapot FROM uzenetek WHERE uzenetID = ?';
  const messageResult = await executeQuery(messageQuery, [uzenetID], res, 'Üzenet ellenőrzése sikertelen');
  if (messageResult.length === 0) {
    return sendErrorResponse(res, 'Az üzenet nem található!', 404);
  }
  if (messageResult[0].allapot !== 'pending') {
    return sendErrorResponse(res, 'Ez az üzenet már feldolgozásra került!', 400);
  }

  const feladoID = messageResult[0].feladoID;
  const postQuery = 'SELECT userID, fejlec FROM posztok WHERE posztID = ?';
  const postResult = await executeQuery(postQuery, [posztID], res, 'Poszt ellenőrzése sikertelen');
  if (postResult.length === 0) {
    return sendErrorResponse(res, 'A poszt nem található!', 404);
  }
  if (postResult[0].userID !== userId) {
    return sendErrorResponse(res, 'Nincs jogosultságod az időpont rögzítésére!', 403);
  }

  const existingBookingQuery = 'SELECT * FROM naptar WHERE posztID = ? AND nap = ? AND ora = ?';
  const existingBooking = await executeQuery(existingBookingQuery, [posztID, nap, ora], res, 'Időpont ellenőrzése sikertelen');
  if (existingBooking.length > 0) {
    return sendErrorResponse(res, 'Ez az időpont már foglalt!', 400);
  }

  await executeQuery(
    'UPDATE uzenetek SET allapot = ? WHERE uzenetID = ?',
    ['accepted', uzenetID],
    res,
    'Üzenet elfogadása sikertelen'
  );

  const insertQuery = 'INSERT INTO naptar (posztID, userID, nap, ora) VALUES (?, ?, ?, ?)';
  await executeQuery(insertQuery, [posztID, feladoID, nap, ora], res, 'Időpont rögzítése sikertelen');

  const notificationContent = `Az időpont-foglalási kérelmedet elfogadták a következő poszthoz: "${postResult[0].fejlec}" - ${nap} ${ora}`;
  await sendNotificationMessage(userId, feladoID, posztID, nap, ora, notificationContent, 'accepted', res);
  sendSuccessResponse(res, { message: 'Időpont elfogadva és rögzítve!' });
});

app.get('/api/my-posts-bookings', authenticateToken, async (req, res) => {
  const query = `
    SELECT 
      n.naptarID, n.posztID, n.nap, n.ora, p.fejlec, p.kategoria, p.telepules, p.telefonszam, p.leiras, p.fotok, 
      f.vezeteknev AS foglaloVezeteknev, f.keresztnev AS foglaloKeresztnev
    FROM naptar n
    JOIN posztok p ON n.posztID = p.posztID
    JOIN felhasznaloi_adatok f ON n.userID = f.userID
    WHERE p.userID = ?
  `;
  const result = await executeQuery(query, [req.user.id], res, 'Foglalások lekérése sikertelen');
  const bookings = result.map(booking => {
    if (booking.fotok && typeof booking.fotok === 'string') {
      booking.fotok = JSON.parse(booking.fotok);
    }
    return booking;
  });
  sendSuccessResponse(res, { bookings });
});

// Üzenetek kezelése
app.post('/api/send-message', authenticateToken, async (req, res) => {
  const { cimzettID, posztID, nap, ora, tartalom } = req.body;
  if (!validateRequiredFields({ cimzettID, posztID, nap, ora, tartalom }, res)) return;

  const query = `
    INSERT INTO uzenetek (feladoID, cimzettID, posztID, nap, ora, tartalom)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const result = await executeQuery(
    query,
    [req.user.id, cimzettID, posztID, nap, ora, tartalom],
    res,
    'Üzenet küldése sikertelen'
  );
  sendSuccessResponse(res, { message: 'Üzenet sikeresen elküldve!', uzenetID: result.insertId }, 201);
});

app.get('/api/messages', authenticateToken, async (req, res) => {
  const query = `
    SELECT u.uzenetID, u.feladoID, u.cimzettID, u.posztID, u.nap, u.ora, u.tartalom, u.allapot, u.kuldesIdopont,
           f.vezeteknev AS feladoNev, c.vezeteknev AS cimzettNev, p.fejlec, p.kategoria, p.leiras, p.telepules, p.telefonszam, p.fotok
    FROM uzenetek u
    LEFT JOIN felhasznaloi_adatok f ON u.feladoID = f.userID
    LEFT JOIN felhasznaloi_adatok c ON u.cimzettID = c.userID
    LEFT JOIN posztok p ON u.posztID = p.posztID
    WHERE u.cimzettID = ? OR u.feladoID = ?
  `;
  const result = await executeQuery(query, [req.user.id, req.user.id], res, 'Üzenetek lekérése sikertelen');
  sendSuccessResponse(res, { messages: result });
});

app.put('/api/update-message-status', authenticateToken, async (req, res) => {
  const { uzenetID, allapot } = req.body;
  const userId = req.user.id;
  if (!validateRequiredFields({ uzenetID, allapot }, res)) return;
  if (!['accepted', 'rejected'].includes(allapot)) {
    return sendErrorResponse(res, 'Érvénytelen állapot!', 400);
  }

  const updateQuery = 'UPDATE uzenetek SET allapot = ? WHERE uzenetID = ? AND cimzettID = ?';
  const updateResult = await executeQuery(updateQuery, [allapot, uzenetID, userId], res, 'Üzenet állapotának frissítése sikertelen');
  if (updateResult.affectedRows === 0) {
    return sendErrorResponse(res, 'Üzenet nem található vagy nem a tiéd!', 404);
  }

  const messageQuery = 'SELECT feladoID, posztID, nap, ora FROM uzenetek WHERE uzenetID = ?';
  const messageResult = await executeQuery(messageQuery, [uzenetID], res, 'Üzenet lekérése sikertelen');
  const { feladoID, posztID, nap, ora } = messageResult[0];

  const postQuery = 'SELECT fejlec FROM posztok WHERE posztID = ?';
  const postResult = await executeQuery(postQuery, [posztID], res, 'Poszt lekérése sikertelen');
  const posztFejlec = postResult[0].fejlec;

  const notificationContent = allapot === 'accepted'
    ? `Az időpont-foglalási kérelmedet elfogadták a következő poszthoz: "${posztFejlec}" - ${nap} ${ora}`
    : `Az időpont-foglalási kérelmedet elutasították a következő poszthoz: "${posztFejlec}" - ${nap} ${ora}`;
  await sendNotificationMessage(userId, feladoID, posztID, nap, ora, notificationContent, 'accepted', res);
  sendSuccessResponse(res, { message: `Üzenet ${allapot === 'accepted' ? 'elfogadva' : 'elutasítva'}` });
});

// Beszélgetések kezelése
app.get('/beszelgetesek', authenticateToken, async (req, res) => {
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
  const result = await executeQuery(query, [req.user.id, req.user.id], res, 'Beszélgetések lekérése sikertelen');
  sendSuccessResponse(res, { messages: result });
});

app.post('/beszelgetesek', authenticateToken, async (req, res) => {
  const { cimzettID, tartalom } = req.body;
  if (!validateRequiredFields({ cimzettID, tartalom }, res)) return;

  const query = 'INSERT INTO beszelgetesek (feladoID, cimzettID, tartalom) VALUES (?, ?, ?)';
  const result = await executeQuery(
    query,
    [req.user.id, cimzettID, tartalom],
    res,
    'Üzenet mentése sikertelen'
  );
  sendSuccessResponse(res, { message: 'Üzenet sikeresen elküldve!', beszelgetesID: result.insertId }, 201);
});

app.put('/beszelgetesek/:id/read', authenticateToken, async (req, res) => {
  const beszelgetesID = req.params.id;
  const query = 'UPDATE beszelgetesek SET olvasott = 1 WHERE beszelgetesID = ? AND cimzettID = ?';
  const result = await executeQuery(
    query,
    [beszelgetesID, req.user.id],
    res,
    'Olvasott állapot frissítése sikertelen'
  );
  if (result.affectedRows === 0) {
    return sendErrorResponse(res, 'Üzenet nem található vagy nem neked szól!', 404);
  }
  sendSuccessResponse(res, { message: 'Üzenet olvasottként jelölve!' });
});

// Kedvencek kezelése
app.get('/api/kedvencek', authenticateToken, async (req, res) => {
  const query = 'SELECT posztID FROM kedvencek WHERE userID = ?';
  const result = await executeQuery(query, [req.user.id], res, 'Kedvencek lekérése sikertelen');
  sendSuccessResponse(res, { favorites: result });
});

app.post('/api/kedvencek', authenticateToken, async (req, res) => {
  const { postId } = req.body;
  if (!validateRequiredFields({ postId }, res)) return;

  const postQuery = 'SELECT * FROM posztok WHERE posztID = ?';
  const postResult = await executeQuery(postQuery, [postId], res, 'Poszt ellenőrzése sikertelen');
  if (postResult.length === 0) {
    return sendErrorResponse(res, 'A poszt nem található!', 404);
  }

  const favoriteQuery = 'SELECT * FROM kedvencek WHERE userID = ? AND posztID = ?';
  const favoriteResult = await executeQuery(favoriteQuery, [req.user.id, postId], res, 'Kedvenc ellenőrzése sikertelen');
  if (favoriteResult.length > 0) {
    return sendErrorResponse(res, 'Ez a poszt már a kedvenceid között van!', 400);
  }

  const insertQuery = 'INSERT INTO kedvencek (userID, posztID) VALUES (?, ?)';
  await executeQuery(insertQuery, [req.user.id, postId], res, 'Kedvenc mentése sikertelen');
  sendSuccessResponse(res, { message: 'Poszt hozzáadva a kedvencekhez!' }, 201);
});

app.delete('/api/kedvencek/remove', authenticateToken, async (req, res) => {
  const { postId } = req.body;
  if (!validateRequiredFields({ postId }, res)) return;

  const query = 'DELETE FROM kedvencek WHERE userID = ? AND posztID = ?';
  const result = await executeQuery(query, [req.user.id, postId], res, 'Kedvenc törlése sikertelen');
  if (result.affectedRows === 0) {
    return sendErrorResponse(res, 'A poszt nem található a kedvenceid között!', 404);
  }
  sendSuccessResponse(res, { message: 'Poszt eltávolítva a kedvencekből!' });
});

// Elérhetőség kezelése
app.get('/api/user-status/:userID', authenticateToken, async (req, res) => {
  const { userID } = req.params;
  const query = 'SELECT lastActive FROM felhasznaloi_adatok WHERE userID = ?';
  const result = await executeQuery(query, [userID], res, 'Felhasználó státusz lekérése sikertelen');
  if (result.length === 0) {
    return sendErrorResponse(res, 'Felhasználó nem található', 404);
  }

  const lastActive = result[0].lastActive;
  const now = new Date();
  const fiveMinutesAgo = new Date(now - 5 * 60 * 1000);
  const isOnline = lastActive && new Date(lastActive) > fiveMinutesAgo;
  sendSuccessResponse(res, { isOnline });
});

// Vélemények kezelése
app.get('/api/velemenyek/:postId', authenticateToken, async (req, res) => {
  const query = `
    SELECT v.*, f.vezeteknev, f.keresztnev, f.profilkep 
    FROM velemenyek v
    JOIN felhasznaloi_adatok f ON v.userID = f.userID
    WHERE v.posztID = ?
    ORDER BY v.datum DESC
  `;
  const result = await executeQuery(query, [req.params.postId], res, 'Vélemények lekérése sikertelen');
  sendSuccessResponse(res, { opinions: result });
});

app.post('/api/velemenyek', authenticateToken, async (req, res) => {
  const { postId, text } = req.body;
  if (!validateRequiredFields({ postId, text }, res)) return;

  const query = 'INSERT INTO velemenyek (posztID, userID, szoveg, datum) VALUES (?, ?, ?, NOW())';
  await executeQuery(query, [postId, req.user.id, text], res, 'Vélemény mentése sikertelen');
  sendSuccessResponse(res, { message: 'Vélemény sikeresen hozzáadva' });
});

// Értékelések kezelése
app.post('/api/ertekelesek', authenticateToken, async (req, res) => {
  const { postId, rating } = req.body;
  if (!validateRequiredFields({ postId, rating }, res)) return;
  if (rating < 1 || rating > 5) {
    return sendErrorResponse(res, 'Érvénytelen értékelés!', 400);
  }

  const checkQuery = 'SELECT * FROM ertekelesek WHERE post_id = ? AND user_id = ?';
  const existingRating = await executeQuery(checkQuery, [postId, req.user.id], res, 'Értékelés ellenőrzése sikertelen');

  const updateAverageRating = async () => {
    const statsQuery = 'SELECT AVG(rating) as averageRating, COUNT(*) as ratingCount FROM ertekelesek WHERE post_id = ?';
    const stats = await executeQuery(statsQuery, [postId], res, 'Átlag kiszámítása sikertelen');
    const { averageRating, ratingCount } = stats[0];
    await executeQuery(
      'UPDATE posztok SET averageRating = ?, ratingCount = ? WHERE posztID = ?',
      [averageRating, ratingCount, postId],
      res,
      'Poszt frissítése sikertelen'
    );
  };

  if (existingRating.length > 0) {
    const updateQuery = 'UPDATE ertekelesek SET rating = ?, created_at = NOW() WHERE post_id = ? AND user_id = ?';
    await executeQuery(updateQuery, [rating, postId, req.user.id], res, 'Értékelés frissítése sikertelen');
    await updateAverageRating();
    sendSuccessResponse(res, { message: 'Értékelés frissítve!' });
  } else {
    const insertQuery = 'INSERT INTO ertekelesek (post_id, user_id, rating) VALUES (?, ?, ?)';
    await executeQuery(insertQuery, [postId, req.user.id, rating], res, 'Értékelés mentése sikertelen');
    await updateAverageRating();
    sendSuccessResponse(res, { message: 'Értékelés sikeresen mentve!' }, 201);
  }
});

app.get('/api/user-rating/:postId', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const query = 'SELECT rating FROM ertekelesek WHERE post_id = ? AND user_id = ?';
  const result = await executeQuery(query, [postId, req.user.id], res, 'Értékelés lekérése sikertelen');
  const rating = result.length > 0 ? result[0].rating : 0;
  sendSuccessResponse(res, { rating });
});

// Szerver indítása
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});