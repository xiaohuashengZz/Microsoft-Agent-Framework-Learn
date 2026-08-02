using Volo.Abp.Domain;
using Volo.Abp.Modularity;

namespace Yi.Framework.Domain.Shared;

/// <summary>
/// Agent 学习模块 - 共享层
/// 负责:Options 配置、常量、枚举、共享 DTO
/// </summary>
[DependsOn(typeof(AbpDddDomainSharedModule))]
public class YiFrameworkDomainSharedModule : AbpModule
{
    public override Task ConfigureServicesAsync(ServiceConfigurationContext context)
    {
        // 预留:后续在此配置 LLM 选项的默认值
        return Task.CompletedTask;
    }
}
