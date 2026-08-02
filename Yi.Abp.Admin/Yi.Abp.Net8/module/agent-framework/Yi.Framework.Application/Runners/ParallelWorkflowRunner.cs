using Yi.Framework.Application.Contracts.Dtos;

namespace Yi.Framework.Application.Runners;

/// <summary>
/// 第三阶段 Runner:并行 Workflow(Fan-Out / Fan-In)
/// 待第三阶段实现
/// </summary>
public class ParallelWorkflowRunner
{
    public Task<AgentTextOutputDto> RunAsync(string userInput)
    {
        return Task.FromResult(new AgentTextOutputDto
        {
            Output = "[ParallelWorkflowRunner] 尚未实现,将在第三阶段完成",
            Trace = "TODO"
        });
    }
}
