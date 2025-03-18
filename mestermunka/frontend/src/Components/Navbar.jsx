import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Axios from "axios";
import { UserContext } from "../UserContext";
import "./Stilusok/Navbar.css";
import logo from "../assets/sosmunkalogo.png";
import fioklogo from "../assets/profile-blank.png";
import messageIcon from "../assets/uzenetek.png";
import "bootstrap";
import Uzenetek from "./Pages/Uzenetek";
import axios from "axios";

const Navbar = () => {
  const { user, logoutUser } = useContext(UserContext);
  const [accountDropdown, setAccountDropdown] = useState(false);
  const [messageDropdown, setMessageDropdown] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const profileImage = user?.profilkep ? `http://localhost:5020/uploads/${user.profilkep}` : fioklogo;
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const messageRef = useRef(null);

  const fetchNewMessages = async () => {
    if (!user) {
      setNewMessageCount(0);
      return;
    }
    try {
      const response = await axios.get("http://localhost:5020/api/messages", { withCredentials: true });
      if (response.data.success) {
        const unreadMessages = response.data.messages.filter(
          (msg) => msg.cimzettID === user.userID && msg.allapot === "pending"
        );
        console.log("Unread messages:", unreadMessages);
        setNewMessageCount(unreadMessages.length);
      }
    } catch (error) {
      console.error("Hiba az új üzenetek lekérdezésekor:", error);
    }
  };

  useEffect(() => {
    fetchNewMessages();
  }, [user]);

  const handleLogout = () => {
    Axios.post("http://localhost:5020/logout", {}, { withCredentials: true })
      .then(() => {
        logoutUser();
        localStorage.removeItem("userId");
        setNewMessageCount(0);
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
      if (messageRef.current && !messageRef.current.contains(event.target)) {
        setMessageDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    console.log("🔵 Navbarban kapott user:", user);
  }, [user]);

  return (
    <nav id="flex-container" className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="col-sm-1">
        <Link to="/">
          <img src={logo} alt="Company Logo" className="logo-img1" />
        </Link>
      </div>
      <div className="col-sm-4">
        <ul className="nav-menu-left">
          <li>
            <NavLink className="nav-link" to="/posztok" style={{ fontWeight: '700', fontSize: '20px' }}>
              Posztok
            </NavLink>
          </li>
        </ul>
      </div>
      <div className="col-sm-4" id="navbar-text">
        S.O.S. Munka
      </div>
      <div className="col-xs-1">
        <ul className="nav-menu-right">
          <li
            className="dropdown message-item"
            ref={messageRef}
            onClick={() => setMessageDropdown(!messageDropdown)}
          >
            <div className="message-icon-wrapper">
              <NavLink className="dropbtn" to="#">
                <img src={messageIcon} alt="Üzenetek" className="logo-img2" />
                {newMessageCount > 0 && (
                  <span className="new-message-dot"></span>
                )}
              </NavLink>
              {messageDropdown && (
                <Uzenetek
                  onClose={() => setMessageDropdown(false)}
                  setNewMessageCount={setNewMessageCount}
                  fetchNewMessages={fetchNewMessages} // Átadjuk a fetchNewMessages függvényt
                />
              )}
            </div>
          </li>
        </ul>
      </div>
      <div className="col-xs-1">
        <ul className="nav-menu-right">
          
          <li
            className="dropdown profile-item"
            ref={dropdownRef}
            onClick={() => setAccountDropdown(!accountDropdown)}
          >
            <NavLink className="dropbtn" to="#">
              <img src={profileImage} alt="Fiók Logo" className="logo-img2" />
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
                      <NavLink to="/beszelgetesek">Üzenetek</NavLink>
                    </li>
                    {user && user.munkasreg === 1 && (
                      <li>
                        <NavLink to="/sajatposztok">Posztjaim</NavLink>
                      </li>
                    )}
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
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;