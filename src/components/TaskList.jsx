import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TaskContext } from '../App';
import { Card, Space, Row, Col, Spin, Input, Select, Progress, Empty, Badge, Tag } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  SyncOutlined, 
  CloseCircleOutlined,
  SearchOutlined,
  OrderedListOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Search } = Input;

function TaskList() {
  const { tasks, loading, fetchTasks } = useContext(TaskContext);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');

  useEffect(() => {
    console.log('TaskList: 开始获取任务列表');
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    filterAndSortTasks();
  }, [tasks, searchText, statusFilter, sortBy]);

  const filterAndSortTasks = () => {
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
    
    // 排序
    result.sort((a, b) => {
      switch (sortBy) {
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'progress':
          return b.progress - a.progress;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
    
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

  const getProgressStatus = (status) => {
    switch(status) {
      case '已完成':
        return 'success';
      case '失败':
        return 'exception';
      case '进行中':
        return 'active';
      default:
        return 'normal';
    }
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
      <Card title={
        <Space>
          <OrderedListOutlined />
          任务列表
          <Badge 
            count={filteredTasks.length} 
            style={{ backgroundColor: '#52c41a' }} 
          />
        </Space>
      }>
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
            <Col>
              <Select
                defaultValue="createdAt"
                style={{ width: 120 }}
                onChange={setSortBy}
                options={[
                  { value: 'createdAt', label: '创建时间' },
                  { value: 'progress', label: '完成进度' },
                  { value: 'status', label: '任务状态' }
                ]}
              />
            </Col>
          </Row>
        </Space>

        {filteredTasks.length === 0 ? (
          <Empty description="暂无任务" />
        ) : (
          <Row gutter={[16, 16]}>
            {filteredTasks.map(task => (
              <Col xs={24} sm={12} md={8} key={task.id}>
                <Card 
                  title={
                    <Space>
                      <Tag color={
                        task.status === '已完成' ? 'success' :
                        task.status === '进行中' ? 'processing' :
                        task.status === '失败' ? 'error' :
                        'warning'
                      }>
                        {getStatusIcon(task.status)}
                        {task.status}
                      </Tag>
                      {task.title}
                    </Space>
                  }
                  extra={<Link to={`/task/${task.id}`}>详情</Link>}
                  hoverable
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Progress 
                      percent={task.progress} 
                      status={getProgressStatus(task.status)}
                      size="small"
                    />
                    <div>创建时间: {formatDateTime(task.createdAt)}</div>
                    {task.completedAt && (
                      <div>完成时间: {formatDateTime(task.completedAt)}</div>
                    )}
                    <div className="task-description">{task.description}</div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>
    </div>
  );
}

export default TaskList; 