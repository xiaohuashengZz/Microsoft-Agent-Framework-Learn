using Yi.Framework.Application.Contracts.Dtos;

namespace Yi.Framework.Application.Runners;

/// <summary>
/// 第二阶段 Runner 2:顺序 Workflow 最小闭环
///
/// 学习目标:
///   1. 理解 Workflow = 有向图(DAG)
///   2. 掌握 Executor(自定义节点)与 Agent(LLM 节点)的区别
///   3. 用 AddEdge 连接 Executor → Agent → Executor
///
/// 待第二阶段后半部分实现
/// </summary>
public class SequentialWorkflowRunner
{
    public Task<AgentTextOutputDto> RunAsync(string userInput)
    {
        return Task.FromResult(new AgentTextOutputDto
        {
            Output = "[SequentialWorkflowRunner] 尚未实现,将在第二阶段后半部分完成",
            Trace = "TODO"
        });
    }
}
