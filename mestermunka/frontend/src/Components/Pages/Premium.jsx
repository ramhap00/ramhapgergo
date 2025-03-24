import React from "react";
import "../Stilusok/Premium.css"; 

const Premium = () => {
  return (
    <div className="account-settings">
    <div className="premium-container">
      <h1>S.O.S.Premium </h1>
      <p>Itt látható az S.O.S. Premium csomagunk előnyei</p>
      <div className="plans-wrapper">
        
          <div className="plan-card">
            <h2>Ingyenes</h2>
            <h3>0 Ft <span>havonta</span></h3>
            
            <ul>
              <li>1db poszt</li>
              <li>elsőbség a posztoknál❌</li>
              <li>Funkció 3</li>
              <li>Funkció 4</li>
            </ul>
            <button className="plan-button">Fejlesztés alatt...</button>
          </div>

        
          <div className="plan-card highlighted">
            <h2>S.O.S. Premium</h2>
            <h3>4000 Ft <span>havonta</span></h3>
            <ul>
              <li>Korlátlan posztok</li>
              <li>elsőbség a posztoknál✅</li>
              <li>Funkció 3</li>
              <li>Funkció 4</li>
            </ul>
            <button className="plan-button">Fejlesztés alatt...</button>
          </div>

        
      </div>
    </div>
    </div>
  );
};

export default Premium;