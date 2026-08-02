using Volo.Abp.Application.Services;
using Yi.Framework.Application.Contracts.Dtos;
using Yi.Framework.Application.Contracts.IServices;
using Yi.Framework.Application.Runners;

namespace Yi.Framework.Application.Services;

/// <summary>
/// Agent 学习入口 AppService
/// ABP 自动 API 机制会暴露为:
///   POST /api/app/agent-framework-app/hello-world
///   POST /api/app/agent-framework-app/sequential-workflow
///   POST /api/app/agent-framework-app/parallel-workflow
/// </summary>
public class AgentFrameworkAppService : ApplicationService, IAgentFrameworkAppService
{
    private readonly HelloWorldRunner _helloWorldRunner;
    private readonly SequentialWorkflowRunner _sequentialWorkflowRunner;
    private readonly ParallelWorkflowRunner _parallelWorkflowRunner;

    public AgentFrameworkAppService(
        HelloWorldRunner helloWorldRunner,
        SequentialWorkflowRunner sequentialWorkflowRunner,
        ParallelWorkflowRunner parallelWorkflowRunner)
    {
        _helloWorldRunner = helloWorldRunner;
        _sequentialWorkflowRunner = sequentialWorkflowRunner;
        _parallelWorkflowRunner = parallelWorkflowRunner;
    }

    public async Task<AgentTextOutputDto> HelloWorldAsync(AgentTextInputDto input)
    {
        return await _helloWorldRunner.RunAsync(input.Input);
    }

    public async Task<AgentTextOutputDto> SequentialWorkflowAsync(AgentTextInputDto input)
    {
        return await _sequentialWorkflowRunner.RunAsync(input.Input);
    }

    public async Task<AgentTextOutputDto> ParallelWorkflowAsync(AgentTextInputDto input)
    {
        return await _parallelWorkflowRunner.RunAsync(input.Input);
    }
}
