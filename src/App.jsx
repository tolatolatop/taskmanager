import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, createContext } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import TaskList from './components/TaskList';
import TaskDetail from './components/TaskDetail';
import CreateTask from './components/CreateTask';
import SearchTasks from './components/SearchTasks';
import Navbar from './components/Navbar';
import './styles/main.css';

// 创建任务上下文
export const TaskContext = createContext();

function App() {
  // 全局状态管理
  const [tasks, setTasks] = useState([
    { id: 1, title: '开发新功能', status: '进行中', priority: 'high', description: '实现用户认证功能', dueDate: '2024-04-01' },
    { id: 2, title: '修复Bug', status: '待处理', priority: 'normal', description: '修复登录页面问题', dueDate: '2024-03-25' },
    { id: 3, title: '系统维护', status: '已完成', priority: 'low', description: '数据库备份', dueDate: '2024-03-20' }
  ]);

  // 添加任务方法
  const addTask = (newTask) => {
    setTasks([...tasks, { ...newTask, id: tasks.length + 1 }]);
  };

  // 更新任务方法
  const updateTask = (updatedTask) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  // 删除任务方法
  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  return (
    <ConfigProvider locale={zhCN}>
      <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask }}>
        <Router>
          <div className="app">
            <Navbar />
            <div className="container">
              <Routes>
                <Route path="/" element={<TaskList />} />
                <Route path="/task/:id" element={<TaskDetail />} />
                <Route path="/create" element={<CreateTask />} />
                <Route path="/search" element={<SearchTasks />} />
              </Routes>
            </div>
          </div>
        </Router>
      </TaskContext.Provider>
    </ConfigProvider>
  );
}

export default App; 