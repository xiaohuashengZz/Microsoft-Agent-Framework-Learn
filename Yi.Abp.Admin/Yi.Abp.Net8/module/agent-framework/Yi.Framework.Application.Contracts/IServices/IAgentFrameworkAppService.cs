using Yi.Framework.Application.Contracts.Dtos;

namespace Yi.Framework.Application.Contracts.IServices;

/// <summary>
/// Agent 学习入口服务接口
/// 通过 ABP 自动 API 控制器机制暴露为 /api/app/agent-framework-app/*
/// </summary>
public interface IAgentFrameworkAppService
{
    /// <summary>第二阶段:单 Agent Hello World</summary>
    Task<AgentTextOutputDto> HelloWorldAsync(AgentTextInputDto input);

    /// <summary>第二阶段:顺序 Workflow 最小闭环</summary>
    Task<AgentTextOutputDto> SequentialWorkflowAsync(AgentTextInputDto input);

    /// <summary>第三阶段:并行 Fan-Out/Fan-In</summary>
    Task<AgentTextOutputDto> ParallelWorkflowAsync(AgentTextInputDto input);
}
