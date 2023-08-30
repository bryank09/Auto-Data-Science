import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NavBar } from './components/NavBar.js';
import { Banner } from './components/Banner.js';
import { Content } from './components/Dashboard.js';
import { Routes, Route, useNavigate } from 'react-router-dom';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
  );
}
export default App;

function Home(){
  return(
    <div id="home">
      <NavBar />
      <Banner />
    </div>
  )
}

function Dashboard() {
  return (
    <div id="dashboard">
      <Content />
    </div>
  );
}