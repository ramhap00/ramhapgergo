import React from 'react';
import "../Stilusok/Footer.css";


import InstagramIcon from '../../assets/instagram-icon.png';
import FacebookIcon from '../../assets/facebook.png';
import XIcon from '../../assets/X.png';

const Footer = () => {
  return (
    <footer className="footer-wrapper">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-text">
            <p>© 2025 Minden jog fenntartva - S.O.S. Munka</p>
          </div>
          <div className="footer-social">
            <a href="https://www.instagram.com/sosmunka/" target="_blank" rel="noopener noreferrer">
              <img src={InstagramIcon} alt="Instagram" className="social-icon" />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61574755776601" target="_blank" rel="noopener noreferrer">
              <img src={FacebookIcon} alt="Facebook" className="social-icon" />
            </a>
            <a href="https://x.com/SoSMunka" target="_blank" rel="noopener noreferrer">
              <img src={XIcon} alt="X" className="social-icon" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;