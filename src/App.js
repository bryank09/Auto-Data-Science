import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NavBar } from './components/NavBar.js';
import { Banner } from './components/Home.js';
import Pricing from './components/Pricing.js';
import AppFooter from "./components/AppFooter";
import AppHeader from "./components/AppHeader";
import PageContent from "./components/PageContent";
import SideMenu from "./components/SideMenu";
import AppRoutes from "./components/AppRoutes";
import { Routes, Route, Outlet } from 'react-router-dom';
import Customers from "./Dashboard/Customers.js";
import Menu from "./Dashboard/Menu";
import Inventory from "./Dashboard/Inventory";
import Orders from "./Dashboard/Orders.js";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />}>
        <Route path="" element={<Banner />}/>
        <Route path="pricing" element={<Pricing />}/>
      </Route>
      <Route path="/dashboard" element={<Dashboard />}>
        <Route path="" element={<Menu />}></Route>
        <Route path="inventory" element={<Inventory />}></Route>
        <Route path="orders" element={<Orders />}></Route>
        <Route path="customers" element={<Customers />}></Route>
      </Route>
    </Routes>
  );
}
export default App;

function Home() {
  return (
    <div id="home">
      <NavBar />
      <Outlet />
    </div>
  )
}

function Dashboard() {
  return (
    <div className="dashboard">
      <AppHeader />
      <div className="SideMenuAndPageContent">
        <SideMenu></SideMenu>
        <div className="PageContent">
          <Outlet />
        </div>
      </div>
      <AppFooter />
    </div>
  );
}