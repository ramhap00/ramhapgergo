const express = require("express");
const app = express();
const cors = require("cors");
const mysql = require("mysql");
const bodyParser = require("'body-parser");
app.use(body.Parser.json());
app.use(cors());