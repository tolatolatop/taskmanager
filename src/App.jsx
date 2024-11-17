import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createContext } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useTaskManager } from './hooks/useTaskManager';
import TaskList from './components/TaskList';
import TaskDetail from './components/TaskDetail';
import CreateTask from './components/CreateTask';
import SearchTasks from './components/SearchTasks';
import Navbar from './components/Navbar';
import './styles/main.css';

export const TaskContext = createContext();

function App() {
  const taskManager = useTaskManager();

  return (
    <ConfigProvider locale={zhCN}>
      <TaskContext.Provider value={taskManager}>
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