import { message } from 'antd';
import { MockTaskAPI } from './mockService';

// 是否使用模拟数据（可以通过环境变量控制）
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true' || true;

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
    }
};

// 导出API（根据USE_MOCK切换）
export const TaskAPI = USE_MOCK ? MockTaskAPI : RealTaskAPI;

// Task数据模型
export const TaskModel = {
    // 任务状态枚举
    STATUS: {
        PENDING: '待处理',
        IN_PROGRESS: '进行中',
        COMPLETED: '已完成'
    },

    // 优先级枚举
    PRIORITY: {
        LOW: 'low',
        NORMAL: 'normal',
        HIGH: 'high'
    },

    // 验证任务数据
    validateTask: (task) => {
        const errors = {};

        if (!task.title?.trim()) {
            errors.title = '标题不能为空';
        }

        if (!task.dueDate) {
            errors.dueDate = '截止日期不能为空';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    // 格���化任务数据
    formatTask: (task) => ({
        ...task,
        dueDate: task.dueDate.format?.('YYYY-MM-DD') || task.dueDate,
        status: task.status || TaskModel.STATUS.PENDING,
        priority: task.priority || TaskModel.PRIORITY.NORMAL
    })
}; 