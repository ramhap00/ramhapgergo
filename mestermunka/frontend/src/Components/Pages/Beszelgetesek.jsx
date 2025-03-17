import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../Stilusok/Beszelgetesek.css";

const Beszelgetesek = () => {
  const location = useLocation();
  const [selectedUser, setSelectedUser] = useState(location.state?.user || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const getCurrentUserId = () => {
    const token = document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1];
    if (token) {
      const decoded = jwtDecode(token);
      return decoded.userID;
    }
    return null;
  };

  const fetchMessages = async () => {
    setLoading(true);
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;

    try {
      const response = await axios.get("http://localhost:5020/beszelgetesek", {
        withCredentials: true,
      });
      if (response.data.success) {
        setMessages(response.data.messages);

        const uniqueUsers = [];
        const userMap = new Map();
        response.data.messages.forEach(msg => {
          const otherUserId = msg.feladoID === currentUserId ? msg.cimzettID : msg.feladoID;
          const otherUserName = msg.feladoID === currentUserId 
            ? `${msg.cimzettVezeteknev} ${msg.cimzettKeresztnev}` 
            : `${msg.feladoVezeteknev} ${msg.feladoKeresztnev}`;
          const otherUserProfilePic = msg.feladoID === currentUserId 
            ? msg.cimzettProfilkep 
            : msg.feladoProfilkep;

          if (!userMap.has(otherUserId)) {
            userMap.set(otherUserId, {
              id: otherUserId,
              name: otherUserName,
              profilePic: otherUserProfilePic || "default-profile.png",
            });
          }
        });
        setUsers(Array.from(userMap.values()));
      }
    } catch (error) {
      console.error("Hiba az üzenetek lekérdezésekor:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const currentUserId = getCurrentUserId();
    if (!newMessage.trim() || !selectedUser || !currentUserId) return;

    try {
      const response = await axios.post(
        "http://localhost:5020/beszelgetesek",
        {
          cimzettID: selectedUser.id,
          tartalom: newMessage,
        },
        { withCredentials: true }
      );
      if (response.data.success) {
        setNewMessage("");
        fetchMessages(); // Frissítjük az üzeneteket küldés után
      }
    } catch (error) {
      console.error("Hiba az üzenet küldésekor:", error);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await axios.put(`http://localhost:5020/beszelgetesek/${messageId}/read`, {}, { withCredentials: true });
      fetchMessages(); // Frissítjük az üzeneteket olvasás után
    } catch (error) {
      console.error("Hiba az üzenet olvasottként jelölésekor:", error);
    }
  };

  // Csak egyszer fut le az oldal betöltésekor
  useEffect(() => {
    fetchMessages();
  }, []); // Üres függőségi tömb, így csak egyszer fut le

  useEffect(() => {
    if (location.state?.user && !users.find(u => u.id === location.state.user.id)) {
      setUsers(prev => [...prev, location.state.user]);
      setSelectedUser(location.state.user);
    }
  }, [location.state]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    const unreadMessages = messages.filter(
      msg => msg.cimzettID === getCurrentUserId() && msg.feladoID === user.id && !msg.olvasott
    );
    unreadMessages.forEach(msg => markAsRead(msg.beszelgetesID));
  };

  const filteredMessages = selectedUser 
    ? messages.filter(msg => 
        (msg.feladoID === getCurrentUserId() && msg.cimzettID === selectedUser.id) ||
        (msg.feladoID === selectedUser.id && msg.cimzettID === getCurrentUserId())
      )
    : [];

  return (
    <div className="beszelgetesek-container">
      <div className="user-list">
        <h1>Beszélgetések</h1>
        <input
          type="text"
          placeholder="Keresés üzenetek vagy felhasználók között..."
          style={{ width: "100%", padding: "8px", marginBottom: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
        />
        {users.length === 0 ? (
          <div style={{ textAlign: "center", color: "#666" }}>Még nem beszélgettél senkivel.</div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserClick(user)}
              className={`user-item ${selectedUser?.id === user.id ? "selected" : ""}`}
            >
              <img
                src={`http://localhost:5020/uploads/${user.profilePic}`}
                alt={user.name}
                style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "10px" }}
              />
              <div>
                <div style={{ fontWeight: "bold" }}>{user.name}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="chat-area">
        {selectedUser ? (
          <div>
            <div className="chat-header">
              <img
                src={`http://localhost:5020/uploads/${selectedUser.profilePic}`}
                alt={selectedUser.name}
                style={{ width: "50px", height: "50px", borderRadius: "50%", marginRight: "10px" }}
              />
              <h2>{selectedUser.name}</h2>
            </div>
            <div className="chat-messages">
              {loading ? (
                <div style={{ textAlign: "center", color: "#666" }}>Betöltés...</div>
              ) : (
                filteredMessages.map((msg) => (
                  <div
                    key={msg.beszelgetesID}
                    className={`message ${msg.feladoID === getCurrentUserId() ? "me" : "other"}`}
                  >
                    {msg.tartalom}
                    <div className="message-time">
                      {new Date(msg.kuldesIdopont).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {msg.cimzettID === getCurrentUserId() && !msg.olvasott && " (olvasatlan)"}
                    </div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={sendMessage} className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Írj üzenetet..."
                style={{ flex: 1, padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
              />
              <button type="submit" disabled={loading}>
                Küldés
              </button>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: "center", color: "#666" }}>Válassz egy felhasználót a csevegéshez!</div>
        )}
      </div>
    </div>
  );
};

export default Beszelgetesek;