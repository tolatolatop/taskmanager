import { message } from 'antd';
import { MockTaskAPI } from './mockService';

// 是否使用模拟数据（可以通过环境变量控制）
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true' || false;

// 在启动时打印当前模式
console.log('当前API模式:', USE_MOCK ? 'Mock模式' : '真实API模式');
console.log('API基础URL:', process.env.REACT_APP_API_URL || 'http://localhost:3000/api');

// API基础URL
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// 统一处理请求错误
const handleError = (error) => {
    message.error(error.message || '操作失败');
    throw error;
};

// 统一处理请求
const request = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        handleError(error);
    }
};


const convertInstanceFromApiFormat = (instance) => {
    return {
        id: instance.id,
        name: instance.name,
        ip: instance.ip,
        region: instance.region,
        specification: instance.specification,
        cpuType: instance.cpuType,
        status: instance.status,
        lastHeartbeat: instance.last_heartbeat
    };
};

// 真实API实现
const RealTaskAPI = {
    getTasks: async () => {
        return await request('/tasks');
    },

    getTask: async (id) => {
        return await request(`/tasks/${id}`);
    },

    createTask: async (taskData) => {
        return await request('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData),
        });
    },

    updateTask: async (id, taskData) => {
        return await request(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(taskData),
        });
    },

    deleteTask: async (id) => {
        return await request(`/tasks/${id}`, {
            method: 'DELETE',
        });
    },

    searchTasks: async (query) => {
        return await request(`/tasks/search?q=${encodeURIComponent(query)}`);
    },

    // 实例相关接口
    getInstances: async () => {
        const instances = await request('/instances');
        return instances.map(convertInstanceFromApiFormat);
    },

    getInstanceDetails: async (instanceId) => {
        const instance = await request(`/instances/${instanceId}`);
        return convertInstanceFromApiFormat(instance);
    },

    getInstanceStatus: async (instanceId) => {
        return await request(`/instances/${instanceId}/status`);
    },

    // 批量获取实例状态
    batchGetInstanceStatus: async (instanceIds) => {
        return await request('/instances/batch/status', {
            method: 'POST',
            body: JSON.stringify({ instanceIds }),
        });
    },

    // 实例过滤
    filterInstances: async (filters) => {
        const queryString = new URLSearchParams(filters).toString();
        const instances = await request(`/instances/filter?${queryString}`);
        return instances.map(convertInstanceFromApiFormat);
    },

    // 任务日志
    fetchTaskLogs: async (taskId) => {
        try {
            const response = await fetch(`${BASE_URL}/tasks/${taskId}/logs`);
            if (!response.ok) {
                throw new Error('获取日志失败');
            }
            return await response.json();
        } catch (error) {
            console.error('获取任务日志请求失败:', error);
            throw error;
        }
    },
};

// 导出API（根据USE_MOCK切换）
export const TaskAPI = USE_MOCK ? MockTaskAPI : RealTaskAPI;

// Task数据模型
export const TaskModel = {
    // 任务类型枚举
    TYPE: {
        NORMAL: 'normal',
        DEPLOY: 'deploy'
    },

    // 任务状态枚举
    STATUS: {
        PENDING: '待处理',
        IN_PROGRESS: '进行中',
        COMPLETED: '已完成',
        FAILED: '失败'
    },

    // 验证任务数据
    validateTask: (task) => {
        const errors = {};

        if (!task.title?.trim()) {
            errors.title = '标题不能为空';
        }

        if (task.type === 'deploy' && (!task.instances || task.instances.length === 0)) {
            errors.instances = '部署任务必须选择至少一个实例';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    // 格式化任务数据
    formatTask: (task) => ({
        ...task,
        type: task.type || TaskModel.TYPE.NORMAL,
        status: task.status || TaskModel.STATUS.PENDING,
        progress: task.progress || 0,
        instances: task.instances || [],
        createdAt: task.createdAt || new Date().toISOString(),
        completedAt: task.completedAt || null
    })
};

// 导出实例相关的枚举
export const INSTANCE_STATUS = {
    RUNNING: 'running',
    STOPPED: 'stopped',
    MAINTENANCE: 'maintenance'
};

export const INSTANCE_SPECIFICATION = {
    SMALL: '2C4G',
    MEDIUM: '4C8G',
    LARGE: '8C16G',
    XLARGE: '16C32G',
    XXLARGE: '32C64G',
    XXXLARGE: '64C128G'
};

export const INSTANCE_REGIONS = {
    EAST_SHANGHAI: '华东-上海',
    EAST_HANGZHOU: '华东-杭州',
    NORTH_BEIJING: '华北-北京',
    SOUTH_GUANGZHOU: '华南-广州',
    SOUTH_SHENZHEN: '华南-深圳',
    SOUTHWEST_CHENGDU: '西南-成都',
    EAST_NANJING: '华东-南京'
}; 