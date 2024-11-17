import { Link, useLocation } from 'react-router-dom';
import { Menu, Layout } from 'antd';
import { 
  UnorderedListOutlined, 
  PlusOutlined
} from '@ant-design/icons';

const { Header } = Layout;

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
    <Header className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <h2>任务管理系统</h2>
        </Link>
        <Menu 
          mode="horizontal" 
          selectedKeys={[location.pathname]}
          items={items}
          style={{ minWidth: 400, border: 'none' }}
        />
      </div>
    </Header>
  );
}

export default Navbar; 