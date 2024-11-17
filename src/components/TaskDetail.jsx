import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TaskContext } from '../App';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Space, 
  Descriptions, 
  Modal,
  message 
} from 'antd';
import { 
  DeleteOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { confirm } = Modal;

function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, updateTask, deleteTask } = useContext(TaskContext);
  const [task, setTask] = useState(null);

  useEffect(() => {
    const foundTask = tasks.find(t => t.id === parseInt(id));
    if (foundTask) {
      setTask(foundTask);
    }
  }, [id, tasks]);

  if (!task) {
    return <div>任务未找到</div>;
  }

  const handleStatusChange = async (newStatus) => {
    const updatedTask = {
      ...task,
      status: newStatus,
      completedAt: newStatus === '已完成' ? new Date().toISOString() : null
    };
    await updateTask(updatedTask.id, updatedTask);
    setTask(updatedTask);
    message.success('任务状态更新成功');
  };

  const showDeleteConfirm = () => {
    confirm({
      title: '确定要删除这个任务吗？',
      icon: <ExclamationCircleOutlined />,
      content: '删除后无法恢复',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        deleteTask(task.id);
        message.success('任务已删除');
        navigate('/');
      }
    });
  };

  const formatDateTime = (dateTimeStr) => {
    return dayjs(dateTimeStr).format('YYYY-MM-DD HH:mm:ss');
  };

  return (
    <div className="task-detail">
      <Card
        title="任务详情"
        extra={
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={showDeleteConfirm}
          >
            删除
          </Button>
        }
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="标题">{task.title}</Descriptions.Item>
          <Descriptions.Item label="描述">{task.description}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Select
              value={task.status}
              onChange={handleStatusChange}
              style={{ width: 200 }}
            >
              <Select.Option value="待处理">待处理</Select.Option>
              <Select.Option value="进行中">进行中</Select.Option>
              <Select.Option value="已完成">已完成</Select.Option>
              <Select.Option value="失败">失败</Select.Option>
            </Select>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {formatDateTime(task.createdAt)}
          </Descriptions.Item>
          {task.completedAt && (
            <Descriptions.Item label="完成时间">
              {formatDateTime(task.completedAt)}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </div>
  );
}

export default TaskDetail; 