import { useState, useCallback } from 'react';
import { message } from 'antd';
import { TaskAPI, TaskModel } from '../services/taskService';

export const useTaskManager = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 获取任务列表
    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            const data = await TaskAPI.getTasks();
            setTasks(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // 添加任务
    const addTask = useCallback(async (taskData) => {
        try {
            const formattedTask = TaskModel.formatTask(taskData);
            const { isValid, errors } = TaskModel.validateTask(formattedTask);

            if (!isValid) {
                throw new Error(Object.values(errors).join(', '));
            }

            const newTask = await TaskAPI.createTask(formattedTask);
            setTasks(prev => [...prev, newTask]);
            message.success('任务创建成功');
            return newTask;
        } catch (err) {
            message.error(err.message);
            throw err;
        }
    }, []);

    // 更新任务
    const updateTask = useCallback(async (taskId, taskData) => {
        try {
            const formattedTask = TaskModel.formatTask(taskData);
            const { isValid, errors } = TaskModel.validateTask(formattedTask);

            if (!isValid) {
                throw new Error(Object.values(errors).join(', '));
            }

            const updatedTask = await TaskAPI.updateTask(taskId, formattedTask);
            setTasks(prev => prev.map(task =>
                task.id === taskId ? updatedTask : task
            ));
            message.success('任务更新成功');
            return updatedTask;
        } catch (err) {
            message.error(err.message);
            throw err;
        }
    }, []);

    // 删除任务
    const deleteTask = useCallback(async (taskId) => {
        try {
            await TaskAPI.deleteTask(taskId);
            setTasks(prev => prev.filter(task => task.id !== taskId));
            message.success('任务删除成功');
        } catch (err) {
            message.error(err.message);
            throw err;
        }
    }, []);

    // 搜索任务
    const searchTasks = useCallback(async (query) => {
        try {
            setLoading(true);
            return await TaskAPI.searchTasks(query);
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTaskLogs = async (taskId) => {
        try {
            return await TaskAPI.fetchTaskLogs(taskId);
        } catch (error) {
            console.log('获取任务日志失败:', error);
            message.error('获取日志失败');
            return [];
        }
    };

    return {
        tasks,
        loading,
        error,
        fetchTasks,
        addTask,
        updateTask,
        deleteTask,
        searchTasks,
        fetchTaskLogs,
    };
}; 