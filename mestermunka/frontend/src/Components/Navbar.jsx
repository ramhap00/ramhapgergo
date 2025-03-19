import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import Axios from "axios";
import { UserContext } from "../UserContext";
import "./Stilusok/Navbar.css";
import logo from "../assets/sosmunkalogo.png";
import fioklogo from "../assets/profile-blank.png";
import messageIcon from "../assets/csengo.png";
import "bootstrap";
import axios from "axios";

const Navbar = () => {
  const { user, logoutUser } = useContext(UserContext);
  const [accountDropdown, setAccountDropdown] = useState(false);
  const [messageDropdown, setMessageDropdown] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [newMessages, setNewMessages] = useState([]);
  const [prevMessages, setPrevMessages] = useState([]);
  const profileImage = user?.profilkep && user.profilkep !== ""
    ? `http://localhost:5020/uploads/${user.profilkep}`
    : fioklogo;
    console.log("🔵 ProfileImage értéke:", profileImage);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const messageRef = useRef(null);
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
    fetchNewMessages(); // Azonnali ellenőrzés az első renderkor
    const interval = setInterval(() => {
      fetchNewMessages();
    }, 10000); // 10 másodpercenként

    return () => clearInterval(interval); // Tisztítás, amikor a komponens unmountol
  }, [user]);

  const handleLogout = () => {
    Axios.post("http://localhost:5020/logout", {}, { withCredentials: true })
      .then(() => {
        logoutUser();
        localStorage.removeItem("userId");
        setNewMessageCount(0);
        setNewMessages([]);
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

  const handleMessageClick = (msg) => {
    navigate("/idopont-foglalasok", { state: { message: msg } });
    setMessageDropdown(false);
  };

  const navbarClass = location.pathname === "/" ? "home-navbar" : "";

  return (
    <nav id="flex-container" className={`navbar navbar-expand-lg navbar-light bg-light ${navbarClass}`}>
      <div className="col-sm-1">
        <Link to="/">
          <img src={logo} alt="Company Logo" className="logo-img1" />
        </Link>
      </div>
      <div className="col-sm-4">
        <ul className="nav-menu-left">
          <li>
            <NavLink className="nav-link" to="/posztok" style={{ fontWeight: "700", fontSize: "16px" }}>
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
              <NavLink className="dropbtn" to="#" onClick={(e) => e.preventDefault()}>
                <img src={messageIcon} alt="Üzenetek" className="logo-img2" />
                {newMessageCount > 0 && <span className="new-message-dot"></span>}
              </NavLink>
              {messageDropdown && (
                <div className="message-dropdown-content">
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