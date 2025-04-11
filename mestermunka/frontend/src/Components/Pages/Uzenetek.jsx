import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../UserContext";
import "../Stilusok/Uzenetek.css";
 
const Uzenetek = ({ onClose, setNewMessageCount, fetchNewMessages }) => {
  const { user } = useContext(UserContext);
  const [pendingMessages, setPendingMessages] = useState([]);
  const [notificationMessages, setNotificationMessages] = useState([]);
  const [loading, setLoading] = useState(true);
 
  const fetchMessages = async () => {
    if (!user) {
      setPendingMessages([]);
      setNotificationMessages([]);
      setNewMessageCount(0);
      setLoading(false);
      return;
    }
 
    try {
      const response = await axios.get("http://localhost:5020/api/messages", { withCredentials: true });
      if (response.data.success) {
        const userPendingMessages = response.data.messages.filter(
          (msg) => msg.cimzettID === user.userID && msg.allapot === "pending"
        );
        console.log("Pending messages in Uzenetek:", userPendingMessages);
        setPendingMessages(userPendingMessages);
 
        const userNotificationMessages = response.data.messages.filter(
          (msg) => msg.cimzettID === user.userID && (msg.allapot === "accepted" || msg.allapot === "rejected")
        );
        console.log("Notification messages in Uzenetek:", userNotificationMessages);
        setNotificationMessages(userNotificationMessages);
 
        setNewMessageCount(userPendingMessages.length);
      }
    } catch (error) {
      console.error("Hiba az üzenetek betöltésekor:", error);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchMessages();
  }, [user, setNewMessageCount]);
 
  const handleAccept = async (uzenetID, posztID, nap, ora) => {
    try {
      const response = await axios.post(
        "http://localhost:5020/api/accept-booking",
        { uzenetID, posztID, nap, ora },
        { withCredentials: true }
      );
      if (response.data.success) {
        setPendingMessages((prev) =>
          prev.filter((msg) => msg.uzenetID !== uzenetID)
        );
        const remainingPendingMessages = pendingMessages.filter(
          (msg) => msg.uzenetID !== uzenetID
        );
        setNewMessageCount(remainingPendingMessages.length);
        await fetchMessages(); // Frissítjük az üzeneteket
        await fetchNewMessages(); // Frissítjük a Navbar-t
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Hiba az elfogadás során:", error);
      alert("Hiba történt az elfogadás során!");
    }
  };
 
  const handleReject = async (uzenetID) => {
    try {
      const response = await axios.put(
        "http://localhost:5020/api/update-message-status",
        { uzenetID, allapot: "rejected" },
        { withCredentials: true }
      );
      if (response.data.success) {
        setPendingMessages((prev) =>
          prev.filter((msg) => msg.uzenetID !== uzenetID)
        );
        const remainingPendingMessages = pendingMessages.filter(
          (msg) => msg.uzenetID !== uzenetID
        );
        setNewMessageCount(remainingPendingMessages.length);
        await fetchMessages(); // Frissítjük az üzeneteket
        await fetchNewMessages(); // Frissítjük a Navbar-t
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Hiba az elutasítás során:", error);
      alert("Hiba történt az elutasítás során!");
    }
  };
 
  if (loading) return <div className="dropdown-content">Üzenetek betöltése...</div>;
 
  return (
    <div className="dropdown-content message-dropdown">
      <h3>Üzenetek</h3>
     
      <h4>Bejövő kérelmek</h4>
      {pendingMessages.length === 0 ? (
        <p>Nincs új kérelem.</p>
      ) : (
        <ul>
          {pendingMessages.map((msg) => (
            <li key={msg.uzenetID}>
              <p>
                <strong>Feladó:</strong> {msg.feladoNev || "Ismeretlen"}<br />
                <strong>Tartalom:</strong> {msg.tartalom}<br />
                <strong>Poszt:</strong> {msg.fejlec || "N/A"}<br />
                <strong>Időpont:</strong> {msg.nap} {msg.ora}<br />
                <strong>Állapot:</strong> {msg.allapot}<br />
                <strong>Küldve:</strong>{" "}
                {new Date(msg.kuldesIdopont).toLocaleString("hu-HU")}
              </p>
              {msg.allapot === "pending" && msg.cimzettID === user.userID && (
                <>
                  <button onClick={() => handleAccept(msg.uzenetID, msg.posztID, msg.nap, msg.ora)}>
                    Elfogad
                  </button>
                  <button onClick={() => handleReject(msg.uzenetID)}>Elutasít</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
 
      <h4>Értesítések</h4>
      {notificationMessages.length === 0 ? (
        <p>Nincs új értesítés.</p>
      ) : (
        <ul>
          {notificationMessages.map((msg) => (
            <li key={msg.uzenetID}>
              <p>
                <strong>Feladó:</strong> {msg.feladoNev || "Ismeretlen"}<br />
                <strong>Tartalom:</strong> {msg.tartalom}<br />
                <strong>Poszt:</strong> {msg.fejlec || "N/A"}<br />
                <strong>Időpont:</strong> {msg.nap} {msg.ora}<br />
                <strong>Állapot:</strong> {msg.allapot}<br />
                <strong>Küldve:</strong>{" "}
                {new Date(msg.kuldesIdopont).toLocaleString("hu-HU")}
              </p>
            </li>
          ))}
        </ul>
      )}
 
      <button onClick={onClose}>Bezárás</button>
    </div>
  );
};
 
export default Uzenetek;