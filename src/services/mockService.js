// 生成随机日志消息
const generateLogs = (taskId, startTime) => {
    const logTypes = ['INFO', 'DEBUG', 'WARN', 'ERROR'];
    const actions = [
        '初始化任务',
        '加载配置',
        '验证参数',
        '连接数据库',
        '执行操作',
        '处理数据',
        '更新缓存',
        '清理资源',
        '保存结果',
        '完成任务'
    ];

    return Array.from({ length: 10 }, (_, i) => {
        const logType = logTypes[Math.floor(Math.random() * (i === 0 ? 1 : logTypes.length))]; // 第一条始终是 INFO
        const timestamp = new Date(new Date(startTime).getTime() + i * 300000).toISOString(); // 每条日志间隔5分钟
        return {
            timestamp,
            message: `[${logType}] Task-${taskId} - ${actions[i]}: ${logType === 'ERROR' ? '发生异常，请检查系统日志' :
                    logType === 'WARN' ? '性能警告，处理时间超出预期' :
                        `正常执行中，进度 ${(i + 1) * 10}%`
                }`
        };
    });
};

// 模拟数据
const mockTasks = [
    {
        id: 1,
        title: '开发用户认证功能',
        description: '实现用户登录、注册和权限控制功能',
        status: '进行中',
        progress: 60,
        createdAt: '2024-03-15 10:00:00',
        completedAt: null,
        logs: generateLogs(1, '2024-03-15 10:00:00')
    },
    {
        id: 2,
        title: '优化数据库查询',
        description: '提高查询性能，添加适当的索引',
        status: '待处理',
        progress: 0,
        createdAt: '2024-03-16 14:30:00',
        completedAt: null,
        logs: generateLogs(2, '2024-03-16 14:30:00')
    },
    {
        id: 3,
        title: '修复界面Bug',
        description: '解决移动端显示异常问题',
        status: '已完成',
        progress: 100,
        createdAt: '2024-03-10 09:15:00',
        completedAt: '2024-03-20 16:45:00',
        logs: generateLogs(3, '2024-03-10 09:15:00')
    },
    {
        id: 4,
        title: '服务器迁移',
        description: '数据迁移过程中出现异常',
        status: '失败',
        progress: 30,
        createdAt: '2024-03-18 08:00:00',
        completedAt: null,
        logs: generateLogs(4, '2024-03-18 08:00:00')
    }
];

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟服务
export const MockTaskAPI = {
    getTasks: async () => {
        console.log('Mock: 获取任务列表');
        await delay(500);
        return [...mockTasks];
    },

    getTask: async (id) => {
        console.log('Mock: 获取任务详情', id);
        await delay(300);
        const task = mockTasks.find(t => t.id === parseInt(id));
        if (!task) throw new Error('任务未找到');
        return { ...task };
    },

    createTask: async (taskData) => {
        console.log('Mock: 创建新任务', taskData);
        await delay(500);
        const newTask = {
            ...taskData,
            id: mockTasks.length + 1
        };
        mockTasks.push(newTask);
        return { ...newTask };
    },

    updateTask: async (id, taskData) => {
        console.log('Mock: 更新任务', id, taskData);
        await delay(500);
        const index = mockTasks.findIndex(t => t.id === parseInt(id));
        if (index === -1) throw new Error('任务未找到');
        const updatedTask = { ...taskData, id: parseInt(id) };
        mockTasks[index] = updatedTask;
        return { ...updatedTask };
    },

    deleteTask: async (id) => {
        console.log('Mock: 删除任务', id);
        await delay(500);
        const index = mockTasks.findIndex(t => t.id === parseInt(id));
        if (index === -1) throw new Error('任务未找到');
        mockTasks.splice(index, 1);
        return true;
    },

    searchTasks: async (query) => {
        console.log('Mock: 搜索任务', query);
        await delay(300);
        return mockTasks.filter(task =>
            task.title.toLowerCase().includes(query.toLowerCase()) ||
            task.description.toLowerCase().includes(query.toLowerCase())
        );
    }
}; 