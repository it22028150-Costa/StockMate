// src/Header.js
import React from 'react';


const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <h1>Stock Mate</h1>
      </div>
      <nav>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Services</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
