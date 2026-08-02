namespace Yi.Framework.Application.Contracts.Dtos;

/// <summary>
/// 通用文本输入
/// </summary>
public class AgentTextInputDto
{
    public string Input { get; set; } = string.Empty;
}

/// <summary>
/// 通用文本输出
/// </summary>
public class AgentTextOutputDto
{
    public string Output { get; set; } = string.Empty;

    /// <summary>执行耗时(毫秒)</summary>
    public long ElapsedMs { get; set; }

    /// <summary>执行路径标识(用于追踪经过的 Agent)</summary>
    public string? Trace { get; set; }
}
