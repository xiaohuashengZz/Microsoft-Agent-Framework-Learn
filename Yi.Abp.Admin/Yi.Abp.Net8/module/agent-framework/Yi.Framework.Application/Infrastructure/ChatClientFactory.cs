using Microsoft.Extensions.Options;
using OpenAI;
using OpenAI.Chat;
using System.ClientModel;
using Yi.Framework.Domain.Shared.Options;

namespace Yi.Framework.Application.Infrastructure;

/// <summary>
/// ChatClient 工厂:统一的 LLM 客户端构造入口
/// 学习要点:MSAF 通过 OpenAI 兼容协议对接任意 LLM
/// </summary>
public class ChatClientFactory
{
    private readonly AgentFrameworkLlmOptions _options;

    public ChatClientFactory(IOptions<AgentFrameworkLlmOptions> options)
    {
        _options = options.Value;
    }

    /// <summary>
    /// 创建已绑定模型名的 ChatClient
    /// 同一客户端可被复用,底层管理 HTTP 连接池
    /// </summary>
    public ChatClient Create()
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            throw new InvalidOperationException(
                "未配置 AgentFramework:Llm:ApiKey,请在 appsettings.json 中填入 DeepSeek/OpenAI 的 API Key");
        }

        // OpenAI 官方客户端,通过 Endpoint 可对接任意 OpenAI 兼容服务
        // (DeepSeek / 通义千问 / Ollama / 本地 vLLM 等)
        // ApiKeyCredential 来自 System.ClientModel 包(OpenAI 包的依赖)
        var openAiOptions = new OpenAIClientOptions
        {
            Endpoint = new Uri(_options.Endpoint)
        };
        var openAiClient = new OpenAIClient(new ApiKeyCredential(_options.ApiKey), openAiOptions);

        // 绑定配置中指定的模型(如 deepseek-chat / gpt-4o 等)
        return openAiClient.GetChatClient(_options.ModelId);
    }
}
