import { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TaskContext } from '../App';
import { Card, Space, Row, Col, Spin, Tag } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  SyncOutlined, 
  CloseCircleOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

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
    </div>
  );
}

export default TaskList; 