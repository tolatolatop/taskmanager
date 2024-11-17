import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import { 
  UnorderedListOutlined, 
  PlusOutlined
} from '@ant-design/icons';

function Navbar() {
  const location = useLocation();
  
  const items = [
    {
      key: '/',
      icon: <UnorderedListOutlined />,
      label: <Link to="/">任务列表</Link>,
    },
    {
      key: '/create',
      icon: <PlusOutlined />,
      label: <Link to="/create">创建任务</Link>,
    }
  ];

  return (
    <div className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <h2>任务管理系统</h2>
        </Link>
        <Menu 
          mode="horizontal" 
          selectedKeys={[location.pathname]}
          items={items}
          style={{ minWidth: 400 }}
        />
      </div>
    </div>
  );
}

export default Navbar; 