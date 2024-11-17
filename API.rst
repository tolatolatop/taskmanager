任务管理系统 API 文档
===================

基础信息
-------
:基础URL: http://localhost:3000/api
:数据格式: 所有请求和响应均使用 JSON 格式
:时间格式: ISO 8601 标准 (YYYY-MM-DD HH:mm:ss)

认证
---
暂无认证要求

错误处理
-------
所有失败的请求都会返回对应的 HTTP 状态码和错误信息::

    {
        "error": "错误描述信息"
    }

API 端点
-------

任务相关接口
^^^^^^^^^^

获取任务列表
~~~~~~~~~~
:URL: /tasks
:方法: GET
:参数: 无
:响应: ::

    [
        {
            "id": 1,
            "title": "任务标题",
            "description": "任务描述",
            "type": "normal|deploy",
            "status": "待处理|进行中|已完成|失败",
            "progress": 0,
            "createdAt": "2024-03-20 10:00:00",
            "completedAt": null,
            "instances": []  // 仅部署任务包含此字段
        }
    ]

获取单个任务
~~~~~~~~~~
:URL: /tasks/:id
:方法: GET
:参数: id (任务ID)
:响应: ::

    {
        "id": 1,
        "title": "任务标题",
        "description": "任务描述",
        "type": "normal|deploy",
        "status": "待处理|进行中|已完成|失败",
        "progress": 0,
        "createdAt": "2024-03-20 10:00:00",
        "completedAt": null,
        "instances": [],
        "logs": [
            {
                "timestamp": "2024-03-20 10:00:00",
                "message": "[INFO] 日志内容"
            }
        ]
    }

创建任务
~~~~~~~
:URL: /tasks
:方法: POST
:请求体: ::

    {
        "title": "任务标题",
        "description": "任务描述",
        "type": "normal|deploy",
        "instances": [1, 2]  // 仅部署任务需要此字段
    }

:响应: 返回创建的任务完整信息

更新任务
~~~~~~~
:URL: /tasks/:id
:方法: PUT
:参数: id (任务ID)
:请求体: ::

    {
        "title": "任务标题",
        "description": "任务描述",
        "status": "待处理|进行中|已完成|失败",
        "progress": 50
    }

:响应: 返回更新后的任务完整信息

删除任务
~~~~~~~
:URL: /tasks/:id
:方法: DELETE
:参数: id (任务ID)
:响应: ::

    {
        "success": true
    }

搜索任务
~~~~~~~
:URL: /tasks/search
:方法: GET
:查询参数: q (搜索关键词)
:响应: 返回匹配的任务列表

实例相关接口
^^^^^^^^^^

获取实例列表
~~~~~~~~~~
:URL: /instances
:方法: GET
:响应: ::

    [
        {
            "id": 1,
            "name": "实例名称",
            "ip": "192.168.1.1",
            "region": "华东-上海",
            "status": "running|stopped|maintenance",
            "specification": "8C16G",
            "cpuType": "Intel Xeon",
            "lastHeartbeat": "2024-03-20 10:00:00"
        }
    ]

获取实例详情
~~~~~~~~~~
:URL: /instances/:id
:方法: GET
:参数: id (实例ID)
:响应: 返回单个实例的完整信息

获取实例状态
~~~~~~~~~~
:URL: /instances/:id/status
:方法: GET
:参数: id (实例ID)
:响应: ::

    {
        "status": "running|stopped|maintenance",
        "lastHeartbeat": "2024-03-20 10:00:00"
    }

数据模型
-------

任务 (Task)
^^^^^^^^^
============  ========  ================================
字段          类型      描述
============  ========  ================================
id            number    任务ID
title         string    任务标题
description   string    任务描述
type          string    任务类型: normal/deploy
status        string    任务状态: 待处理/进行中/已完成/失败
progress      number    任务进度(0-100)
createdAt     string    创建时间
completedAt   string    完成时间
instances     array     部署实例列表(仅部署任务)
logs          array     任务日志列表
============  ========  ================================

实例 (Instance)
^^^^^^^^^^^^
===============  ========  ================================
字段             类型      描述
===============  ========  ================================
id               number    实例ID
name             string    实例名称
ip               string    IP地址
region           string    地区
status           string    状态: running/stopped/maintenance
specification    string    规格(如: 8C16G)
cpuType          string    CPU类型
lastHeartbeat    string    最后心跳时间
===============  ========  ================================

日志 (Log)
^^^^^^^^
===========  ========  ===========
字段         类型      描述
===========  ========  ===========
timestamp    string    日志时间
message      string    日志内容
===========  ========  ===========

状态码说明
--------
- 200: 成功
- 201: 创建成功
- 400: 请求参数错误
- 404: 资源不存在
- 500: 服务器内部错误

注意事项
-------
1. 部署任务必须选择至少一个实例
2. 已停止的实例不能被选择用于部署
3. 任务进度更新可能会触发状态变更
4. 日志最多返回最近100条记录
5. 所有时间戳都使用服务器时区 