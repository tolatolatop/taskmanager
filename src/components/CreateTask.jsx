import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskContext } from '../App';
import { 
  Form, 
  Input, 
  Card, 
  Button, 
  Select, 
  Space, 
  Alert, 
  message,
  Checkbox,
  Row,
  Col,
  Tag,
  Divider,
  Radio
} from 'antd';
import { TaskAPI, TaskModel } from '../services/taskService';
import { INSTANCE_STATUS } from '../services/mockService';

const { TextArea } = Input;
const { Option } = Select;

function CreateTask() {
  const navigate = useNavigate();
  const { addTask } = useContext(TaskContext);
  const [form] = Form.useForm();
  const [instances, setInstances] = useState([]);
  const [taskType, setTaskType] = useState(TaskModel.TYPE.NORMAL);
  const [loading, setLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedInstances, setSelectedInstances] = useState([]);

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

  // 获取所有可用的地区
  const regions = ['all', ...new Set(instances.map(instance => instance.region))];

  // 根据地区过滤实例
  const filteredInstances = instances.filter(instance => 
    selectedRegion === 'all' || instance.region === selectedRegion
  );

  // 处理实例选择
  const handleInstanceSelect = (instanceId) => {
    const instance = instances.find(i => i.id === instanceId);
    if (instance && instance.status !== INSTANCE_STATUS.STOPPED) {
      setSelectedInstances(prev => {
        const newSelection = prev.includes(instanceId)
          ? prev.filter(id => id !== instanceId)
          : [...prev, instanceId];
        form.setFieldValue('instances', newSelection);
        return newSelection;
      });
    }
  };

  // 批量选择处理
  const handleBatchSelect = (region) => {
    const availableInstances = instances.filter(instance => 
      (region === 'all' || instance.region === region) &&
      instance.status !== INSTANCE_STATUS.STOPPED
    );
    const instanceIds = availableInstances.map(instance => instance.id);
    setSelectedInstances(instanceIds);
    form.setFieldValue('instances', instanceIds);
  };

  // 获取实例状态的标签颜色
  const getStatusColor = (status) => {
    switch(status) {
      case INSTANCE_STATUS.RUNNING:
        return 'success';
      case INSTANCE_STATUS.MAINTENANCE:
        return 'warning';
      case INSTANCE_STATUS.STOPPED:
        return 'error';
      default:
        return 'default';
    }
  };

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
                rules={[{ 
                  required: true, 
                  message: '请选择至少一个部署实例',
                  type: 'array',
                  min: 1
                }]}
              >
                <div className="instance-selector">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Card size="small">
                      <Space>
                        <span>地区筛选：</span>
                        <Radio.Group 
                          value={selectedRegion}
                          onChange={e => setSelectedRegion(e.target.value)}
                        >
                          {regions.map(region => (
                            <Radio.Button key={region} value={region}>
                              {region === 'all' ? '全部地区' : region}
                            </Radio.Button>
                          ))}
                        </Radio.Group>
                        <Button 
                          type="link" 
                          onClick={() => handleBatchSelect(selectedRegion)}
                        >
                          全选当前地区可用实例
                        </Button>
                      </Space>
                    </Card>
                    
                    <div className="instances-list">
                      {filteredInstances.map(instance => (
                        <Card
                          key={instance.id}
                          size="small"
                          className={`instance-card ${
                            instance.status === INSTANCE_STATUS.STOPPED ? 'disabled' : ''
                          }`}
                          style={{ marginBottom: 8 }}
                        >
                          <Checkbox
                            checked={selectedInstances.includes(instance.id)}
                            onChange={() => handleInstanceSelect(instance.id)}
                            disabled={instance.status === INSTANCE_STATUS.STOPPED}
                          >
                            <Space>
                              <span className="instance-name">{instance.name}</span>
                              <Tag color={getStatusColor(instance.status)}>
                                {instance.status}
                              </Tag>
                              <span className="instance-spec">
                                {instance.specification}
                              </span>
                            </Space>
                          </Checkbox>
                          <div 
                            className="instance-hover-info"
                            onClick={() => handleInstanceSelect(instance.id)}
                          >
                            IP: {instance.ip}<br/>
                            CPU: {instance.cpuType}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </Space>
                </div>
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