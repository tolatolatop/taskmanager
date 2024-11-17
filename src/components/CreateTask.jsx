import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskContext } from '../App';
import { Form, Input, Card, Button, Select, Alert, message } from 'antd';
import { TaskAPI, TaskModel } from '../services/taskService';
import InstanceSelector from './InstanceSelector';

const { TextArea } = Input;
const { Option } = Select;

function CreateTask() {
  const navigate = useNavigate();
  const { addTask } = useContext(TaskContext);
  const [form] = Form.useForm();
  const [taskType, setTaskType] = useState(TaskModel.TYPE.NORMAL);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const selectedInstancesData = await TaskAPI.getInstances()
        .then(instances => instances.filter(instance => 
          values.instances?.includes(instance.id)
        ));
      
      const newTask = {
        ...values,
        type: taskType,
        status: TaskModel.STATUS.PENDING,
        progress: 0,
        createdAt: new Date().toISOString(),
        completedAt: null,
        instances: taskType === TaskModel.TYPE.DEPLOY ? selectedInstancesData : []
      };

      console.group('创建任务数据');
      console.log('表单数据:', values);
      console.log('任务类型:', taskType);
      console.log('选中的实例IDs:', values.instances);
      console.log('选中的实例详细信息:', selectedInstancesData);
      console.log('完整的任务数据:', newTask);
      console.groupEnd();

      await addTask(newTask);
      message.success('任务创建成功');
      navigate('/');
    } catch (error) {
      console.error('创建任务失败:', error);
      message.error('创建任务失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (value) => {
    console.log('任务类型变更:', value);
    setTaskType(value);
    if (value !== TaskModel.TYPE.DEPLOY) {
      console.log('清除实例选择');
      form.setFieldValue('instances', undefined);
    }
  };

  return (
    <div className="create-task">
      <Card title="创建新任务" style={{ maxWidth: 1200, margin: '0 auto' }}>
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
            <>
              <Form.Item
                name="instances"
                label="部署实例"
                rules={[{ required: true, message: '请选择至少一个部署实例', type: 'array', min: 1 }]}
              >
                <InstanceSelector />
              </Form.Item>

              <Alert
                message="部署任务说明"
                description={
                  <ul>
                    <li>已停止的实例无法选择</li>
                    <li>维护中的实例可以选择，但可能会影响部署效果</li>
                    <li>鼠标悬停在实例上可查看详细信息</li>
                  </ul>
                }
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />
            </>
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