import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Axios from "axios";
import { UserContext } from "../UserContext";
import "./Stilusok/Navbar.css";
import logo from "../assets/sosmunkalogo.png";
import fioklogo from "../assets/profile-blank.png";

const Navbar = () => {
  const { user, logoutUser } = useContext(UserContext);
  const [accountDropdown, setAccountDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null); // Referencia a dropdownhoz

  // Kijelentkezés kezelése
  const handleLogout = () => {
    Axios.post("http://localhost:5020/logout", {}, { withCredentials: true })
      .then(() => {
        logoutUser();
        navigate("/Home"); // Főoldalra navigálás
      })
      .catch((error) => {
        console.error("Hiba a kijelentkezés során:", error);
      });
  };

  // Dropdown bezárása, ha kattintunk a dropdownon kívül
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAccountDropdown(false); // Bezárjuk a dropdownot
      }
    };

    // Eseményfigyelő hozzáadása
    document.addEventListener("mousedown", handleClickOutside);

    // Eseményfigyelő eltávolítása a komponens unmountolásakor
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/">
          <img src={logo} alt="Company Logo" className="logo-img2" />
        </Link>
      
        <ul className="nav-menu-left">
  <li>
    <NavLink
      className="nav-link"
      to="/posztok"
      style= {{  fontWeight: '700', fontSize: '24px' }}  // Inline stílus a vastagabb betűkhöz
    >
      Posztok
    </NavLink>
  </li>
</ul>


        <div className="navbar-text">S.O.S. Munka</div>

        <ul className="nav-menu-right">
          <li
            className="dropdown"
            ref={dropdownRef} // Referencia hozzáadva
            onClick={() => setAccountDropdown(!accountDropdown)} // Csak kattintásra vált
          >
            <NavLink className="dropbtn" to="#">
              <img src={fioklogo} alt="Fiók Logo" className="logo-img" />
            </NavLink>
            {accountDropdown && (
              <ul className="dropdown-content">
                {user ? (
                  // Ha a felhasználó be van jelentkezve
                  <>
                    <li>
                      <NavLink to="/fiok">Fiók Beállítások</NavLink>
                    </li>
                    <li>
                      <NavLink to="/kedvencek">Kedvenceim</NavLink>
                    </li>
                    <li>
                      <NavLink to="/sajatposztok">Posztjaim</NavLink>
                    </li>
                    <li>
                      <button className="logout-btn" onClick={handleLogout}>
                        Kijelentkezés
                      </button>
                    </li>
                  </>
                ) : (
                  // Ha a felhasználó nincs bejelentkezve
                  <>
                    <li>
                      <NavLink to="/regisztracio">Regisztrálok</NavLink>
                    </li>
                    <li>
                      <NavLink to="/bejelentkezes">Bejelentkezem</NavLink>
                    </li>
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