import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { TaskContext } from '../App';
import { Input, Card, Tag, Space, Row, Col, Empty } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  SyncOutlined,
  SearchOutlined 
} from '@ant-design/icons';

const { Search } = Input;

function SearchTasks() {
  const { tasks } = useContext(TaskContext);
  const [searchResults, setSearchResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = (value) => {
    setSearched(true);
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    const results = tasks.filter(task => 
      task.title.toLowerCase().includes(value.toLowerCase()) ||
      task.description.toLowerCase().includes(value.toLowerCase())
    );
    setSearchResults(results);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case '待处理':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case '进行中':
        return <SyncOutlined spin style={{ color: '#1890ff' }} />;
      case '已完成':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'red';
      case 'normal': return 'blue';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  return (
    <div className="search-tasks">
      <Card title="搜索任务">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Search
            placeholder="输入任务标题或描述..."
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
          />
          
          {searched && (
            <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
              {searchResults.length > 0 ? (
                searchResults.map(task => (
                  <Col xs={24} sm={12} md={8} key={task.id}>
                    <Card 
                      title={task.title}
                      extra={<Link to={`/task/${task.id}`}>详情</Link>}
                      hoverable
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                          <Space>
                            {getStatusIcon(task.status)}
                            <span>{task.status}</span>
                          </Space>
                        </div>
                        <div>
                          <Tag color={getPriorityColor(task.priority)}>
                            {task.priority === 'high' ? '高优先级' : 
                             task.priority === 'normal' ? '中优先级' : '低优先级'}
                          </Tag>
                        </div>
                        <div>截止日期: {task.dueDate}</div>
                      </Space>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col span={24}>
                  <Empty description="未找到相关任务" />
                </Col>
              )}
            </Row>
          )}
        </Space>
      </Card>
    </div>
  );
}

export default SearchTasks; 