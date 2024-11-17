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
        logs: Array.from({ length: 150 }, (_, i) => ({
            timestamp: new Date(Date.now() - (150 - i) * 60000).toISOString(),
            message: `[INFO] 执行步骤 ${i + 1}: 正在处理用户认证模块...`
        }))
    },
    {
        id: 2,
        title: '优化数据库查询',
        description: '提高查询性能，添加适当的索引',
        status: '待处理',
        progress: 0,
        createdAt: '2024-03-16 14:30:00',
        completedAt: null
    },
    {
        id: 3,
        title: '修复界面Bug',
        description: '解决移动端显示异常问题',
        status: '已完成',
        progress: 100,
        createdAt: '2024-03-10 09:15:00',
        completedAt: '2024-03-20 16:45:00'
    },
    {
        id: 4,
        title: '服务器迁移',
        description: '数据迁移过程中出现异常',
        status: '失败',
        progress: 30,
        createdAt: '2024-03-18 08:00:00',
        completedAt: null
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