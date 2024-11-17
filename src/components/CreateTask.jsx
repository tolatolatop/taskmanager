import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskContext } from '../App';
import { Form, Input, Card, Button } from 'antd';

const { TextArea } = Input;

function CreateTask() {
  const navigate = useNavigate();
  const { addTask } = useContext(TaskContext);
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    const newTask = {
      ...values,
      status: '待处理',
      progress: 0,
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    addTask(newTask);
    navigate('/');
  };

  return (
    <div className="create-task">
      <Card title="创建新任务" style={{ maxWidth: 600, margin: '0 auto' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input placeholder="请输入任务标题" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={4} placeholder="请输入任务描述" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              创建任务
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default CreateTask; 