# 任务管理系统

一个基于 React 和 Ant Design 的任务管理系统，支持普通任务和部署任务的管理。

## 功能特点

### 任务管理

- 支持普通任务和部署任务两种类型
- 任务状态流转（待处理、进行中、已完成、失败）
- 任务进度跟踪
- 创建时间和完成时间记录
- 任务描述和详情查看

### 部署任务特性

- 支持选择多个部署实例
- 实例分组过滤（按地区、规格、CPU类型）
- 实例状态管理（运行中、已停止、维护中）
- 实例详细信息显示（IP、规格、CPU类型等）
- 智能过滤（自动禁用已停止的实例）

### 任务列表功能

- 任务搜索（标题和描述）
- 状态过滤
- 多维度排序（创建时间、进度、状态）
- 任务类型标识
- 进度条显示

### 任务详情功能

- 任务信息展示
- 状态更新
- 进度调整
- 执行日志查看
- 日志类型过滤（INFO、DEBUG、WARN、ERROR）

## 技术栈

- React 18
- React Router 6
- Ant Design 5
- Context API 状态管理
- CSS3 动画和过渡效果

## 开发环境设置

### 安装依赖

````shell
npm install
````

### 启动开发服务器

````shell
npm start
````

### 构建生产版本

````shell
npm run build
````

### 环境变量配置

在 .env 文件中配置：

````shell
REACT_APP_USE_MOCK=true        # 使用模拟数据
REACT_APP_API_URL=http://localhost:3000/api  # API基础URL
````

## 项目结构

````shell
src/
  ├── components/              # React组件
  │   ├── TaskList.jsx        # 任务列表
  │   ├── TaskDetail.jsx      # 任务详情
  │   ├── CreateTask.jsx      # 创建任务
  │   ├── InstanceSelector.jsx # 实例选择器
  │   └── Navbar.jsx          # 导航栏
  ├── services/               # 服务层
  │   ├── taskService.js      # 任务服务
  │   └── mockService.js      # 模拟数据服务
  ├── hooks/                  # 自定义Hooks
  │   └── useTaskManager.js   # 任务管理Hook
  ├── styles/                 # 样式文件
  │   └── main.css           # 主样式文件
  └── App.jsx                 # 应用入口'
````

## 组件说明

### InstanceSelector 组件

可复用的实例选择器组件，支持：

- 自定义字段名（id和label）
- 分组过滤功能
- 批量选择
- 状态禁用
- 详细信息显示

使用示例：

````html
// 基本使用
<InstanceSelector onChange={handleChange} />

// 自定义字段名
<InstanceSelector 
  fieldNames={{ 
    id: "instanceId", 
    label: "instanceName" 
  }} 
  onChange={handleChange}
/>

// 自定义过滤器
<InstanceSelector 
  filterItems={[
    { id: "region", label: "地区" },
    { id: "specification", label: "规格" }
  ]}
  onChange={handleChange}
/>
````

### 任务状态流转

- 待处理 -> 进行中 -> 已完成
- 任何状态 -> 失败
- 进度更新会自动触发状态变更
- 完成时自动记录完成时间

### 日志系统

- 支持四种日志级别（INFO、DEBUG、WARN、ERROR）
- 自动滚动到最新日志
- 日志类型过滤
- 显示时间戳
- 最多显示最近100条日志

## API 接口

### 任务相关接口

- GET /api/tasks - 获取任务列表
- GET /api/tasks/:id - 获取单个任务
- POST /api/tasks - 创建任务
- PUT /api/tasks/:id - 更新任务
- DELETE /api/tasks/:id - 删除任务

### 实例相关接口

- GET /api/instances - 获取实例列表
- GET /api/instances/:id - 获取实例详情
- GET /api/instances/:id/status - 获取实例状态

## 开发说明

### Mock 模式

- 默认启用 Mock 模式
- 提供完整的模拟数据
- 支持所有 CRUD 操作
- 模拟网络延迟
- 控制台日志输出

### 切换到真实 API

1. 修改 .env 文件中的 REACT_APP_USE_MOCK 为 false
2. 配置正确的 REACT_APP_API_URL
3. 确保后端 API 实现了所有必要的接口

## 注意事项

- 默认使用模拟数据，可通过环境变量切换到真实API
- 部署任务必须选择至少一个实例
- 已停止的实例无法选择
- 维护中的实例可以选择但会有警告提示
- 日志最多显示最近100条
- 建议使用 Chrome 最新版本浏览器

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT
