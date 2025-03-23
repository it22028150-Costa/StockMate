import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <BrowserRouter> {/* Only here */}
      <Header />
      <Routes>
        <Route path="/" element={<MainLayout />} />
        {/* Add other routes as necessary */}
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
