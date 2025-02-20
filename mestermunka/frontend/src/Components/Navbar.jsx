import React, { useState, useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom"; // useNavigate hozzáadva
import Axios from "axios"; // Axios importálása
import { UserContext } from "../UserContext"; // Importáljuk a UserContext-et
import "./Stilusok/Navbar.css";
import logo from "../assets/sosmunkalogo.png"; // Logó importálása
import fioklogo from "../assets/fiok.png";

const Navbar = () => {
  const { user, logoutUser } = useContext(UserContext);
  const [dropdown, setDropdown] = useState(false);
  const [accountDropdown, setAccountDropdown] = useState(false);
  const navigate = useNavigate(); // Navigáció beállítása

  // Kijelentkezés kezelése
  const handleLogout = () => {
    Axios.post("http://localhost:5020/logout", {}, { withCredentials: true }) // Sütik törlése
      .then(() => {
        logoutUser();
        navigate(0); // Oldal frissítése
      })
      .catch((error) => {
        console.error("Hiba a kijelentkezés során:", error);
      });
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/">
          <img src={logo} alt="Company Logo" className="logo-img" />
        </Link>

        <ul className="nav-menu-left">
          <li><NavLink className="nav-link" to="/posztok">Posztok</NavLink></li>
        </ul>

        <div className="navbar-text">S.O.S. Munka</div>

        <ul className="nav-menu-right">
          <li
            className="dropdown"
            onMouseEnter={() => setDropdown(true)}
            onMouseLeave={() => setDropdown(false)}
          >
          </li>

          <li
            className="dropdown"
            onMouseEnter={() => setAccountDropdown(true)}
            onMouseLeave={() => setAccountDropdown(false)}
          >
            <NavLink className="dropbtn" to="#">
              <img src={fioklogo} alt="Fiók Logo" className="logo-img" />
            </NavLink>
            {accountDropdown && (
              <ul className="dropdown-content">
                {user ? (
                  <>
                    <li><NavLink to="/fiok">Fiók Beállítások</NavLink></li>
                    <li><button onClick={handleLogout}>Kijelentkezés</button></li>
                  </>
                ) : (
                  <>
                    <li><NavLink to="/regisztracio">Regisztrálok</NavLink></li>
                    <li><NavLink to="/bejelentkezes">Bejelentkezem</NavLink></li>
                  </>
                )}
              </ul>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
