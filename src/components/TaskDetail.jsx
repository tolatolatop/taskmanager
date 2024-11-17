import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TaskContext } from '../App';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Button, 
  Space, 
  Descriptions, 
  Tag,
  Modal,
  message 
} from 'antd';
import { 
  EditOutlined, 
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
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const foundTask = tasks.find(t => t.id === parseInt(id));
    if (foundTask) {
      setTask(foundTask);
      form.setFieldsValue({
        ...foundTask,
        dueDate: dayjs(foundTask.dueDate)
      });
    }
  }, [id, tasks, form]);

  if (!task) {
    return <div>任务未找到</div>;
  }

  const handleSave = async (values) => {
    const updatedTask = {
      ...task,
      ...values,
      dueDate: values.dueDate.format('YYYY-MM-DD')
    };
    updateTask(updatedTask);
    setTask(updatedTask);
    setIsEditing(false);
    message.success('任务更新成功');
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

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'red';
      case 'normal': return 'blue';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getPriorityText = (priority) => {
    switch(priority) {
      case 'high': return '高优先级';
      case 'normal': return '中优先级';
      case 'low': return '低优先级';
      default: return '未设置';
    }
  };

  return (
    <div className="task-detail">
      <Card
        title={isEditing ? "编辑任务" : "任务详情"}
        extra={
          !isEditing && (
            <Space>
              <Button 
                icon={<EditOutlined />} 
                onClick={() => setIsEditing(true)}
              >
                编辑
              </Button>
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                onClick={showDeleteConfirm}
              >
                删除
              </Button>
            </Space>
          )
        }
      >
        {isEditing ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
          >
            <Form.Item
              name="title"
              label="标题"
              rules={[{ required: true, message: '请输入任务标题' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="description"
              label="描述"
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="status"
              label="状态"
            >
              <Select>
                <Select.Option value="待处理">待处理</Select.Option>
                <Select.Option value="进行中">进行中</Select.Option>
                <Select.Option value="已完成">已完成</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="priority"
              label="优先级"
            >
              <Select>
                <Select.Option value="low">低优先级</Select.Option>
                <Select.Option value="normal">中优先级</Select.Option>
                <Select.Option value="high">高优先级</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="dueDate"
              label="截止日期"
              rules={[{ required: true, message: '请选择截止日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  保存
                </Button>
                <Button onClick={() => setIsEditing(false)}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        ) : (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="标题">{task.title}</Descriptions.Item>
            <Descriptions.Item label="描述">{task.description}</Descriptions.Item>
            <Descriptions.Item label="状态">{task.status}</Descriptions.Item>
            <Descriptions.Item label="优先级">
              <Tag color={getPriorityColor(task.priority)}>
                {getPriorityText(task.priority)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="截止日期">{task.dueDate}</Descriptions.Item>
          </Descriptions>
        )}
      </Card>
    </div>
  );
}

export default TaskDetail; 