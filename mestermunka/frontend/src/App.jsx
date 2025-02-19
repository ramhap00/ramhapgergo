
import React from "react"
import Home from "./Components/Pages/Home"
import Bejelentkezes from "./Components/Pages/Bejelentkezes"
import Regisztracio from "./Components/Pages/Regisztracio"
import Posztok from "./Components/Pages/Posztok"
import Kedvencek from "./Components/Pages/Kedvencek"
import Kategoria from "./Components/Pages/kategoria"
import Fiok from "./Components/Pages/Fiok"
import{Route, Routes, BrowserRouter } from "react-router-dom"
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
import 'tachyons'
import Navbar from './Components/Navbar'
import Axios from 'axios'


function App() {
  

  return (
    <>
      <div>
      
      <Navbar></Navbar>
      <Routes>

        <Route path="/" element= {<Home/>}/>
        <Route path="/bejelentkezes" element= {<Bejelentkezes/>}/>
        <Route path="/fiok" element= {<Fiok/>}/>
        <Route path="/home" element= {<Home/>}/>
        <Route path="/kategoria" element= {<Kategoria/>}/>
        <Route path="/kedvencek" element= {<Kedvencek/>}/>
        <Route path="/posztok" element= {<Posztok/>}/>
        <Route path="/regisztracio" element= {<Regisztracio/>}/>
        
      </Routes>
      </div>
      
    </>
  )
}

export default App

