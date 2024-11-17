import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskContext } from '../App';
import { Form, Input, Select, DatePicker, Button, Card } from 'antd';
import dayjs from 'dayjs';

const { TextArea } = Input;

function CreateTask() {
  const navigate = useNavigate();
  const { addTask } = useContext(TaskContext);
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    const newTask = {
      ...values,
      dueDate: values.dueDate.format('YYYY-MM-DD'),
      status: '待处理'
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
          initialValues={{
            priority: 'normal',
            dueDate: dayjs()
          }}
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