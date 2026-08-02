using System.Diagnostics;
using Microsoft.Agents.AI;
using Microsoft.Agents.AI.OpenAI;
using OpenAI.Chat;
using Yi.Framework.Application.Contracts.Dtos;
using Yi.Framework.Application.Infrastructure;

namespace Yi.Framework.Application.Runners;

/// <summary>
/// 第二阶段 Runner 1:单 Agent Hello World
///
/// 学习目标:
///   1. 理解 AIAgent = 指令(Instructions) + ChatClient + 名称
///   2. 掌握 CreateAIAgent 扩展方法 + RunAsync 最简调用
///   3. 弄清 "Agent 插件" 在 MSAF 中的真实形态:就是一个对象实例
///
/// 这一步对应方案 C 中的 "1 个能力 = 1 个 Agent 插件" 的最小单元
/// </summary>
public class HelloWorldRunner
{
    private readonly ChatClientFactory _chatClientFactory;

    public HelloWorldRunner(ChatClientFactory chatClientFactory)
    {
        _chatClientFactory = chatClientFactory;
    }

    public async Task<AgentTextOutputDto> RunAsync(string userInput)
    {
        var sw = Stopwatch.StartNew();

        // 1. 获取已绑定模型名的 ChatClient(MSAF 与 LLM 通信的抽象层)
        ChatClient chatClient = _chatClientFactory.Create();

        // 2. 创建 Agent —— 这是方案 C 中 "一个独立能力插件" 的原型
        //    Instructions 决定 Agent 的能力边界与行为风格
        //    Name 用于在 Workflow 中标识节点(后续阶段会用到)
        //    CreateAIAgent 是 MSAF 提供的 ChatClient 扩展方法
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

        // 3. 调用 Agent —— RunAsync 是最简同步调用,直接传字符串
        //    返回 AgentRunResponse,其 ToString() 返回 LLM 的文本输出
        //    MSAF 也支持 RunStreamingAsync 流式输出
        //    多轮记忆需配合 AgentThread(后续阶段讲解)
        AgentRunResponse response = await greeter.RunAsync(userInput);

        sw.Stop();

        return new AgentTextOutputDto
        {
            Output = response.ToString(),
            ElapsedMs = sw.ElapsedMilliseconds,
            Trace = "HelloWorldRunner → greeter(Agent) → 输出"
        };
    }
}
