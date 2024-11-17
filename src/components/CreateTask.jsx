import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskContext } from '../App';
import { Form, Input, Card, Button, Select, Space, Alert, message } from 'antd';
import { TaskAPI, TaskModel } from '../services/taskService';

const { TextArea } = Input;
const { Option } = Select;

function CreateTask() {
  const navigate = useNavigate();
  const { addTask } = useContext(TaskContext);
  const [form] = Form.useForm();
  const [instances, setInstances] = useState([]);
  const [taskType, setTaskType] = useState(TaskModel.TYPE.NORMAL);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const data = await TaskAPI.getInstances();
        setInstances(data);
      } catch (error) {
        console.error('获取实例列表失败:', error);
      }
    };
    fetchInstances();
  }, []);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const newTask = {
        ...values,
        type: taskType,
        status: TaskModel.STATUS.PENDING,
        progress: 0,
        createdAt: new Date().toISOString(),
        completedAt: null,
        instances: taskType === TaskModel.TYPE.DEPLOY ? values.instances : []
      };

      await addTask(newTask);
      message.success('任务创建成功');
      navigate('/');
    } catch (error) {
      message.error('创建任务失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (value) => {
    setTaskType(value);
    // 当类型改变时，清除实例选择
    if (value !== TaskModel.TYPE.DEPLOY) {
      form.setFieldValue('instances', undefined);
    }
  };

  return (
    <div className="create-task">
      <Card title="创建新任务" style={{ maxWidth: 800, margin: '0 auto' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            type: TaskModel.TYPE.NORMAL
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
            name="type"
            label="任务类型"
            rules={[{ required: true, message: '请选择任务类型' }]}
          >
            <Select onChange={handleTypeChange}>
              <Option value={TaskModel.TYPE.NORMAL}>普通任务</Option>
              <Option value={TaskModel.TYPE.DEPLOY}>部署任务</Option>
            </Select>
          </Form.Item>

          {taskType === TaskModel.TYPE.DEPLOY && (
            <Form.Item
              name="instances"
              label="部署实例"
              rules={[{ 
                required: true, 
                message: '请选择至少一个部署实例',
                type: 'array',
                min: 1
              }]}
              extra="可以选择多个实例进行部署"
            >
              <Select
                mode="multiple"
                placeholder="请选择部署实例"
                style={{ width: '100%' }}
                optionFilterProp="children"
                showSearch
              >
                {instances.map(instance => (
                  <Option 
                    key={instance.id} 
                    value={instance.id}
                  >
                    {instance.name} ({instance.ip})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入任务描述' }]}
          >
            <TextArea 
              rows={4} 
              placeholder={
                taskType === TaskModel.TYPE.DEPLOY 
                  ? "请描述此次部署的内容，例如：版本号、主要更新内容等" 
                  : "请输入任务描述"
              }
            />
          </Form.Item>

          {taskType === TaskModel.TYPE.DEPLOY && (
            <Alert
              message="部署任务说明"
              description="部署任务将在选定的实例上执行部署操作，请确保已经完成相关准备工作。部署过程中可以在任务详情页查看每个实例的部署进度。"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block
              loading={loading}
            >
              创建任务
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default CreateTask; 