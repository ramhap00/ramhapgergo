import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Stilusok/Navbar.css";
import logo from "../assets/sosmunkalogo.png"; // Logó importálása
import fioklogo from "../assets/fiok.png"

const Navbar = () => {
  const [dropdown, setDropdown] = useState(false);
  const [accountDropdown, setAccountDropdown] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/">
          <img src={logo} alt="Company Logo" className="logo-img" />
        </Link>

        {/* Navigációs linkek a logó mellett */}
        <ul className="nav-menu-left">
          <li><NavLink className="nav-link" to="/">Főoldal</NavLink></li>
          <li><NavLink className="nav-link" to="/posztok">Posztok</NavLink></li>
        </ul>

        {/* Középre igazított "S.O.S. Munka" */}
        <div className="navbar-text">S.O.S. Munka</div>

        <ul className="nav-menu-right">
          {/* Kategória dropdown első helyen */}
          <li
            className="dropdown"
            onMouseEnter={() => setDropdown(true)}
            onMouseLeave={() => setDropdown(false)}
          >
            <NavLink className="dropbtn" to="/kategoriak">Kategória</NavLink>
            {dropdown && (
              <ul className="dropdown-content">
                <li><a href="#">2019</a></li>
                <li><a href="#">2018</a></li>
                <li><a href="#">2017</a></li>
              </ul>
            )}
          </li>

          {/* Fiók dropdown második helyen */}
          <li
            className="dropdown"
            onMouseEnter={() => setAccountDropdown(true)}
            onMouseLeave={() => setAccountDropdown(false)}
          >
            <NavLink className="dropbtn" to="#"><img src={fioklogo} alt="Company Logo" className="logo-img" /></NavLink>
            {accountDropdown && (
              <ul className="dropdown-content">
                <li><NavLink to="/regisztracio">Regisztrálok</NavLink></li>
                <li><NavLink to="/bejelentkezes">Bejelentkezem</NavLink></li>
              </ul>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
