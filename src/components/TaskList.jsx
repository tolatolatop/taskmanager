import { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TaskContext } from '../App';
import { Card, Tag, Space, Row, Col, Spin } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  SyncOutlined 
} from '@ant-design/icons';

function TaskList() {
  const { tasks, loading, fetchTasks } = useContext(TaskContext);

  useEffect(() => {
    console.log('TaskList: 开始获取任务列表');
    fetchTasks();
  }, [fetchTasks]);

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
      case 'high':
        return 'red';
      case 'normal':
        return 'blue';
      case 'low':
        return 'green';
      default:
        return 'default';
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
      <h2>任务列表</h2>
      <Row gutter={[16, 16]}>
        {tasks.map(task => (
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
        ))}
      </Row>
    </div>
  );
}

export default TaskList; 