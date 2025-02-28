import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Axios from "axios";
import { UserContext } from "../UserContext";
import "./Stilusok/Navbar.css";
import logo from "../assets/sosmunkalogo.png";
import fioklogo from "../assets/profile-blank.png";
import "bootstrap"

const Navbar = () => {
  const { user, logoutUser } = useContext(UserContext);
  const [accountDropdown, setAccountDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null); 

  
  const handleLogout = () => {
    Axios.post("http://localhost:5020/logout", {}, { withCredentials: true })
      .then(() => {
        logoutUser();
        navigate("/Home"); 
      })
      .catch((error) => {
        console.error("Hiba a kijelentkezés során:", error);
      });
  };

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAccountDropdown(false); 
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav id="flex-container" className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="col-sm-1"><Link to="/">
          <img src={logo} alt="Company Logo" className="logo-img1" />
        </Link></div>
      <div className="col-sm-3"><ul className="nav-menu-left">
        <li>
          <NavLink className="nav-link" to="/posztok" style= {{  fontWeight: '700', fontSize: '24px' }}>Posztok</NavLink>
        </li>
      </ul></div>
      <div className="col-sm-6" id="navbar-text">S.O.S. Munka</div>
      <div className="col-xs-1"><ul className="nav-menu-right">
          <li
            className="dropdown"
            ref={dropdownRef} 
            onClick={() => setAccountDropdown(!accountDropdown)} 
          >
            <NavLink className="dropbtn" to="#">
              <img src={fioklogo} alt="Fiók Logo" className="logo-img2" />
            </NavLink>
            {accountDropdown && (
              <ul className="dropdown-content">
                {user ? (
                  
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
        </ul></div>
    </nav>
  );
};

export default Navbar;