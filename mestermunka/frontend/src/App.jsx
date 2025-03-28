import React from "react";
import { UserProvider } from "./UserContext"; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Pages/Home";
import Bejelentkezes from "./Components/Pages/Bejelentkezes";
import Regisztracio from "./Components/Pages/Regisztracio";
import Posztok from "./Components/Pages/Posztok";
import Premium from "./Components/Pages/Premium";
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
import Footer from "./Components/Pages/Footer.jsx";
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
          <Route path="/premium" element={<Premium />} />
          <Route path="/posztok" element={<Posztok />} />
          <Route path="/regisztracio" element={<Regisztracio />} />
          <Route path="/sajatposztok" element={<Sajatposztok />} />
          <Route path="/jelszo" element={<Jelszo />} />
          <Route path="/posztotcsinalok" element={<Posztotcsinalok />} />
          <Route path="/idopont-foglalasok" element={<IdopontFoglalasok />} />
          <Route path="/beszelgetesek" element={<Beszelgetesek />} />
        </Routes>
        <Footer/>
      </Router>
    </UserProvider>
  );
}

export default App;