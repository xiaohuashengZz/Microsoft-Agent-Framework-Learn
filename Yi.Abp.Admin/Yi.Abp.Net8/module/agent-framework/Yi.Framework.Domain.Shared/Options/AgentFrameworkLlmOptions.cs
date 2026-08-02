namespace Yi.Framework.Domain.Shared.Options;

/// <summary>
/// LLM 服务配置选项
/// 通过 appsettings.json 中的 "AgentFramework:Llm" 节点配置
/// 默认对接 DeepSeek(OpenAI 兼容协议),也可切换到 OpenAI/Azure/通义等
/// </summary>
public class AgentFrameworkLlmOptions
{
    /// <summary>OpenAI 兼容 API 端点(DeepSeek: https://api.deepseek.com/v1)</summary>
    public string Endpoint { get; set; } = "https://api.deepseek.com/v1";

    /// <summary>API Key</summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>模型名称(DeepSeek: deepseek-chat)</summary>
    public string ModelId { get; set; } = "deepseek-chat";
}
