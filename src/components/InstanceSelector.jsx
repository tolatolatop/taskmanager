import { useEffect, useState } from 'react';
import { Card, Space, Checkbox, Row, Col, Tag } from 'antd';
import { TaskAPI } from '../services/taskService';
import { INSTANCE_STATUS } from '../services/mockService';

const DEFAULT_FILTERS = [
  { id: 'region', label: '地区' },
  { id: 'specification', label: '规格' },
  { id: 'cpuType', label: 'CPU类型' }
];

function InstanceSelector({ 
  value, 
  onChange, 
  fieldNames = { id: 'id', label: 'name' },
  filterItems = DEFAULT_FILTERS
}) {
  const [instances, setInstances] = useState([]);
  const [selectedInstances, setSelectedInstances] = useState(value || []);

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

  useEffect(() => {
    setSelectedInstances(value || []);
  }, [value]);

  // 获取过滤项的所有可用选项
  const getFilterOptions = (filterId) => {
    return [...new Set(instances.map(instance => instance[filterId]))];
  };

  // 计算每个分组的选择状态
  const getGroupCheckStatus = (type, value) => {
    const groupInstances = instances.filter(instance => 
      instance[type] === value && 
      instance.status !== INSTANCE_STATUS.STOPPED
    );
    const selectedCount = groupInstances.filter(instance => 
      selectedInstances.includes(instance[fieldNames.id])
    ).length;

    if (selectedCount === 0) return 'none';
    if (selectedCount === groupInstances.length) return 'all';
    return 'partial';
  };

  // 处理分组选择
  const handleGroupSelect = (type, value, checked) => {
    console.log(`分组选择 - 类型: ${type}, 值: ${value}, 选中: ${checked}`);
    const groupInstances = instances.filter(instance => 
      instance[type] === value && 
      instance.status !== INSTANCE_STATUS.STOPPED
    );
    const groupInstanceIds = groupInstances.map(instance => instance[fieldNames.id]);
    
    console.log('该分组可用实例:', groupInstances);
    console.log('该分组实例IDs:', groupInstanceIds);

    const newSelection = checked
      ? [...new Set([...selectedInstances, ...groupInstanceIds])]
      : selectedInstances.filter(id => !groupInstanceIds.includes(id));

    setSelectedInstances(newSelection);
    onChange?.(newSelection);
  };

  // 处理单个实例选择
  const handleInstanceSelect = (instanceId) => {
    console.log('单个实例选择/取消:', instanceId);
    const instance = instances.find(i => i[fieldNames.id] === instanceId);
    if (instance && instance.status !== INSTANCE_STATUS.STOPPED) {
      const newSelection = selectedInstances.includes(instanceId)
        ? selectedInstances.filter(id => id !== instanceId)
        : [...selectedInstances, instanceId];

      console.log('更新后的选中实例:', newSelection);
      setSelectedInstances(newSelection);
      onChange?.(newSelection);
    }
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

  // 渲染过滤器组
  const renderFilterGroup = (filter) => (
    <Col span={24 / filterItems.length} key={filter.id}>
      <div className="filter-group">
        <div className="filter-title">{filter.label}</div>
        {getFilterOptions(filter.id).map(value => (
          <div key={value} className="filter-item">
            <Checkbox
              indeterminate={getGroupCheckStatus(filter.id, value) === 'partial'}
              checked={getGroupCheckStatus(filter.id, value) === 'all'}
              onChange={(e) => handleGroupSelect(filter.id, value, e.target.checked)}
            >
              {value}
              <span className="instance-count">
                ({selectedInstances.filter(id => 
                  instances.find(i => i[fieldNames.id] === id)?.[filter.id] === value
                ).length} / {instances.filter(i => 
                  i[filter.id] === value && i.status !== INSTANCE_STATUS.STOPPED
                ).length})
              </span>
            </Checkbox>
          </div>
        ))}
      </div>
    </Col>
  );

  return (
    <div className="instance-selector">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Card size="small" className="filters-card">
          <Row gutter={[16, 16]}>
            {filterItems.map(renderFilterGroup)}
          </Row>
        </Card>

        <div className="instances-list">
          {instances.map(instance => (
            <Card
              key={instance[fieldNames.id]}
              size="small"
              className={`instance-card ${
                instance.status === INSTANCE_STATUS.STOPPED ? 'disabled' : ''
              }`}
              style={{ marginBottom: 8 }}
            >
              <Checkbox
                checked={selectedInstances.includes(instance[fieldNames.id])}
                onChange={() => handleInstanceSelect(instance[fieldNames.id])}
                disabled={instance.status === INSTANCE_STATUS.STOPPED}
              >
                <Space>
                  <span className="instance-name">{instance[fieldNames.label]}</span>
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
                  handleInstanceSelect(instance[fieldNames.id])}
              >
                IP: {instance.ip}<br/>
                CPU: {instance.cpuType}
              </div>
            </Card>
          ))}
        </div>
      </Space>
    </div>
  );
}

export default InstanceSelector; 