import { useState, useEffect, useRef } from 'react'
import { Send, Settings2, Sparkles, ChevronDown, ChevronUp, Brain, Loader2, Code, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { chatApi, type ChatMessage } from '@/api/chat'
import { modelApi } from '@/api/model'
import { tokenApi } from '@/api/token'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface PlaygroundConfig {
    model: string
    maxTokens: number
    temperature: number
    topP: number
    minP: number
    topK: number
    presencePenalty: number
    frequencyPenalty: number
    repetitionPenalty: number
}

// CodeBlock component
const CodeBlock = ({ code, language = 'bash' }: { code: string; language?: string }) => {
    const customizedStyle = {
        ...atomDark,
        'pre[class*="language-"]': {
            ...atomDark['pre[class*="language-"]'],
            backgroundColor: 'transparent',
            margin: 0,
            padding: 0
        }
    }

    return (
        <div className="overflow-x-auto" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                div::-webkit-scrollbar { width: 0; height: 0; }
                div pre::-webkit-scrollbar { width: 0; height: 0; }
                div code::-webkit-scrollbar { width: 0; height: 0; }
            `}} />
            <SyntaxHighlighter
                language={language}
                style={customizedStyle}
                customStyle={{
                    fontSize: '12px',
                    overflowX: 'auto',
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none'
                }}
                codeTagProps={{ style: { color: 'white' } }}
                wrapLines={false}
                lineProps={{ style: { whiteSpace: 'pre' } }}>
                {code}
            </SyntaxHighlighter>
        </div>
    )
}

export default function PlaygroundPage() {
    const [models, setModels] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState('')
    const [apiKey, setApiKey] = useState<string>('')
    const [enableThinking, setEnableThinking] = useState(false)
    const [expandedThinking, setExpandedThinking] = useState<Set<number>>(new Set())
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const [config, setConfig] = useState<PlaygroundConfig>({
        model: '',
        maxTokens: 2048,
        temperature: 1.0,
        topP: 1.0,
        minP: 0.0,
        topK: 50,
        presencePenalty: 0.0,
        frequencyPenalty: 0.0,
        repetitionPenalty: 1.0,
    })

    useEffect(() => {
        loadModels()
        loadApiKey()
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const loadModels = async () => {
        try {
            const modelConfigs = await modelApi.getModels()
            const modelNames = modelConfigs.map(m => m.model)
            setModels(modelNames)
            if (modelNames.length > 0 && !config.model) {
                setConfig(prev => ({ ...prev, model: modelNames[0] }))
            }
        } catch (error) {
            toast.error('Failed to load models')
            console.error('Failed to load models:', error)
        }
    }

    const loadApiKey = async () => {
        try {
            const response = await tokenApi.getTokens(1, 1)
            if (response.tokens && response.tokens.length > 0) {
                setApiKey(response.tokens[0].key)
            } else {
                toast.error('No API key found. Please create an API key first.')
            }
        } catch (error) {
            toast.error('Failed to load API key')
            console.error('Failed to load API key:', error)
        }
    }

    const handleSend = async () => {
        if (!input.trim() || !config.model || loading || !apiKey) return

        const userMessage: ChatMessage = {
            role: 'user',
            content: input.trim()
        }

        const newMessages = [...messages, userMessage]
        setMessages(newMessages)
        setInput('')
        setLoading(true)

        const messagesToSend: ChatMessage[] = newMessages

        try {
            // Always use streaming mode
            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: ''
            }
            setMessages([...newMessages, assistantMessage])

            await chatApi.createCompletionStream(
                {
                    model: config.model,
                    messages: messagesToSend,
                    max_tokens: config.maxTokens,
                    temperature: config.temperature,
                    top_p: config.topP,
                    top_k: config.topK,
                    presence_penalty: config.presencePenalty,
                    frequency_penalty: config.frequencyPenalty,
                    repetition_penalty: config.repetitionPenalty,
                    ...(enableThinking && { reasoning_effort: 'medium' }),
                },
                (chunk, reasoningChunk) => {
                    console.log('[Playground] onChunk called - content:', chunk, 'reasoning:', reasoningChunk)
                    setMessages(prev => {
                        const updated = [...prev]
                        const lastIndex = updated.length - 1
                        if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
                            const currentMsg = updated[lastIndex]
                            const hasReasoningContent = !!currentMsg.reasoning_content || !!reasoningChunk
                            const willHaveContent = !!currentMsg.content || !!chunk

                            // Auto-expand during thinking, auto-collapse when content starts
                            if (hasReasoningContent && !currentMsg.content && chunk) {
                                // First content chunk arrived, collapse thinking
                                setExpandedThinking(prev => {
                                    const newSet = new Set(prev)
                                    newSet.delete(lastIndex)
                                    return newSet
                                })
                            } else if (reasoningChunk && !willHaveContent) {
                                // Still thinking, ensure expanded
                                setExpandedThinking(prev => {
                                    const newSet = new Set(prev)
                                    newSet.add(lastIndex)
                                    return newSet
                                })
                            }

                            // Create a new object instead of mutating
                            updated[lastIndex] = {
                                ...updated[lastIndex],
                                content: updated[lastIndex].content + chunk,
                                reasoning_content: reasoningChunk
                                    ? (updated[lastIndex].reasoning_content || '') + reasoningChunk
                                    : updated[lastIndex].reasoning_content
                            }
                        }
                        return updated
                    })
                },
                () => {
                    setLoading(false)
                },
                (error) => {
                    console.error('Streaming error:', error)
                    toast.error('Failed to get response')
                    setLoading(false)
                },
                apiKey
            )
        } catch (error) {
            console.error('Chat error:', error)
            toast.error('Failed to get response')
            setLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const clearHistory = () => {
        setMessages([])
        setExpandedThinking(new Set())
        toast.success('Chat history cleared')
    }

    const toggleThinking = (index: number) => {
        setExpandedThinking(prev => {
            const newSet = new Set(prev)
            if (newSet.has(index)) {
                newSet.delete(index)
            } else {
                newSet.add(index)
            }
            return newSet
        })
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success('Copied to clipboard')
    }

    const generateCurlCode = () => {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
        const url = apiBaseUrl ? `${new URL(apiBaseUrl).origin}/v1/chat/completions` : '/v1/chat/completions'

        return `curl "${url}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -d @- << 'EOF'
{
    "model": "${config.model}",
    "messages": [
        {
            "role": "user",
            "content": "Hi there!"
        }
    ],
    "response_format": { "type": "text" },
    "max_tokens": ${config.maxTokens},
    "temperature": ${config.temperature},
    "top_p": ${config.topP},
    "min_p": ${config.minP},
    "top_k": ${config.topK},
    "presence_penalty": ${config.presencePenalty},
    "frequency_penalty": ${config.frequencyPenalty},
    "repetition_penalty": ${config.repetitionPenalty}
}
EOF`
    }

    const generatePythonCode = () => {
        return `from openai import OpenAI

client = OpenAI(
    api_key="<YOUR_API_KEY>",
    base_url="${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}"
)

response = client.chat.completions.create(
    model="${config.model}",
    messages=[
        {"role": "user", "content": "Hi there!"}
    ],
    max_tokens=${config.maxTokens},
    temperature=${config.temperature},
    top_p=${config.topP},
    presence_penalty=${config.presencePenalty},
    frequency_penalty=${config.frequencyPenalty}
)

print(response.choices[0].message.content)`
    }

    const generateJavaScriptCode = () => {
        return `import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '<YOUR_API_KEY>',
  baseURL: '${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}'
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: '${config.model}',
    messages: [
      { role: 'user', content: 'Hi there!' }
    ],
    max_tokens: ${config.maxTokens},
    temperature: ${config.temperature},
    top_p: ${config.topP},
    presence_penalty: ${config.presencePenalty},
    frequency_penalty: ${config.frequencyPenalty}
  });

  console.log(completion.choices[0].message.content);
}

main();`
    }

    return (
        <div className="h-full flex bg-background">
            {/* Left Panel - Model Configuration */}
            <div className="w-80 border-r border-border bg-card p-6 overflow-y-auto">
                <div className="flex items-center gap-2 mb-6">
                    <Settings2 className="w-5 h-5" />
                    <h2 className="text-lg font-semibold">Model Configuration</h2>
                </div>

                <div className="space-y-5">

                    {/* Max Tokens */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <Label className="text-sm font-medium">max_tokens</Label>
                            <span className="text-sm text-muted-foreground font-mono">{config.maxTokens}</span>
                        </div>
                        <Slider
                            value={[config.maxTokens]}
                            onValueChange={([value]: number[]) => setConfig({ ...config, maxTokens: value })}
                            min={1}
                            max={131072}
                            step={1}
                        />
                    </div>

                    {/* Temperature */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <Label className="text-sm font-medium">temperature</Label>
                            <span className="text-sm text-muted-foreground font-mono">{config.temperature.toFixed(2)}</span>
                        </div>
                        <Slider
                            value={[config.temperature]}
                            onValueChange={([value]: number[]) => setConfig({ ...config, temperature: value })}
                            min={0}
                            max={2}
                            step={0.01}
                        />
                    </div>

                    {/* Top P */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <Label className="text-sm font-medium">top_p</Label>
                            <span className="text-sm text-muted-foreground font-mono">{config.topP.toFixed(2)}</span>
                        </div>
                        <Slider
                            value={[config.topP]}
                            onValueChange={([value]: number[]) => setConfig({ ...config, topP: value })}
                            min={0}
                            max={1}
                            step={0.01}
                        />
                    </div>

                    {/* Top K */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <Label className="text-sm font-medium">top_k</Label>
                            <span className="text-sm text-muted-foreground font-mono">{config.topK}</span>
                        </div>
                        <Slider
                            value={[config.topK]}
                            onValueChange={([value]: number[]) => setConfig({ ...config, topK: value })}
                            min={0}
                            max={100}
                            step={1}
                        />
                    </div>

                    {/* Presence Penalty */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <Label className="text-sm font-medium">presence_penalty</Label>
                            <span className="text-sm text-muted-foreground font-mono">{config.presencePenalty.toFixed(2)}</span>
                        </div>
                        <Slider
                            value={[config.presencePenalty]}
                            onValueChange={([value]: number[]) => setConfig({ ...config, presencePenalty: value })}
                            min={-2}
                            max={2}
                            step={0.01}
                        />
                    </div>

                    {/* Frequency Penalty */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <Label className="text-sm font-medium">frequency_penalty</Label>
                            <span className="text-sm text-muted-foreground font-mono">{config.frequencyPenalty.toFixed(2)}</span>
                        </div>
                        <Slider
                            value={[config.frequencyPenalty]}
                            onValueChange={([value]: number[]) => setConfig({ ...config, frequencyPenalty: value })}
                            min={-2}
                            max={2}
                            step={0.01}
                        />
                    </div>

                    {/* Repetition Penalty */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <Label className="text-sm font-medium">repetition_penalty</Label>
                            <span className="text-sm text-muted-foreground font-mono">{config.repetitionPenalty.toFixed(2)}</span>
                        </div>
                        <Slider
                            value={[config.repetitionPenalty]}
                            onValueChange={([value]: number[]) => setConfig({ ...config, repetitionPenalty: value })}
                            min={0}
                            max={2}
                            step={0.01}
                        />
                    </div>
                </div>
            </div>

            {/* Right Panel - Chat Interface */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="border-b border-border bg-card px-6 py-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h1 className="text-xl font-semibold">Playground</h1>
                    </div>
                    {/* Model Selection Row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Label htmlFor="model-select" className="text-sm font-medium whitespace-nowrap">
                                Model:
                            </Label>
                            <Select value={config.model} onValueChange={(value) => setConfig({ ...config, model: value })}>
                                <SelectTrigger id="model-select" className="w-[300px]">
                                    <SelectValue placeholder="Select model" />
                                </SelectTrigger>
                                <SelectContent>
                                    {models.map((model) => (
                                        <SelectItem key={model} value={model}>
                                            {model}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => copyToClipboard(apiKey)}
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={clearHistory}>
                                Clear History
                            </Button>
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Code className="w-4 h-4 mr-2" />
                                        View Code
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="p-0 overflow-hidden w-[400px] max-w-md">
                                    <div className="flex flex-col gap-3 overflow-y-auto p-6 pb-3 h-full">
                                        {/* Method and Endpoint */}
                                        <div className="flex gap-2.5 items-center">
                                            <Badge className="flex px-2 py-0.5 justify-center items-center gap-0.5 rounded bg-blue-100 dark:bg-blue-900">
                                                <span className="text-blue-600 dark:text-blue-300 font-medium text-xs leading-4 tracking-wide">
                                                    POST
                                                </span>
                                            </Badge>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="2" height="18" viewBox="0 0 2 18" fill="none">
                                                <path d="M1 1L1 17" stroke="#F0F1F6" strokeLinecap="round" className="dark:stroke-zinc-700" />
                                            </svg>
                                            <div className="flex gap-1 items-center justify-start">
                                                {['/v1', 'chat', 'completions'].map((segment, index) => (
                                                    <div key={index} className="flex items-center gap-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="5" height="12" viewBox="0 0 5 12" fill="none">
                                                            <path d="M4.42017 1.30151L0.999965 10.6984" stroke="#C4CBD7" strokeLinecap="round" className="dark:stroke-zinc-600" />
                                                        </svg>
                                                        <span className="text-gray-600 dark:text-gray-400 font-medium text-xs leading-4 tracking-wide">
                                                            {segment}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Tabs for different languages */}
                                        <Tabs defaultValue="http" className="w-full">
                                            <TabsList className="grid w-full grid-cols-3">
                                                <TabsTrigger value="http">HTTP</TabsTrigger>
                                                <TabsTrigger value="python">Python</TabsTrigger>
                                                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="http" className="mt-4">
                                                <div className="flex flex-col items-start justify-center w-full rounded-md overflow-hidden">
                                                    <div className="flex w-full p-2.5 justify-between items-center bg-[#232833]">
                                                        <span className="text-white font-medium text-xs leading-4 tracking-wide">bash</span>
                                                        <Button
                                                            onClick={() => copyToClipboard(generateCurlCode())}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="inline-flex p-1 min-w-0 h-[22px] w-[22px] justify-center items-center rounded bg-transparent hover:bg-white/10">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                                <path fillRule="evenodd" clipRule="evenodd" d="M2.86483 2.30131C2.73937 2.30131 2.61904 2.35115 2.53032 2.43987C2.44161 2.52859 2.39176 2.64891 2.39176 2.77438V7.5282C2.39176 7.65366 2.44161 7.77399 2.53032 7.86271C2.61904 7.95142 2.73937 8.00127 2.86483 8.00127H3.39304C3.7152 8.00127 3.97637 8.26243 3.97637 8.5846C3.97637 8.90676 3.7152 9.16793 3.39304 9.16793H2.86483C2.42995 9.16793 2.01288 8.99517 1.70537 8.68766C1.39786 8.38015 1.2251 7.96308 1.2251 7.5282V2.77438C1.2251 2.3395 1.39786 1.92242 1.70537 1.61491C2.01288 1.3074 2.42995 1.13464 2.86483 1.13464H7.61865C8.05354 1.13464 8.47061 1.3074 8.77812 1.61491C9.08563 1.92242 9.25839 2.33949 9.25839 2.77438V3.30258C9.25839 3.62475 8.99722 3.88592 8.67505 3.88592C8.35289 3.88592 8.09172 3.62475 8.09172 3.30258V2.77438C8.09172 2.64891 8.04188 2.52859 7.95316 2.43987C7.86444 2.35115 7.74412 2.30131 7.61865 2.30131H2.86483ZM6.56225 5.99872C6.30098 5.99872 6.08918 6.21052 6.08918 6.47179V11.2256C6.08918 11.4869 6.30098 11.6987 6.56225 11.6987H11.3161C11.5773 11.6987 11.7891 11.4869 11.7891 11.2256V6.47179C11.7891 6.21052 11.5773 5.99872 11.3161 5.99872H6.56225ZM4.92251 6.47179C4.92251 5.56619 5.65664 4.83206 6.56225 4.83206H11.3161C12.2217 4.83206 12.9558 5.56619 12.9558 6.47179V11.2256C12.9558 12.1312 12.2217 12.8653 11.3161 12.8653H6.56225C5.65664 12.8653 4.92251 12.1312 4.92251 11.2256V6.47179Z" fill="white" fillOpacity="0.8" />
                                                            </svg>
                                                        </Button>
                                                    </div>
                                                    <div className="p-3 bg-[#14181E] w-full">
                                                        <CodeBlock code={generateCurlCode()} language="bash" />
                                                    </div>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="python" className="mt-4">
                                                <div className="flex flex-col items-start justify-center w-full rounded-md overflow-hidden">
                                                    <div className="flex w-full p-2.5 justify-between items-center bg-[#232833]">
                                                        <span className="text-white font-medium text-xs leading-4 tracking-wide">python</span>
                                                        <Button
                                                            onClick={() => copyToClipboard(generatePythonCode())}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="inline-flex p-1 min-w-0 h-[22px] w-[22px] justify-center items-center rounded bg-transparent hover:bg-white/10">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                                <path fillRule="evenodd" clipRule="evenodd" d="M2.86483 2.30131C2.73937 2.30131 2.61904 2.35115 2.53032 2.43987C2.44161 2.52859 2.39176 2.64891 2.39176 2.77438V7.5282C2.39176 7.65366 2.44161 7.77399 2.53032 7.86271C2.61904 7.95142 2.73937 8.00127 2.86483 8.00127H3.39304C3.7152 8.00127 3.97637 8.26243 3.97637 8.5846C3.97637 8.90676 3.7152 9.16793 3.39304 9.16793H2.86483C2.42995 9.16793 2.01288 8.99517 1.70537 8.68766C1.39786 8.38015 1.2251 7.96308 1.2251 7.5282V2.77438C1.2251 2.3395 1.39786 1.92242 1.70537 1.61491C2.01288 1.3074 2.42995 1.13464 2.86483 1.13464H7.61865C8.05354 1.13464 8.47061 1.3074 8.77812 1.61491C9.08563 1.92242 9.25839 2.33949 9.25839 2.77438V3.30258C9.25839 3.62475 8.99722 3.88592 8.67505 3.88592C8.35289 3.88592 8.09172 3.62475 8.09172 3.30258V2.77438C8.09172 2.64891 8.04188 2.52859 7.95316 2.43987C7.86444 2.35115 7.74412 2.30131 7.61865 2.30131H2.86483ZM6.56225 5.99872C6.30098 5.99872 6.08918 6.21052 6.08918 6.47179V11.2256C6.08918 11.4869 6.30098 11.6987 6.56225 11.6987H11.3161C11.5773 11.6987 11.7891 11.4869 11.7891 11.2256V6.47179C11.7891 6.21052 11.5773 5.99872 11.3161 5.99872H6.56225ZM4.92251 6.47179C4.92251 5.56619 5.65664 4.83206 6.56225 4.83206H11.3161C12.2217 4.83206 12.9558 5.56619 12.9558 6.47179V11.2256C12.9558 12.1312 12.2217 12.8653 11.3161 12.8653H6.56225C5.65664 12.8653 4.92251 12.1312 4.92251 11.2256V6.47179Z" fill="white" fillOpacity="0.8" />
                                                            </svg>
                                                        </Button>
                                                    </div>
                                                    <div className="p-3 bg-[#14181E] w-full">
                                                        <CodeBlock code={generatePythonCode()} language="python" />
                                                    </div>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="javascript" className="mt-4">
                                                <div className="flex flex-col items-start justify-center w-full rounded-md overflow-hidden">
                                                    <div className="flex w-full p-2.5 justify-between items-center bg-[#232833]">
                                                        <span className="text-white font-medium text-xs leading-4 tracking-wide">javascript</span>
                                                        <Button
                                                            onClick={() => copyToClipboard(generateJavaScriptCode())}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="inline-flex p-1 min-w-0 h-[22px] w-[22px] justify-center items-center rounded bg-transparent hover:bg-white/10">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                                <path fillRule="evenodd" clipRule="evenodd" d="M2.86483 2.30131C2.73937 2.30131 2.61904 2.35115 2.53032 2.43987C2.44161 2.52859 2.39176 2.64891 2.39176 2.77438V7.5282C2.39176 7.65366 2.44161 7.77399 2.53032 7.86271C2.61904 7.95142 2.73937 8.00127 2.86483 8.00127H3.39304C3.7152 8.00127 3.97637 8.26243 3.97637 8.5846C3.97637 8.90676 3.7152 9.16793 3.39304 9.16793H2.86483C2.42995 9.16793 2.01288 8.99517 1.70537 8.68766C1.39786 8.38015 1.2251 7.96308 1.2251 7.5282V2.77438C1.2251 2.3395 1.39786 1.92242 1.70537 1.61491C2.01288 1.3074 2.42995 1.13464 2.86483 1.13464H7.61865C8.05354 1.13464 8.47061 1.3074 8.77812 1.61491C9.08563 1.92242 9.25839 2.33949 9.25839 2.77438V3.30258C9.25839 3.62475 8.99722 3.88592 8.67505 3.88592C8.35289 3.88592 8.09172 3.62475 8.09172 3.30258V2.77438C8.09172 2.64891 8.04188 2.52859 7.95316 2.43987C7.86444 2.35115 7.74412 2.30131 7.61865 2.30131H2.86483ZM6.56225 5.99872C6.30098 5.99872 6.08918 6.21052 6.08918 6.47179V11.2256C6.08918 11.4869 6.30098 11.6987 6.56225 11.6987H11.3161C11.5773 11.6987 11.7891 11.4869 11.7891 11.2256V6.47179C11.7891 6.21052 11.5773 5.99872 11.3161 5.99872H6.56225ZM4.92251 6.47179C4.92251 5.56619 5.65664 4.83206 6.56225 4.83206H11.3161C12.2217 4.83206 12.9558 5.56619 12.9558 6.47179V11.2256C12.9558 12.1312 12.2217 12.8653 11.3161 12.8653H6.56225C5.65664 12.8653 4.92251 12.1312 4.92251 11.2256V6.47179Z" fill="white" fillOpacity="0.8" />
                                                            </svg>
                                                        </Button>
                                                    </div>
                                                    <div className="p-3 bg-[#14181E] w-full">
                                                        <CodeBlock code={generateJavaScriptCode()} language="javascript" />
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                {messages.length === 0 ? (
                    /* Empty state with centered input */
                    <div className="flex-1 flex items-center justify-center px-6">
                        <div className="w-full max-w-3xl">
                            <div className="text-center text-muted-foreground mb-8">
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <Sparkles className="w-12 h-12 opacity-50" />
                                </div>
                                <p className="text-lg font-medium">Start a conversation</p>
                                <p className="text-sm mt-2">Type a message below to begin</p>
                            </div>

                            {/* Centered Input with inline buttons */}
                            <div className="relative">
                                <Textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Say something..."
                                    className="resize-none min-h-[120px] w-full text-base pb-12 pr-14"
                                    disabled={loading || !config.model || !apiKey}
                                />
                                {/* Enable Thinking Button - bottom left inside input */}
                                <Button
                                    variant={enableThinking ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setEnableThinking(!enableThinking)}
                                    className="absolute bottom-2 left-2 h-8 text-xs"
                                >
                                    Enable Thinking
                                </Button>
                                {/* Send Button - bottom right inside input */}
                                <Button
                                    onClick={handleSend}
                                    disabled={loading || !input.trim() || !config.model || !apiKey}
                                    size="icon"
                                    className="absolute bottom-2 right-2 h-8 w-8"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Chat mode with messages and bottom input */
                    <>
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            <div className="space-y-4 max-w-4xl mx-auto">
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg px-4 py-3 ${
                                                message.role === 'user'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted'
                                            }`}
                                        >
                                            {message.role === 'assistant' ? (
                                                <div className="space-y-2">
                                                    {/* Thinking Section */}
                                                    {message.reasoning_content && (
                                                        <div className="border border-border rounded-md overflow-hidden bg-background/50">
                                                            <button
                                                                onClick={() => toggleThinking(index)}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                                                            >
                                                                <Brain className="w-4 h-4 text-muted-foreground" />
                                                                <span className="text-muted-foreground font-medium">
                                                                    {loading && index === messages.length - 1 && !message.content
                                                                        ? 'Thinking...'
                                                                        : 'Thought process'}
                                                                </span>
                                                                {loading && index === messages.length - 1 && !message.content ? (
                                                                    <div className="ml-auto flex gap-1">
                                                                        <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                                        <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                                        <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                                    </div>
                                                                ) : (
                                                                    expandedThinking.has(index) ? (
                                                                        <ChevronUp className="w-4 h-4 ml-auto text-muted-foreground" />
                                                                    ) : (
                                                                        <ChevronDown className="w-4 h-4 ml-auto text-muted-foreground" />
                                                                    )
                                                                )}
                                                            </button>
                                                            {expandedThinking.has(index) && (
                                                                <div className="px-3 py-2 border-t border-border">
                                                                    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                            {message.reasoning_content}
                                                                        </ReactMarkdown>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {/* Main Content */}
                                                    {message.content && (
                                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                {message.content}
                                                            </ReactMarkdown>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {/* Loading indicator when waiting for first response */}
                                {loading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && !messages[messages.length - 1].content && !messages[messages.length - 1].reasoning_content && (
                                    <div className="flex justify-start">
                                        <div className="max-w-[80%] rounded-lg px-4 py-3 bg-muted">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span className="text-sm">Waiting for response...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Bottom Input */}
                        <div className="border-t border-border bg-card px-6 py-4">
                            <div className="max-w-4xl mx-auto">
                                <div className="relative">
                                    <Textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        placeholder="Say something..."
                                        className="resize-none min-h-[80px] w-full pb-12 pr-14"
                                        disabled={loading || !config.model || !apiKey}
                                    />
                                    {/* Enable Thinking Button - bottom left inside input */}
                                    <Button
                                        variant={enableThinking ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setEnableThinking(!enableThinking)}
                                        className="absolute bottom-2 left-2 h-8 text-xs"
                                    >
                                        Enable Thinking
                                    </Button>
                                    {/* Send Button - bottom right inside input */}
                                    <Button
                                        onClick={handleSend}
                                        disabled={loading || !input.trim() || !config.model || !apiKey}
                                        size="icon"
                                        className="absolute bottom-2 right-2 h-8 w-8"
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
