using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.AutoMapper;
using Volo.Abp.Modularity;
using Yi.Framework.Application.Contracts;
using Yi.Framework.Application.Runners;
using Yi.Framework.Domain.Shared;
using Yi.Framework.Domain.Shared.Options;

namespace Yi.Framework.Application;

/// <summary>
/// Agent 学习模块 - 应用层
/// 负责:Agent 实现、Workflow 编排、AppService 入口
/// </summary>
[DependsOn(
    typeof(YiFrameworkApplicationContractsModule),
    typeof(AbpAutoMapperModule)
)]
public class YiFrameworkApplicationModule : AbpModule
{
    public override Task ConfigureServicesAsync(ServiceConfigurationContext context)
    {
        // 绑定 LLM 配置到 AgentFrameworkLlmOptions
        Configure<AgentFrameworkLlmOptions>(context.Services.GetConfiguration().GetSection("AgentFramework:Llm"));

        // 注册 Runner 为 Scoped(便于后续注入 AppService / UnitOfWork)
        context.Services.AddScoped<HelloWorldRunner>();
        context.Services.AddScoped<SequentialWorkflowRunner>();
        context.Services.AddScoped<ParallelWorkflowRunner>();
        return Task.CompletedTask;
    }
}
