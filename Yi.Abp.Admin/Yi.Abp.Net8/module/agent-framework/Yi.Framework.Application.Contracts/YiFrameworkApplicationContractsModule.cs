using Volo.Abp.Modularity;
using Yi.Framework.Domain.Shared;

namespace Yi.Framework.Application.Contracts;

/// <summary>
/// Agent 学习模块 - 应用契约层
/// 负责:对外服务接口定义、输入输出 DTO
/// </summary>
[DependsOn(typeof(YiFrameworkDomainSharedModule))]
public class YiFrameworkApplicationContractsModule : AbpModule
{
}
