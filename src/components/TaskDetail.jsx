import { useContext, useEffect, useState, useRef, useMemo, useCallback } from 'react';
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
  message,
  Progress,
  Typography,
  Checkbox,
  Row,
  Col,
  Tag
} from 'antd';
import { 
  DeleteOutlined, 
  ExclamationCircleOutlined,
  HistoryOutlined,
  ReloadOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { confirm } = Modal;
const { Text } = Typography;

function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, updateTask, deleteTask, fetchTaskLogs } = useContext(TaskContext);
  const [task, setTask] = useState(null);
  const [logFilters, setLogFilters] = useState({
    INFO: false,
    DEBUG: false,
    WARN: true,
    ERROR: true
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const refreshTimerRef = useRef(null);
  const logsEndRef = useRef(null);

  const filteredLogs = useMemo(() => {
    if (!task?.logs) return [];
    
    const filtered = task.logs.filter(log => {
      if (!logFilters) return true;
      
      const logType = log.message.match(/\[(.*?)\]/)?.[1];
      if (!logType) return true;
      
      return logFilters[logType];
    });
    
    return filtered;
  }, [task?.logs, logFilters]);

  useEffect(() => {
    const foundTask = tasks.find(t => t.id === parseInt(id));
    if (foundTask) {
      setTask(foundTask);
    }
  }, [id, tasks]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [task?.logs]);

  useEffect(() => {
    console.log('自动刷新状态变更:', autoRefresh, '任务ID:', task?.id);
    if (autoRefresh && task) {
      console.log('启动自动刷新定时器');
      refreshTimerRef.current = setInterval(() => refreshLogs(false), 1000);
    }
    return () => {
      if (refreshTimerRef.current) {
        console.log('清除自动刷新定时器');
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, task?.id]);

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

  const handleProgressChange = async (value) => {
    const progress = Math.min(100, Math.max(0, value));
    
    let newStatus = task.status;
    if (progress === 100) {
      newStatus = '已完成';
    } else if (progress === 0) {
      newStatus = '待处理';
    } else if (task.status === '待处理' || task.status === '已完成') {
      newStatus = '进行中';
    }

    const updatedTask = {
      ...task,
      progress,
      status: newStatus,
      completedAt: newStatus === '已完成' ? new Date().toISOString() : null
    };
    
    await updateTask(updatedTask.id, updatedTask);
    setTask(updatedTask);
    message.success('任务进度更新成功');
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

  const getProgressStatus = (status) => {
    switch(status) {
      case '已完成':
        return 'success';
      case '失败':
        return 'exception';
      case '进行中':
        return 'active';
      default:
        return 'normal';
    }
  };

  // 获取最新的100条日志
  const getRecentLogs = () => {
    if (!task?.logs) return [];
    return task.logs.slice(-100);
  };

  // 处理日志类型过滤变化
  const handleLogFilterChange = (logType) => {
    setLogFilters(prev => ({
      ...prev,
      [logType]: !prev[logType]
    }));
  };

  // 获取日志类型的样式
  const getLogTypeStyle = (message) => {
    const matches = message.match(/\[(.*?)\]/);
    if (!matches || !matches[1]) {
      return { color: '#52c41a' }; // 默认颜色
    }
    
    const logType = matches[1];
    switch(logType) {
      case 'ERROR':
        return { color: '#ff4d4f' };
      case 'WARN':
        return { color: '#faad14' };
      case 'DEBUG':
        return { color: '#1890ff' };
      default:
        return { color: '#52c41a' };
    }
  };

  // 添加刷新日志的函数
  const refreshLogs = async (isManualRefresh = false) => {
    // 只在手动刷新时输出详细日志
    if (isManualRefresh) {
      console.log('手动刷新日志, 任务ID:', task?.id);
    }
    
    if (task) {
      try {
        const logs = await fetchTaskLogs(task.id);
        if (isManualRefresh) {
          console.log('获取到新日志:', logs?.length || 0, '条');
        }
        setTask(prev => ({
          ...prev,
          logs: logs
        }));
      } catch (error) {
        console.error('刷新日志失败:', error);
      }
    }
  };

  // 修改手动刷新按钮的点击处理
  const handleManualRefresh = () => {
    refreshLogs(true);
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
        <Space direction="vertical" style={{ width: '100%' }}>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="标题">{task.title}</Descriptions.Item>
            <Descriptions.Item label="描述">{task.description}</Descriptions.Item>
            <Descriptions.Item label="任务类型">
              {task.type === 'deploy' ? '部署任务' : '普通任务'}
            </Descriptions.Item>
            {task.type === 'deploy' && task.instances && (
              <Descriptions.Item label="部署实例">
                <div style={{ padding: '8px 0' }}>
                  {task.instances.map((instance, index) => (
                    <Tag 
                      key={instance.id}
                      color="blue"
                      style={{ marginBottom: 8 }}
                    >
                      {instance.name} ({instance.ip})
                    </Tag>
                  ))}
                </div>
              </Descriptions.Item>
            )}
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
            <Descriptions.Item label="进度">
              <div style={{ width: '100%', maxWidth: 400, padding: '8px 0' }}>
                <Progress 
                  percent={task.progress} 
                  status={getProgressStatus(task.status)}
                  steps={20}
                  strokeColor={task.status === '失败' ? '#ff4d4f' : undefined}
                  onChange={handleProgressChange}
                />
              </div>
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

          <Card 
            title={
              <Space>
                <HistoryOutlined />
                执行日志
                {task.type === 'deploy' && (
                  <Tag color="blue">部署日志</Tag>
                )}
              </Space>
            }
            size="small"
            extra={
              <Space>
                <Button
                  type="text"
                  icon={autoRefresh ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  {autoRefresh ? '暂停刷新' : '自动刷新'}
                </Button>
                <Button
                  type="text"
                  icon={<ReloadOutlined />}
                  onClick={handleManualRefresh}
                />
                <Checkbox
                  checked={logFilters.INFO}
                  onChange={() => handleLogFilterChange('INFO')}
                >
                  <Text style={{ color: '#52c41a' }}>INFO</Text>
                </Checkbox>
                <Checkbox
                  checked={logFilters.DEBUG}
                  onChange={() => handleLogFilterChange('DEBUG')}
                >
                  <Text style={{ color: '#1890ff' }}>DEBUG</Text>
                </Checkbox>
                <Checkbox
                  checked={logFilters.WARN}
                  onChange={() => handleLogFilterChange('WARN')}
                >
                  <Text style={{ color: '#faad14' }}>WARN</Text>
                </Checkbox>
                <Checkbox
                  checked={logFilters.ERROR}
                  onChange={() => handleLogFilterChange('ERROR')}
                >
                  <Text style={{ color: '#ff4d4f' }}>ERROR</Text>
                </Checkbox>
              </Space>
            }
          >
            <div className="task-logs">
              {filteredLogs.map((log, index) => (
                <div key={index} className="log-entry">
                  <Text type="secondary" style={{ marginRight: 8 }}>
                    {dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                  </Text>
                  <Text style={getLogTypeStyle(log.message)}>
                    {log.message}
                  </Text>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </Card>
        </Space>
      </Card>
    </div>
  );
}

export default TaskDetail; 