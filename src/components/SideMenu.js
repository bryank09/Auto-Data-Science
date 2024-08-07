import {
  AppstoreOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { FiLogOut } from "react-icons/fi";
import { Menu } from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function SideMenu() {
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState("/");
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const pathName = location.pathname;
    setSelectedKeys(pathName);
  }, [location.pathname]);

  useEffect(()=>{
    fetch('http://localhost:5000/get_user_models', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(response => response.json())
      .then(data => {
        const template = [{
          label: "New Model",
          icon: <AppstoreOutlined />,
          key: "",
        },
        {
          label: "LogOut",
          icon: <FiLogOut />,
          key: "/orders",
        }]
        const newItems = data.map((item) => (
          console.log(item),
          {
          label: item[1],
          icon: <AppstoreOutlined />,
          key: item[0],
        }));

        setMenuItems([...newItems, ...template]);
      })
      .catch(error => console.error('Error:', error));
  }, []);

  const navigate = useNavigate();
  return (
    <div className="SideMenu">
      <Menu
        className="SideMenuVertical"
        mode="vertical"
        onClick={(item) => {
          navigate(`/dashboard?key=${item.key}`);
        }}
        selectedKeys={[selectedKeys]}
        items={menuItems}
      ></Menu>
    </div>
  );
}
export default SideMenu;
