import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TaskContext } from '../App';
import { Card, Space, Row, Col, Spin, Input, Select } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  SyncOutlined, 
  CloseCircleOutlined,
  SearchOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Search } = Input;

function TaskList() {
  const { tasks, loading, fetchTasks } = useContext(TaskContext);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    console.log('TaskList: 开始获取任务列表');
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchText, statusFilter]);

  const filterTasks = () => {
    let result = [...tasks];
    
    // 文本搜索过滤
    if (searchText) {
      result = result.filter(task => 
        task.title.toLowerCase().includes(searchText.toLowerCase()) ||
        task.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // 状态过滤
    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter);
    }
    
    setFilteredTasks(result);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case '待处理':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case '进行中':
        return <SyncOutlined spin style={{ color: '#1890ff' }} />;
      case '已完成':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case '失败':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return null;
    }
  };

  const formatDateTime = (dateTimeStr) => {
    return dayjs(dateTimeStr).format('YYYY-MM-DD HH:mm:ss');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div className="task-list">
      <Card title="任务列表">
        <Space direction="vertical" style={{ width: '100%', marginBottom: 20 }}>
          <Row gutter={16}>
            <Col flex="auto">
              <Search
                placeholder="搜索任务标题或描述..."
                allowClear
                enterButton={<SearchOutlined />}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col>
              <Select
                defaultValue="all"
                style={{ width: 120 }}
                onChange={setStatusFilter}
                options={[
                  { value: 'all', label: '全部状态' },
                  { value: '待处理', label: '待处理' },
                  { value: '进行中', label: '进行中' },
                  { value: '已完成', label: '已完成' },
                  { value: '失败', label: '失败' }
                ]}
              />
            </Col>
          </Row>
        </Space>

        <Row gutter={[16, 16]}>
          {filteredTasks.map(task => (
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
                  <div>创建时间: {formatDateTime(task.createdAt)}</div>
                  {task.completedAt && (
                    <div>完成时间: {formatDateTime(task.completedAt)}</div>
                  )}
                  <div>{task.description}</div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
}

export default TaskList; 