import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createContext } from 'react';
import { ConfigProvider, Layout } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useTaskManager } from './hooks/useTaskManager';
import TaskList from './components/TaskList';
import TaskDetail from './components/TaskDetail';
import CreateTask from './components/CreateTask';
import Navbar from './components/Navbar';
import './styles/main.css';

const { Content } = Layout;
export const TaskContext = createContext();

function App() {
  const taskManager = useTaskManager();

  return (
    <ConfigProvider locale={zhCN}>
      <TaskContext.Provider value={taskManager}>
        <Router>
          <Layout className="app">
            <Navbar />
            <Content className="container">
              <Routes>
                <Route path="/" element={<TaskList />} />
                <Route path="/task/:id" element={<TaskDetail />} />
                <Route path="/create" element={<CreateTask />} />
              </Routes>
            </Content>
          </Layout>
        </Router>
      </TaskContext.Provider>
    </ConfigProvider>
  );
}

export default App; 