import { BrowserRouter, Route, Routes } from "react-router-dom";
import Customers from "../Dashboard/Customers";
import Dashboard from "../Dashboard/Menu";
import Inventory from "../Dashboard/Inventory";
import Orders from "../Dashboard/Orders";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />}></Route>
      <Route path="/dashboard/inventory" element={<Inventory />}></Route>
      <Route path="/orders" element={<Orders />}></Route>
      <Route path="/customers" element={<Customers />}></Route>
    </Routes>
  );
}
export default AppRoutes;
