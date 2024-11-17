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
  const [selectedSpec, setSelectedSpec] = useState('all');
  const [selectedCpuType, setSelectedCpuType] = useState('all');
  const [selectedInstances, setSelectedInstances] = useState([]);

  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const data = await TaskAPI.getInstances();
        console.log('获取到的实例列表:', data);
        setInstances(data);
      } catch (error) {
        console.error('获取实例列表失败:', error);
      }
    };
    fetchInstances();
  }, []);

  // 获取所有可用的选项
  const regions = ['all', ...new Set(instances.map(instance => instance.region))];
  const specifications = ['all', ...new Set(instances.map(instance => instance.specification))];
  const cpuTypes = ['all', ...new Set(instances.map(instance => instance.cpuType))];

  // 计算每个分组的选择状态
  const getGroupCheckStatus = (type, value) => {
    if (value === 'all') return;
    const groupInstances = instances.filter(instance => 
      instance[type] === value && 
      instance.status !== INSTANCE_STATUS.STOPPED
    );
    const selectedCount = groupInstances.filter(instance => 
      selectedInstances.includes(instance.id)
    ).length;

    if (selectedCount === 0) return 'none';
    if (selectedCount === groupInstances.length) return 'all';
    return 'partial';
  };

  // 处理单个实例选择
  const handleInstanceSelect = (instanceId) => {
    console.log('单个实例选择/取消:', instanceId);
    const instance = instances.find(i => i.id === instanceId);
    if (instance && instance.status !== INSTANCE_STATUS.STOPPED) {
      setSelectedInstances(prev => {
        const newSelection = prev.includes(instanceId)
          ? prev.filter(id => id !== instanceId)
          : [...prev, instanceId];
        console.log('更新后的选中实例:', newSelection);
        form.setFieldValue('instances', newSelection);
        return newSelection;
      });
    }
  };

  // 过滤实例
  const filteredInstances = instances.filter(instance => 
    (selectedRegion === 'all' || instance.region === selectedRegion) &&
    (selectedSpec === 'all' || instance.specification === selectedSpec) &&
    (selectedCpuType === 'all' || instance.cpuType === selectedCpuType)
  );

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
      const selectedInstancesData = instances.filter(instance => 
        values.instances?.includes(instance.id)
      );
      
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

  // 处理分组选择
  const handleGroupSelect = (type, value, checked) => {
    console.log(`分组选择 - 类型: ${type}, 值: ${value}, 选中: ${checked}`);
    const groupInstances = instances.filter(instance => 
      instance[type] === value && 
      instance.status !== INSTANCE_STATUS.STOPPED
    );
    const groupInstanceIds = groupInstances.map(instance => instance.id);
    
    console.log('该分组可用实例:', groupInstances);
    console.log('该分组实例IDs:', groupInstanceIds);

    setSelectedInstances(prev => {
      let newSelection;
      if (checked) {
        newSelection = [...new Set([...prev, ...groupInstanceIds])];
      } else {
        newSelection = prev.filter(id => !groupInstanceIds.includes(id));
      }
      console.log('更新后的选中实例:', newSelection);
      form.setFieldValue('instances', newSelection);
      return newSelection;
    });
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
                <div className="instance-selector">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Card size="small" className="filters-card">
                      <Row gutter={[16, 16]}>
                        <Col span={8}>
                          <div className="filter-group">
                            <div className="filter-title">地区</div>
                            {regions.filter(r => r !== 'all').map(region => (
                              <div key={region} className="filter-item">
                                <Checkbox
                                  indeterminate={getGroupCheckStatus('region', region) === 'partial'}
                                  checked={getGroupCheckStatus('region', region) === 'all'}
                                  onChange={(e) => handleGroupSelect('region', region, e.target.checked)}
                                >
                                  {region}
                                  <span className="instance-count">
                                    ({selectedInstances.filter(id => 
                                      instances.find(i => i.id === id)?.region === region
                                    ).length} / {instances.filter(i => 
                                      i.region === region && i.status !== INSTANCE_STATUS.STOPPED
                                    ).length})
                                  </span>
                                </Checkbox>
                              </div>
                            ))}
                          </div>
                        </Col>
                        <Col span={8}>
                          <div className="filter-group">
                            <div className="filter-title">规格</div>
                            {specifications.filter(s => s !== 'all').map(spec => (
                              <div key={spec} className="filter-item">
                                <Checkbox
                                  indeterminate={getGroupCheckStatus('specification', spec) === 'partial'}
                                  checked={getGroupCheckStatus('specification', spec) === 'all'}
                                  onChange={(e) => handleGroupSelect('specification', spec, e.target.checked)}
                                >
                                  {spec}
                                  <span className="instance-count">
                                    ({selectedInstances.filter(id => 
                                      instances.find(i => i.id === id)?.specification === spec
                                    ).length} / {instances.filter(i => 
                                      i.specification === spec && i.status !== INSTANCE_STATUS.STOPPED
                                    ).length})
                                  </span>
                                </Checkbox>
                              </div>
                            ))}
                          </div>
                        </Col>
                        <Col span={8}>
                          <div className="filter-group">
                            <div className="filter-title">CPU类型</div>
                            {cpuTypes.filter(c => c !== 'all').map(cpu => (
                              <div key={cpu} className="filter-item">
                                <Checkbox
                                  indeterminate={getGroupCheckStatus('cpuType', cpu) === 'partial'}
                                  checked={getGroupCheckStatus('cpuType', cpu) === 'all'}
                                  onChange={(e) => handleGroupSelect('cpuType', cpu, e.target.checked)}
                                >
                                  {cpu}
                                  <span className="instance-count">
                                    ({selectedInstances.filter(id => 
                                      instances.find(i => i.id === id)?.cpuType === cpu
                                    ).length} / {instances.filter(i => 
                                      i.cpuType === cpu && i.status !== INSTANCE_STATUS.STOPPED
                                    ).length})
                                  </span>
                                </Checkbox>
                              </div>
                            ))}
                          </div>
                        </Col>
                      </Row>
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
                            onClick={() => !instance.status === INSTANCE_STATUS.STOPPED && 
                              handleInstanceSelect(instance.id)}
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