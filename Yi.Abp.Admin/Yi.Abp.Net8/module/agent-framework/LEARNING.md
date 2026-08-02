# Microsoft Agent Framework (MSAF) 学习文档

> 本文档配合 `module/agent-framework/` 模块代码使用,系统讲解 Microsoft Agent Framework 的核心概念、API 用法、工作流编排,以及如何落地"方案 C:微内核多 Agent 架构"。

---

## 目录

1. [框架定位与生态关系](#1-框架定位与生态关系)
2. [核心抽象](#2-核心抽象)
3. [环境与依赖](#3-环境与依赖)
4. [对接 DeepSeek / OpenAI / Ollama](#4-对接-deepseek--openai--ollama)
5. [第一个 Agent:Hello World](#5-第一个-agenthello-world)
6. [多轮对话记忆:AgentThread](#6-多轮对话记忆agentthread)
7. [工具调用:AIFunction](#7-工具调用aifunction)
8. [流式输出:RunStreamingAsync](#8-流式输出runstreamingasync)
9. [Workflow 工作流编排](#9-workflow-工作流编排)
10. [方案 C:微内核多 Agent 架构落地](#10-方案-c微内核多-agent-架构落地)
11. [学习路径(分阶段)](#11-学习路径分阶段)
12. [API 速查表](#12-api-速查表)
13. [常见问题与排错](#13-常见问题与排错)
14. [延伸阅读](#14-延伸阅读)

---

## 1. 框架定位与生态关系

### 1.1 MSAF 是什么

**Microsoft Agent Framework (MSAF)** 是微软于 **2025 年 10 月**发布的 .NET AI 智能体框架(目前为 Preview 阶段)。它解决的核心问题是:**让开发者用统一抽象构建具备状态、身份、工具调用能力的 AI 智能体,并支持多 Agent 编排**。

一句话定位:

> **MSAF 是构建在 Microsoft.Extensions.AI 之上的企业级 Agent 框架,提供状态管理、身份定义、工具管理和工作流编排能力。**

### 1.2 与易混淆概念的区别

| 名称 | 全称 | 定位 | 与 MSAF 关系 |
|------|------|------|---------------|
| **MAF** | Managed AddIn Framework (`System.AddIn`) | .NET Framework 3.5 插件隔离框架(七层管道) | **无关**,仅缩写相同 |
| **MEAI** | Microsoft.Extensions.AI | .NET 中 `IChatClient` / `IEmbeddingGenerator` 抽象 | MSAF **构建其上** |
| **Semantic Kernel** | Microsoft.SemanticKernel | 早期 AI 编排框架,功能更广 | MSAF 与 SK 并存,定位更聚焦 Agent |
| **MSAF** | Microsoft Agent Framework | 本文档主题 | — |

### 1.3 技术栈层次

```
┌─────────────────────────────────────────────┐
│  你的业务代码(ABP AppService / Runner)        │
├─────────────────────────────────────────────┤
│  Microsoft Agent Framework (MSAF)           │
│   - AIAgent / ChatClientAgent               │
│   - AgentThread(多轮记忆)                    │
│   - Workflow / Executor(编排)                │
├─────────────────────────────────────────────┤
│  Microsoft.Extensions.AI (MEAI)             │
│   - IChatClient 抽象                         │
│   - AIFunction / AIFunctionFactory           │
├─────────────────────────────────────────────┤
│  LLM Provider 实现                           │
│   - Microsoft.Agents.AI.OpenAI (推荐)        │
│   - Azure OpenAI / Ollama / DeepSeek 等      │
├─────────────────────────────────────────────┤
│  实际 LLM 服务                                │
│   - DeepSeek API                             │
│   - OpenAI / Azure OpenAI                    │
│   - 本地 Ollama / vLLM                       │
└─────────────────────────────────────────────┘
```

**关键洞察**:MSAF 不直接调 LLM,它通过 MEAI 的 `IChatClient` 抽象对接任意 LLM Provider。换 LLM 只换 Provider,Agent 代码零改动。

---

## 2. 核心抽象

MSAF 有 **5 个核心抽象**,贯穿整个框架:

### 2.1 AIAgent(智能体)

**定义**:具有固定身份(Instructions + Name)和工具集合的 AI 调用封装。

**核心特点**:
- **身份固定**:Instructions 和 Name 在创建时绑定,无需每次调用传入
- **可复用**:同一 Agent 实例可被多次调用
- **可组合**:多个 Agent 可在 Workflow 中协作

**对比 IChatClient**:

| 特性 | IChatClient | AIAgent |
|------|-------------|---------|
| 定位 | 底层 AI 调用抽象 | 高级智能体封装 |
| 状态 | 无状态,每次调用独立 | 内置对话线程(AgentThread) |
| 身份 | 需手动传 System Message | 固定的 Instructions / Name |
| 工具 | 需手动配 ChatOptions.Tools | Agent 级统一管理 |
| 场景 | 单次对话 | 多轮交互、企业级对话 |

### 2.2 ChatClientAgent(具体实现)

`AIAgent` 的最常用实现,基于 `ChatClient` 创建。本模块的 [HelloWorldRunner](file:///c:/Users/30359/Desktop/Code_Practice/MAF/Yi.Abp.Admin/Yi.Abp.Net8/module/agent-framework/Yi.Framework.Application/Runners/HelloWorldRunner.cs) 用的就是它。

### 2.3 AgentRunResponse(执行响应)

`RunAsync` 的返回类型,**不是 string**。常用取值方式:
- `response.ToString()` — 取文本输出(最常用)
- `response.Output` — 完整输出项集合(含 tool calls 等)
- `response.Messages` — 完整消息历史

### 2.4 AgentThread(对话线程)

**解决痛点**:默认情况下 `RunAsync` 是无状态的,Agent 不记得上一轮对话。

**解决方案**:用 `AgentThread` 维护对话历史,同一 Thread 下的多次调用共享上下文。

### 2.5 Workflow + Executor(工作流编排)

**Workflow** = 有向图(DAG),把多个 Agent 和 Executor 用 Edge 连起来。

**Executor** = 自定义节点,继承 `Executor<TInput, TOutput>`,写代码处理消息(不调 LLM)。

详见 [第 9 节](#9-workflow-工作流编排)。

---

## 3. 环境与依赖

### 3.1 .NET 版本

- **.NET 10**(本项目使用,推荐)
- .NET 9 也可,但部分 API 可能有差异

### 3.2 NuGet 包

本模块 [Yi.Framework.Application.csproj](file:///c:/Users/30359/Desktop/Code_Practice/MAF/Yi.Abp.Admin/Yi.Abp.Net8/module/agent-framework/Yi.Framework.Application/Yi.Framework.Application.csproj) 中引用:

```xml
<!-- MSAF 核心:只需一个包即可对接 OpenAI 兼容服务(含 DeepSeek/Ollama 等) -->
<PackageReference Include="Microsoft.Agents.AI.OpenAI" Version="1.0.0-preview.251219.1" />
```

**重要**:只需 `Microsoft.Agents.AI.OpenAI` 一个包,它会传递依赖:
- `Microsoft.Agents.AI` — Agent 抽象
- `Microsoft.Extensions.AI` — IChatClient 抽象
- `Microsoft.Extensions.AI.Abstractions` — 抽象接口
- `OpenAI` — OpenAI 官方客户端(可对接 DeepSeek)
- `System.ClientModel` — ApiKeyCredential

> **不要**再单独引用 `Microsoft.Extensions.AI.OpenAI`、`OpenAI`、`Microsoft.Agents.AI` 等包,避免版本冲突。

### 3.3 命名空间速查

```csharp
using Microsoft.Agents.AI;           // AIAgent, AgentRunResponse
using Microsoft.Agents.AI.OpenAI;    // ChatClientAgent, CreateAIAgent 扩展
using OpenAI;                        // OpenAIClient, OpenAIClientOptions
using OpenAI.Chat;                   // ChatClient
using System.ClientModel;            // ApiKeyCredential
using Microsoft.Extensions.AI;       // IChatClient(如需直接用)
```

---

## 4. 对接 DeepSeek / OpenAI / Ollama

### 4.1 核心思路

MSAF 通过 **OpenAI 兼容协议**对接所有 LLM。DeepSeek、通义千问、Ollama、vLLM 等都提供 OpenAI 兼容接口,只需改 `Endpoint` 和 `ApiKey` 即可。

### 4.2 配置文件

参见 [appsettings.json](file:///c:/Users/30359/Desktop/Code_Practice/MAF/Yi.Abp.Admin/Yi.Abp.Net8/src/Yi.Abp.Web/appsettings.json#L115-L123):

```json
"AgentFramework": {
  "Llm": {
    "Endpoint": "https://api.deepseek.com/v1",
    "ApiKey": "sk-你的ApiKey",
    "ModelId": "deepseek-chat"
  }
}
```

### 4.3 各 Provider 配置参考

| Provider | Endpoint | ModelId 示例 | 备注 |
|----------|----------|--------------|------|
| **DeepSeek** | `https://api.deepseek.com/v1` | `deepseek-chat` | V3.2 非思考模式 |
| **DeepSeek 思考** | `https://api.deepseek.com/v1` | `deepseek-reasoner` | V3.2 思考模式 |
| **OpenAI** | `https://api.openai.com/v1` | `gpt-4o` / `gpt-4o-mini` | 默认值,可不配 Endpoint |
| **Azure OpenAI** | Azure Portal 提供 | 部署名 | 需用 `AzureOpenAIClient` |
| **Ollama 本地** | `http://localhost:11434/v1` | `llama3.2` / `qwen2.5` | 本地无需 ApiKey,填任意字符串 |
| **通义千问** | `https://dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-plus` | DashScope 兼容模式 |

### 4.4 工厂实现

参见 [ChatClientFactory](file:///c:/Users/30359/Desktop/Code_Practice/MAF/Yi.Abp.Admin/Yi.Abp.Net8/module/agent-framework/Yi.Framework.Application/Infrastructure/ChatClientFactory.cs):

```csharp
var openAiOptions = new OpenAIClientOptions { Endpoint = new Uri(_options.Endpoint) };
var openAiClient = new OpenAIClient(new ApiKeyCredential(_options.ApiKey), openAiOptions);
ChatClient chatClient = openAiClient.GetChatClient(_options.ModelId);
return chatClient;
```

**要点**:
- `ApiKeyCredential` 来自 `System.ClientModel`,**不能直接传 string**
- `GetChatClient(modelId)` 绑定模型,返回的 `ChatClient` 已是"绑定到具体模型"的实例

### 4.5 DeepSeek 充值提示

DeepSeek 调用返回 **HTTP 402** 表示账户余额不足,需到 [platform.deepseek.com](https://platform.deepseek.com) 充值。

---

## 5. 第一个 Agent:Hello World

### 5.1 三步创建 Agent

参见 [HelloWorldRunner.cs](file:///c:/Users/30359/Desktop/Code_Practice/MAF/Yi.Abp.Admin/Yi.Abp.Net8/module/agent-framework/Yi.Framework.Application/Runners/HelloWorldRunner.cs):

```csharp
// 1. 获取已绑定模型名的 ChatClient
ChatClient chatClient = _chatClientFactory.Create();

// 2. 创建 Agent —— "1 个能力 = 1 个 Agent 插件" 的最小原型
ChatClientAgent greeter = chatClient.CreateAIAgent(
    instructions: """
        你是一个简洁的问候助手。
        规则:
        1. 用中文回答
        2. 回答不超过 50 字
        3. 结尾加上 [from Agent]
        """,
    name: "greeter"
);

// 3. 调用 Agent
AgentRunResponse response = await greeter.RunAsync(userInput);
string text = response.ToString();
```

### 5.2 关键 API

| API | 说明 |
|-----|------|
| `chatClient.CreateAIAgent(instructions, name)` | 扩展方法,返回 `ChatClientAgent` |
| `chatClient.CreateAIAgent(instructions, name, tools)` | 带工具的重载 |
| `agent.RunAsync(string)` | 同步调用,返回 `AgentRunResponse` |
| `agent.RunAsync(string, AgentThread)` | 带对话线程,实现多轮记忆 |

### 5.3 Instructions 最佳实践

Instructions 是 Agent 的"灵魂",决定能力边界:

```
角色定位  → 你是一个 XX 助手
行为规则  → 规则:1. ... 2. ... 3. ...
输出格式  → 输出 JSON: {"field": "..."}
约束边界  → 拒绝处理 XX 类问题
```

**反模式**:
- ❌ 把所有业务逻辑塞进一个 Agent 的 Instructions
- ❌ Instructions 写得过长(超过 2000 字 LLM 可能开始忽略)
- ✅ 一个 Agent 专注一个能力(对应方案 C 的"能力插件")

### 5.4 调用方式对比

| 方式 | API | 返回 | 适用 |
|------|-----|------|------|
| 同步 | `RunAsync(string)` | `Task<AgentRunResponse>` | 后台任务、API |
| 流式 | `RunStreamingAsync(string)` | `IAsyncEnumerable<...>` | 前端打字机、长输出 |
| 带 Thread | `RunAsync(string, AgentThread)` | `Task<AgentRunResponse>` | 多轮对话 |

### 5.5 API 端点测试

ABP 自动生成 REST API:

```http
POST /api/app/agent-framework-app/hello-world
Content-Type: application/json

{"input": "你好,介绍一下你自己"}
```

预期响应:
```json
{
  "output": "你好!我是一个问候助手,会用简洁的中文回答你的问题。[from Agent]",
  "elapsedMs": 1234,
  "trace": "HelloWorldRunner → greeter(Agent) → 输出"
}
```

---

## 6. 多轮对话记忆:AgentThread

### 6.1 默认无状态的问题

```csharp
// 第一轮
await agent.RunAsync("我叫张三");
// 第二轮 —— Agent 不记得 "张三"
await agent.RunAsync("你知道我叫什么吗?");  // ❌ 回答 "不知道"
```

### 6.2 用 AgentThread 解决

```csharp
// 创建对话线程
AgentThread thread = greeter.GetNewThread();

// 所有对话使用同一个 thread —— 共享上下文
await greeter.RunAsync("我叫张三", thread);
await greeter.RunAsync("你知道我叫什么吗?", thread);  // ✅ "张三"
```

### 6.3 Thread 持久化

`AgentThread` 支持序列化,可存到数据库 / Redis 实现跨会话记忆。本模块第四阶段会演示如何结合 ABP 的 `IDistributedCache` 持久化 Thread。

---

## 7. 工具调用:AIFunction

### 7.1 为什么需要工具

LLM 本身只能"说话",不能"做事"。工具(Tool / Function Calling)让 Agent 能:
- 查数据库
- 调外部 API
- 执行计算
- 操作本地文件

### 7.2 定义工具

```csharp
using Microsoft.Extensions.AI;

// 方式 1:用 AIFunctionFactory.Create 包装方法
AIFunction getWeatherTool = AIFunctionFactory.Create(GetWeatherAsync, "get_weather", "查询某城市天气");

// 方式 2:用 AIFunctionFactory.Create 包装委托
AIFunction calcTool = AIFunctionFactory.Create((double a, double b) => a + b, "add", "两数相加");

async Task<string> GetWeatherAsync(string city)
{
    // 实际业务:查 DB / 调天气 API
    return $"{{city}}今天晴,25°C";
}
```

### 7.3 绑定到 Agent

```csharp
ChatClientAgent agent = chatClient.CreateAIAgent(
    instructions: "你是天气助手,用 get_weather 工具查天气",
    name: "weather_agent",
    tools: [getWeatherTool]  // 关键:传入工具集合
);

// 调用时,LLM 会自动决定是否调工具、调哪个工具
var response = await agent.RunAsync("北京天气怎么样?");
// → Agent 内部:LLM 决定调 get_weather("北京") → 拿到结果 → 整理为自然语言返回
```

### 7.4 工具调用流程

```
用户: "北京天气怎么样?"
  ↓
LLM 思考: 需要调 get_weather 工具
  ↓
MSAF 自动执行: get_weather("北京") → "北京今天晴,25°C"
  ↓
LLM 整理: "北京今天晴,气温25°C,适合出行。"
  ↓
返回给用户
```

**重要**:整个过程 MSAF 自动处理,开发者只需定义工具 + 绑定到 Agent。

---

## 8. 流式输出:RunStreamingAsync

### 8.1 同步 vs 流式

```csharp
// 同步:等待完整响应(用户体验差)
var response = await agent.RunAsync("讲个故事");
Console.WriteLine(response.ToString());

// 流式:逐字输出(像 ChatGPT)
await foreach (var chunk in agent.RunStreamingAsync("讲个故事"))
{
    Console.Write(chunk);  // 逐块输出,不换行
}
```

### 8.2 在 Web 场景使用

结合 SignalR / SSE 实现前端打字机效果:

```csharp
// SignalR Hub 中
await foreach (var chunk in agent.RunStreamingAsync(userInput))
{
    await Clients.Caller.SendAsync("ReceiveChunk", chunk);
}
```

本模块第四阶段会演示与项目已有 SignalR 集成的流式输出。

---

## 9. Workflow 工作流编排

> 这是**方案 C 微内核多 Agent 架构**的核心。Workflow 就是"编排引擎"。

### 9.1 三种节点类型

| 节点类型 | 说明 | 创建方式 |
|----------|------|----------|
| **Agent 节点** | 调用 LLM 推理 | `agent.AsWorkflowNode()` 或直接 AddAgent |
| **Executor 节点** | 自定义代码(不调 LLM) | 继承 `Executor<TIn, TOut>` |
| **外部入口** | 工作流起点 | `WorkflowBuilder` 自动管理 |

### 9.2 自定义 Executor

```csharp
using Microsoft.Agents.AI.Workflows;

public class UppercaseExecutor : Executor<string, string>
{
    public override Task<string> InvokeAsync(string input, CancellationToken ct)
    {
        // 不调 LLM,纯代码处理
        return Task.FromResult(input.ToUpperInvariant());
    }
}

public class WordCountExecutor : Executor<string, int>
{
    public override Task<int> InvokeAsync(string input, CancellationToken ct)
    {
        return Task.FromResult(input.Split(' ').Length);
    }
}
```

**Executor 用途**:
- 输入预处理(切分、格式化、清洗)
- 结果聚合(Fan-In)
- 业务逻辑分支
- 落库、转发、记日志

### 9.3 四种 Edge(边)

| Edge 类型 | API | 数据流 | 场景 |
|-----------|-----|--------|------|
| 顺序边 | `AddEdge(src, dst)` | 1 → 1 | 串联执行 |
| 扇出 | `AddFanOutEdge(src, [d1,d2,d3])` | 1 → N(并行) | 多 Agent 并行处理 |
| 扇入 | `AddFanInEdge(dst, [s1,s2,s3])` | N → 1(聚合) | 汇总多个 Agent 结果 |
| 条件 | `AddConditionalEdge(src, fn)` | 1 → 1(动态) | 路由分支 |

### 9.4 顺序 Workflow(第二阶段下)

```
[Input] → [Executor: 格式化] → [Agent: 处理] → [Executor: 落库] → [Output]
```

```csharp
var builder = new WorkflowBuilder();

var fmt = builder.AddExecutor(new FormatExecutor(), "format");
var agent = builder.AddAgent(myAgent, "processor");
var sink = builder.AddExecutor(new SinkExecutor(), "sink");

builder.AddEdge(fmt, agent);
builder.AddEdge(agent, sink);
builder.WithOutputFrom(sink);

var workflow = builder.Build();
var result = await workflow.RunAsync(input);
```

### 9.5 Fan-Out / Fan-In(第三阶段上)

```
                 ┌─→ [Agent: 翻译] ─┐
[Dispatch] ─FanOut→├─→ [Agent: 摘要] ─┤─FanIn─→ [Aggregate] → [Output]
                 └─→ [Agent: 合规] ─┘
```

这是**方案 C 的雏形**:每个能力是独立 Agent,Dispatch 分发,FanIn 聚合。

```csharp
var dispatch = builder.AddExecutor(new DispatchExecutor(), "dispatch");
var translator = builder.AddAgent(translatorAgent, "translator");
var summarizer = builder.AddAgent(summarizerAgent, "summarizer");
var compliance = builder.AddAgent(complianceAgent, "compliance");
var aggregate = builder.AddExecutor(new AggregateExecutor(), "aggregate");

// Fan-Out:dispatch 同时分发给 3 个 Agent
builder.AddFanOutEdge(dispatch, [translator, summarizer, compliance]);

// Fan-In:3 个 Agent 结果汇入 aggregate
builder.AddFanInEdge(aggregate, [translator, summarizer, compliance]);

builder.WithOutputFrom(aggregate);
```

### 9.6 条件分支(第三阶段下)

```csharp
// 根据输入类型路由到不同 Agent
builder.AddConditionalEdge(router, input =>
{
    if (input.Contains("合同")) return "contract_agent";
    if (input.Contains("合规")) return "compliance_agent";
    return "default_agent";
});
```

### 9.7 Workflow 执行模型

MSAF Workflow 默认使用 **`InProcessExecution`**:
- 同进程执行,无 IPC 开销
- Fan-Out 节点**并行执行**(Task 并发)
- Edge 数据通过消息传递
- 支持取消(`CancellationToken`)

---

## 10. 方案 C:微内核多 Agent 架构落地

### 10.1 架构映射

你描述的方案 C 在 MSAF 中的对应关系:

| 方案 C 概念 | MSAF 实现 | 说明 |
|------------|-----------|------|
| 微内核 | `WorkflowBuilder` | 只负责连图,不含业务 |
| 编排引擎 | `InProcessExecution` | 驱动图执行 |
| 独立 Agent 插件 | `ChatClientAgent` 实例 | Instructions 决定能力 |
| 能力边界 | Instructions | 一个 Agent 一个能力 |
| 工作流协调 | Workflow + Edge | FanOut/FanIn/条件 |
| 插件注册 | DI 容器 + WorkflowBuilder | ABP 模块化天然支持 |

### 10.2 完整架构图

```
┌─────────────────────────────────────────────────────────────┐
│  Host (Yi.Abp.Web + ABP Module)                             │
│   └─ AgentFrameworkAppService.RunXxxAsync()  ← HTTP 入口     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  WorkflowBuilder (编排引擎 = 微内核)                          │
│                                                              │
│   ┌──────────┐  FanOut   ┌──────────────────┐               │
│   │ Dispatch ├──────────►│ Agent: 合同生成   │ ─┐            │
│   │ Executor │ ├────────►│ Agent: 合规审查   │  ├─FanIn─►聚合│
│   │          │ └────────►│ Agent: 文档搜索   │ ─┘            │
│   └──────────┘           └──────────────────┘               │
│                                                              │
│   每个 Agent = 独立插件(Instructions + Tools + ChatClient)   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  LLM Provider │  (DeepSeek/OpenAI/Ollama)
                    └───────────────┘
```

### 10.3 "插件"在 MSAF 中的真实形态

**关键认知**:MSAF 中"Agent 插件"不是物理隔离的 DLL,而是一个**对象实例**:

```csharp
// 这就是一个"插件"
ChatClientAgent contractAgent = chatClient.CreateAIAgent(
    instructions: "你是合同生成助手,根据用户需求生成合同文本...",
    name: "contract_generator",
    tools: [queryTemplateTool, saveContractTool]
);
```

"插件化"体现在:
- **能力隔离**:每个 Agent 有独立 Instructions,只负责一个能力
- **可替换**:换 LLM 只换 ChatClient,Agent 代码不变
- **可组合**:多个 Agent 在 Workflow 中协作
- **可热插拔**:通过 DI 容器注册,运行时切换实现

> ⚠️ 如果需要**进程级物理隔离**(防止插件崩溃拖垮宿主),那需要用老的 MAF(`System.AddIn` 七层管道)+ AppDomain 隔离。本方案 C 不追求物理隔离,聚焦"逻辑解耦 + 工作流编排"。

### 10.4 与 ABP 集成要点

| 集成点 | 做法 | 本模块示例 |
|--------|------|-----------|
| 模块注册 | `[DependsOn(typeof(YiFrameworkApplicationModule))]` | [YiAbpApplicationModule.cs](file:///c:/Users/30359/Desktop/Code_Practice/MAF/Yi.Abp.Admin/Yi.Abp.Net8/src/Yi.Abp.Application/YiAbpApplicationModule.cs) |
| 配置注入 | `Configure<AgentFrameworkLlmOptions>(...)` | [YiFrameworkApplicationModule.cs](file:///c:/Users/30359/Desktop/Code_Practice/MAF/Yi.Abp.Admin/Yi.Abp.Net8/module/agent-framework/Yi.Framework.Application/YiFrameworkApplicationModule.cs) |
| 服务注册 | `services.AddScoped<XxxRunner>()` | 同上 |
| API 暴露 | 继承 `ApplicationService` + `IXxxAppService` | [AgentFrameworkAppService.cs](file:///c:/Users/30359/Desktop/Code_Practice/MAF/Yi.Abp.Admin/Yi.Abp.Net8/module/agent-framework/Yi.Framework.Application/Services/AgentFrameworkAppService.cs) |
| 日志 | ABP 的 `ILogger<T>` 自动注入 | Runner 中可直接用 |
| 工作单元 | AppService 自动开启 UoW | 数据库操作自动事务 |

---

## 11. 学习路径(分阶段)

本模块按 4 个阶段推进,每阶段都有可运行的代码:

### 阶段一:理论奠基(已完成)

- 理解 MSAF 定位与生态
- 掌握 5 个核心抽象
- 弄清与老 MAF(`System.AddIn`)的区别

### 阶段二:单 Agent 与顺序 Workflow

| 步骤 | 目标 | 代码位置 | 状态 |
|------|------|----------|------|
| 2.1 | 模块骨架(DDD 分层) | module/agent-framework/ | ✅ 已完成 |
| 2.2 | Hello World 单 Agent | [HelloWorldRunner.cs](file:///c:/Users/30359/Desktop/Code_Practice/MAF/Yi.Abp.Admin/Yi.Abp.Net8/module/agent-framework/Yi.Framework.Application/Runners/HelloWorldRunner.cs) | ✅ 已完成 |
| 2.3 | 顺序 Workflow | [SequentialWorkflowRunner.cs](file:///c:/Users/30359/Desktop/Code_Practice/MAF/Yi.Abp.Admin/Yi.Abp.Net8/module/agent-framework/Yi.Framework.Application/Runners/SequentialWorkflowRunner.cs) | ⏳ 待实现 |
| 2.4 | AgentThread 多轮记忆 | (规划中) | ⏳ 待实现 |
| 2.5 | 工具调用 AIFunction | (规划中) | ⏳ 待实现 |

### 阶段三:多 Agent 并行编排

| 步骤 | 目标 | 代码位置 | 状态 |
|------|------|----------|------|
| 3.1 | Fan-Out / Fan-In | [ParallelWorkflowRunner.cs](file:///c:/Users/30359/Desktop/Code_Practice/MAF/Yi.Abp.Admin/Yi.Abp.Net8/module/agent-framework/Yi.Framework.Application/Runners/ParallelWorkflowRunner.cs) | ⏳ 待实现 |
| 3.2 | 条件分支路由 | (规划中) | ⏳ 待实现 |
| 3.3 | 自定义 Executor 进阶 | (规划中) | ⏳ 待实现 |

### 阶段四:方案 C 完整实现

| 步骤 | 目标 | 状态 |
|------|------|------|
| 4.1 | 3 个能力 Agent + 编排 Workflow | ⏳ 待实现 |
| 4.2 | 与 ABP 深度集成(DI / UoW / 日志) | ⏳ 待实现 |
| 4.3 | 流式输出 + SignalR 集成 | ⏳ 待实现 |
| 4.4 | AgentThread 持久化(可选) | ⏳ 待实现 |

---

## 12. API 速查表

### 12.1 创建与调用

```csharp
// 创建 Agent
ChatClientAgent agent = chatClient.CreateAIAgent(instructions, name);
ChatClientAgent agent = chatClient.CreateAIAgent(instructions, name, tools);

// 同步调用
AgentRunResponse response = await agent.RunAsync(userInput);
string text = response.ToString();

// 流式调用
await foreach (var chunk in agent.RunStreamingAsync(userInput))
    Console.Write(chunk);

// 带对话记忆
AgentThread thread = agent.GetNewThread();
await agent.RunAsync("第一轮", thread);
await agent.RunAsync("第二轮", thread);
```

### 12.2 LLM 客户端

```csharp
// OpenAI 兼容(DeepSeek/Ollama 等)
var client = new OpenAIClient(
    new ApiKeyCredential(apiKey),
    new OpenAIClientOptions { Endpoint = new Uri(endpoint) }
);
ChatClient chatClient = client.GetChatClient(modelId);
```

### 12.3 工具

```csharp
AIFunction tool = AIFunctionFactory.Create(MyMethodAsync, "tool_name", "描述");

ChatClientAgent agent = chatClient.CreateAIAgent(
    instructions, name, tools: [tool]
);
```

### 12.4 Workflow

```csharp
var builder = new WorkflowBuilder();

var node1 = builder.AddExecutor(new MyExecutor(), "n1");
var node2 = builder.AddAgent(myAgent, "n2");
var node3 = builder.AddExecutor(new MyExecutor(), "n3");

builder.AddEdge(node1, node2);                          // 顺序
builder.AddFanOutEdge(node1, [node2, node3]);           // 扇出
builder.AddFanInEdge(node3, [node1, node2]);            // 扇入
builder.AddConditionalEdge(node1, input => "target");   // 条件
builder.WithOutputFrom(node3);

var workflow = builder.Build();
var result = await workflow.RunAsync(input);
```

---

## 13. 常见问题与排错

### Q1: `error CS0246: 未能找到类型或命名空间名"ApiKeyCredential"`

**原因**:缺少 `using System.ClientModel;`

**解决**:
```csharp
using System.ClientModel;
```

### Q2: `error CS1503: 无法从"string"转换为"ApiKeyCredential"`

**原因**:`OpenAIClient` 构造函数不接受裸 string

**解决**:用 `new ApiKeyCredential(apiKey)` 包装

### Q3: `error CS0029: 无法将"AgentRunResponse"隐式转换为"string"`

**原因**:`RunAsync` 返回 `AgentRunResponse`,不是 string

**解决**:
```csharp
AgentRunResponse response = await agent.RunAsync(input);
string text = response.ToString();  // 或 response.Output
```

### Q4: `error CS1061: "ChatClient"未包含"AsIChatClient"`

**原因**:这是旧 API 写法,新版 MSAF 不需要

**解决**:直接用 `ChatClient` 类型,`CreateAIAgent` 是 `ChatClient` 的扩展方法

### Q5: HTTP 402 错误

**原因**:DeepSeek 账户余额不足

**解决**:到 [platform.deepseek.com](https://platform.deepseek.com) 充值

### Q6: HTTP 401 错误

**原因**:ApiKey 错误或未配置

**解决**:检查 appsettings.json 中 `AgentFramework:Llm:ApiKey`

### Q7: 调用很慢(>30 秒)

**可能原因**:
- 网络问题(国内访问 OpenAI 官方慢,建议用 DeepSeek)
- 模型选错(如选了 `deepseek-reasoner` 思考模式,会慢)
- Instructions 过长

### Q8: 包版本冲突

**原则**:**只引用** `Microsoft.Agents.AI.OpenAI` 一个包,不要单独引用 `OpenAI`、`Microsoft.Extensions.AI` 等,避免版本冲突。

### Q9: 编译报"文件被锁定"

**原因**:后端进程仍在运行,锁定了 bin 目录的 DLL

**解决**:
```powershell
# 找到并停止 dotnet 进程
Get-Process dotnet -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## 14. 延伸阅读

### 14.1 官方资源

- [Microsoft Agent Framework 官方介绍](https://devblogs.microsoft.com/dotnet/introducing-microsoft-agent-framework/)
- [MSAF 与 DeepSeek 对接实战](https://cloud.tencent.com/developer/article/2609906)
- [.NET + AI | Agent | 从 ChatClient 到 AIAgent](https://m.sohu.com/a/954622138_121124363/)

### 14.2 相关技术

- **Microsoft.Extensions.AI** — IChatClient 抽象层,理解它有助于理解 MSAF 的 Provider 切换机制
- **Semantic Kernel** — 微软另一个 AI 框架,功能更广但更重,可与 MSAF 对比学习
- **System.AddIn (老 MAF)** — .NET Framework 插件隔离框架,如需进程级物理隔离可研究

### 14.3 学习建议

1. **先跑通再深究**:先让 Hello World 跑起来,再回头看每个 API 的设计意图
2. **动手改 Instructions**:改 `greeter` 的 Instructions,观察 Agent 行为变化
3. **换 LLM 试试**:把 DeepSeek 配置改成 Ollama 本地,体验 Provider 切换的零成本
4. **画 Workflow 图**:每实现一个 Workflow,先画图再写代码,有助于理解数据流
5. **对比方案 C**:每完成一个阶段,对照第 10 节的架构图,看自己处在哪个位置

---

## 附录:本模块文件结构

```
module/agent-framework/
├── LEARNING.md                          ← 本文档
├── Yi.Framework.Domain.Shared/          ← 共享层(Options/常量)
│   ├── Options/
│   │   └── AgentFrameworkLlmOptions.cs  ← LLM 配置选项
│   └── YiFrameworkDomainSharedModule.cs
├── Yi.Framework.Application.Contracts/  ← 契约层(接口/DTO)
│   ├── Dtos/
│   │   └── AgentTextDtos.cs
│   ├── IServices/
│   │   └── IAgentFrameworkAppService.cs
│   └── YiFrameworkApplicationContractsModule.cs
└── Yi.Framework.Application/            ← 应用层(Agent/Workflow/AppService)
    ├── Infrastructure/
    │   └── ChatClientFactory.cs         ← LLM 客户端工厂
    ├── Runners/
    │   ├── HelloWorldRunner.cs          ← 阶段2:单 Agent
    │   ├── SequentialWorkflowRunner.cs  ← 阶段2:顺序 Workflow(待实现)
    │   └── ParallelWorkflowRunner.cs    ← 阶段3:并行 Workflow(待实现)
    ├── Services/
    │   └── AgentFrameworkAppService.cs  ← ABP 入口服务
    └── YiFrameworkApplicationModule.cs  ← 模块定义
```

---

**文档版本**:v1.0
**对应代码**:module/agent-framework/
**学习进度**:阶段二(上)已完成,继续推进中
