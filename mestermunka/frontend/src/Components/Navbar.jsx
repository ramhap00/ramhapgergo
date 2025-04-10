import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Axios from "axios";
import { UserContext } from "../UserContext";
import "./Stilusok/Navbar.css";
import logo from "../assets/sosmunkalogo.png";
import fioklogo from "../assets/profile-blank.png";
import messageIcon from "../assets/ringbell.png";
import axios from "axios";

const Navbar = () => {
  const { user, logoutUser } = useContext(UserContext);
  const [accountDropdown, setAccountDropdown] = useState(false);
  const [messageDropdown, setMessageDropdown] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [newMessages, setNewMessages] = useState([]);
  const [prevMessages, setPrevMessages] = useState([]);
  const profileImage = user?.profilkep && user.profilkep !== ""
    ? `http://localhost:5020/uploads/${user.profilkep}`
    : fioklogo;

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const messageRef = useRef(null);
  const hamburgerRef = useRef(null);
  const location = useLocation();

  const fetchNewMessages = async () => {
    if (!user) {
      setNewMessageCount(0);
      setNewMessages([]);
      return;
    }
    try {
      const response = await axios.get("http://localhost:5020/api/messages", { withCredentials: true });
      if (response.data.success) {
        const unreadMessages = response.data.messages.filter(
          (msg) => msg.cimzettID === user.userID && msg.allapot === "pending"
        );

        if (prevMessages.length !== unreadMessages.length) {
          const newIncoming = unreadMessages.filter(
            (newMsg) => !prevMessages.some((prevMsg) => prevMsg.uzenetID === newMsg.uzenetID)
          );
          if (newIncoming.length > 0) {
            setNewMessages(newIncoming);
          }
        }

        setNewMessageCount(unreadMessages.length);
        setPrevMessages(unreadMessages);
      }
    } catch (error) {
      console.error("Hiba az új üzenetek lekérdezésekor:", error);
    }
  };

  useEffect(() => {
    fetchNewMessages();
    const interval = setInterval(() => {
      fetchNewMessages();
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    console.log("Kijelentkezés megkezdése...");
    Axios.post("http://localhost:5020/logout", {}, { withCredentials: true })
      .then(() => {
        console.log("Sikeres kijelentkezés a szerverről");
        logoutUser();
        localStorage.removeItem("userId");
        setNewMessageCount(0);
        setNewMessages([]);
        setHamburgerOpen(false);
        navigate("/home");
      })
      .catch((error) => {
        console.error("Hiba a kijelentkezés során:", error);
      });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target) &&
        !event.target.closest(".hamburger-menu-link") &&
        !event.target.closest(".logout-btn")
      ) {
        setHamburgerOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAccountDropdown(false);
      }
      if (messageRef.current && !messageRef.current.contains(event.target)) {
        setMessageDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMessageClick = (msg) => {
    setMessageDropdown(false);
    setHamburgerOpen(false);
    navigate("/idopont-foglalasok", { state: { message: msg } });
  };

  const handleNavClick = (path) => {
    console.log(`Navigálok: ${path}`);
    navigate(path);
    setHamburgerOpen(false);
  };

  const navbarClass = location.pathname === "/" ? "home-navbar" : "";

  return (
    <nav
      id="flex-container"
      className={`navbar navbar-expand-lg navbar-light bg-light ${navbarClass}`}
      style={{ borderBottom: "2px solid white" }}
    >
      <div className="col-sm-2 col-2">
        <Link to="/">
          <img src={logo} alt="Company Logo" className="logo-img1" />
        </Link>
      </div>

      <div className="col-sm-3 col-3 nav-menu-left-wrapper">
        <ul className="nav-menu-left">
          <li>
            <NavLink className="nav-link" to="/posztok" style={{ fontWeight: "700", fontSize: "16px" }}>
              Posztok
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="col-sm-4 col-4 navbar-text-wrapper">
        <div id="navbar-text">S.O.S. Munka</div>
      </div>

      {/* Desktop nézet: üzenetek és fiók ikonok */}
      <div className="col-xs-1 desktop-menu">
        <ul className="nav-menu-right">
          <li
            className="dropdown message-item"
            ref={messageRef}
            onClick={() => setMessageDropdown(!messageDropdown)}
          >
            <div className="message-icon-wrapper">
              <NavLink className="dropbtn" to="#" onClick={(e) => e.preventDefault()}>
                <img src={messageIcon} alt="Üzenetek" className="logo-img2" />
                {newMessageCount > 0 && <span className="new-message-dot"></span>}
              </NavLink>
              <div className={`message-dropdown-content ${messageDropdown ? "show" : ""}`}>
                <div className="message-dropdown-header">
                  <span className="notifications-title">Értesítések</span>
                  <button
                    className="close-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMessageDropdown(false);
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div className="message-list">
                  {newMessages.length > 0 ? (
                    newMessages.map((msg) => (
                      <div
                        key={msg.uzenetID}
                        className="message-item-content"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMessageClick(msg);
                        }}
                      >
                        Jött egy új kérelmed! <strong>{msg.feladoNev}</strong> a(z) "<strong>{msg.fejlec}</strong>" poszthoz kért időpontot: <strong>{msg.nap} {msg.ora}</strong>
                      </div>
                    ))
                  ) : (
                    <div className="no-messages">Nincs új kérelem</div>
                  )}
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div className="col-xs-1 desktop-menu">
        <ul className="nav-menu-right">
          <li
            className="dropdown profile-item"
            ref={dropdownRef}
            onClick={() => setAccountDropdown(!accountDropdown)}
          >
            <NavLink className="dropbtn" to="#" onClick={(e) => e.preventDefault()}>
              <img src={profileImage} alt="Fiók Logo" className="logo-img2" />
            </NavLink>
            <ul className={`dropdown-content ${accountDropdown ? "show" : ""}`}>
              {user ? (
                <>
                  <li>
                    <NavLink className="fiokgomb" to="/fiok">Fiók Beállítások</NavLink>
                  </li>
                  <li>
                    <NavLink className="fiokgomb" to="/beszelgetesek">Üzenetek</NavLink>
                  </li>
                  {user && user.munkasreg === 1 && (
                    <li>
                      <NavLink className="fiokgomb" to="/sajatposztok">Posztjaim</NavLink>
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
                    <NavLink className="fiokgomb" to="/regisztracio">Regisztrálok</NavLink>
                  </li>
                  <li>
                    <NavLink className="fiokgomb" to="/bejelentkezes">Bejelentkezem</NavLink>
                  </li>
                </>
              )}
            </ul>
          </li>
        </ul>
      </div>

      {/* Mobil nézet: üzenetek ikon és hamburger menü */}
      <div className="mobile-menu col-3">
        <div className="message-icon-wrapper mobile-message-icon">
          <div
            className="dropdown message-item"
            ref={messageRef}
            onClick={() => setMessageDropdown(!messageDropdown)}
          >
            <NavLink className="dropbtn" to="#" onClick={(e) => e.preventDefault()}>
              <img src={messageIcon} alt="Üzenetek" className="logo-img2" />
              {newMessageCount > 0 && <span className="new-message-dot"></span>}
            </NavLink>
            <div className={`message-dropdown-content ${messageDropdown ? "show" : ""}`}>
              <div className="message-dropdown-header">
                <span className="notifications-title">Értesítések</span>
                <button
                  className="close-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMessageDropdown(false);
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="message-list">
                {newMessages.length > 0 ? (
                  newMessages.map((msg) => (
                    <div
                      key={msg.uzenetID}
                      className="message-item-content"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMessageClick(msg);
                      }}
                    >
                      Jött egy új kérelmed! <strong>{msg.feladoNev}</strong> a(z) "<strong>{msg.fejlec}</strong>" poszthoz kért időpontot: <strong>{msg.nap} {msg.ora}</strong>
                    </div>
                  ))
                ) : (
                  <div className="no-messages">Nincs új kérelem</div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div
          className="hamburger-icon"
          onClick={() => setHamburgerOpen(!hamburgerOpen)}
          ref={hamburgerRef}
        >
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
        </div>
      </div>

      {/* Hamburger lenyíló menü */}
      {hamburgerOpen && (
        <div className="hamburger-menu">
          <ul className="hamburger-menu-items">
            {user ? (
              <>
                <li>
                  <div
                    className="hamburger-menu-link"
                    onClick={() => handleNavClick("/fiok")}
                  >
                    Fiók Beállítások
                  </div>
                </li>
                <li>
                  <div
                    className="hamburger-menu-link"
                    onClick={() => handleNavClick("/beszelgetesek")}
                  >
                    Üzenetek
                  </div>
                </li>
                {user && user.munkasreg === 1 && (
                  <li>
                    <div
                      className="hamburger-menu-link"
                      onClick={() => handleNavClick("/sajatposztok")}
                    >
                      Posztjaim
                    </div>
                  </li>
                )}
                <li>
                  <button
                    style={{ backgroundColor: "transparent" }}
                    className="logout-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogout();
                    }}
                  >
                    Kijelentkezés
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <div
                    className="hamburger-menu-link"
                    onClick={() => handleNavClick("/regisztracio")}
                  >
                    Regisztrálok
                  </div>
                </li>
                <li>
                  <div
                    className="hamburger-menu-link"
                    onClick={() => handleNavClick("/bejelentkezes")}
                  >
                    Bejelentkezem
                  </div>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;