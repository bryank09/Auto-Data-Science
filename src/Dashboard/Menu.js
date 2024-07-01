import { Card, Space, Statistic, Table, Typography, Image } from "antd";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useEffect, useState } from "react";
import { getCustomers, getInventory, getOrders, getRevenue } from "../API";
import { useNavigate } from 'react-router-dom';
import CSVReader from '../assets/CSVReader.js';

function Menu() {
  const [orders, setOrders] = useState(0);
  const [inventory, setInventory] = useState(0);
  const [customers, setCustomers] = useState(0);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    getOrders().then((res) => {
      setOrders(res.total);
      setRevenue(res.discountedTotal);
    });
    getInventory().then((res) => {
      setInventory(res.total);
    });
    getCustomers().then((res) => {
      setCustomers(res.total);
    });
  }, []);

  const navigate = useNavigate();

  const goToHome = () => {
    navigate('/pricing');
  };

  return (
    <Container id="menu" class="d-flex flex-column gap-3">
      <Button onClick={goToHome}>Back</Button>{' '}
      <Typography.Title level={1}>Dashboard</Typography.Title>
      <CSVReader />
    </Container>
  );
}

export default Menu;