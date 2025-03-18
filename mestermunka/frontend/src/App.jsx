import React from "react";
import { UserProvider } from "./UserContext"; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Pages/Home";
import Bejelentkezes from "./Components/Pages/Bejelentkezes";
import Regisztracio from "./Components/Pages/Regisztracio";
import Posztok from "./Components/Pages/Posztok";
import Kedvencek from "./Components/Pages/Kedvencek";
import Kategoria from "./Components/Pages/kategoria";
import Fiok from "./Components/Pages/Fiok";
import Navbar from './Components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'tachyons';
import Sajatposztok from "./Components/Pages/Sajatposztok";
import Jelszo from "./Components/Pages/Jelszo";
import Posztotcsinalok from "./Components/Pages/Posztotcsinalok";
import IdopontFoglalasok from "./Components/Pages/IdopontFoglalasok";
import Beszelgetesek from "./Components/Pages/Beszelgetesek";
import './App.css';

function App() {
  return (
    <UserProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bejelentkezes" element={<Bejelentkezes />} />
          <Route path="/fiok" element={<Fiok />} />
          <Route path="/home" element={<Home />} />
          <Route path="/kategoria" element={<Kategoria />} />
          <Route path="/kedvencek" element={<Kedvencek />} />
          <Route path="/posztok" element={<Posztok />} />
          <Route path="/regisztracio" element={<Regisztracio />} />
          <Route path="/sajatposztok" element={<Sajatposztok />} />
          <Route path="/jelszo" element={<Jelszo />} />
          <Route path="/posztotcsinalok" element={<Posztotcsinalok />} />
          <Route path="/idopont-foglalasok" element={<IdopontFoglalasok />} />
          <Route path="/beszelgetesek" element={<Beszelgetesek />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;