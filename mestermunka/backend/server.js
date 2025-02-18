const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();
 
const app = express();
app.use(express.json());
app.use(cors());
 
// **MySQL adatbázis kapcsolat**
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // MySQL felhasználónév
  password: "", // MySQL jelszó (ha van)
  port: "3306",
  database: "sos_munka",
});
 
db.connect((err) => {
  if (err) {
    console.error("🔴 MySQL hiba:", err);
  } else {
    console.log("✅ MySQL kapcsolódva!");
  }
});
 
 
 
 
// **Felhasználók lekérdezése**
// URL: "http://localhost:5000/users"
app.get("/users", (req, res) => {
    db.query("SELECT * FROM latogatok", (err, results) => {
      if (err) {
        console.error("🔴 Hiba:", err);
        return res.status(500).json({ error: "Adatbázis hiba" });
      }
      res.json(results);
    });
  });
 
 
 
 
 
 
 
// **Szerver indítása**
const PORT = 5020;
app.listen(PORT, () => {
  console.log(`🚀 Szerver fut az ${PORT}-es porton`);
});