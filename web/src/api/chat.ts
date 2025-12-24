export interface ChatMessage {
    role: 'system' | 'user' | 'assistant'
    content: string
    reasoning_content?: string
}

export interface ChatCompletionRequest {
    model: string
    messages: ChatMessage[]
    stream?: boolean
    max_tokens?: number
    temperature?: number
    top_p?: number
    top_k?: number
    presence_penalty?: number
    frequency_penalty?: number
    repetition_penalty?: number
    response_format?: {
        type: 'text' | 'json_object'
    }
    reasoning_effort?: 'low' | 'medium' | 'high'
}

export interface ChatCompletionChoice {
    index: number
    message: ChatMessage
    finish_reason: string
}

export interface ChatCompletionUsage {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
}

export interface ChatCompletionResponse {
    id: string
    object: string
    created: number
    model: string
    choices: ChatCompletionChoice[]
    usage: ChatCompletionUsage
}

export const chatApi = {
    createCompletion: async (data: ChatCompletionRequest, apiKey?: string): Promise<ChatCompletionResponse> => {
        // Chat completions API uses relay router, not /api prefix
        // Extract origin from VITE_API_BASE_URL (remove path)
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
        const url = apiBaseUrl ? `${new URL(apiBaseUrl).origin}/v1/chat/completions` : '/v1/chat/completions'
        const authToken = apiKey || localStorage.getItem('token') || ''

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        return result.data || result
    },

    createCompletionStream: async (
        data: ChatCompletionRequest,
        onChunk: (chunk: string, reasoningChunk?: string) => void,
        onComplete: () => void,
        onError: (error: Error) => void,
        apiKey?: string
    ): Promise<void> => {
        try {
            // Chat completions API uses relay router, not /api prefix
            // Extract origin from VITE_API_BASE_URL (remove path)
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
            const url = apiBaseUrl ? `${new URL(apiBaseUrl).origin}/v1/chat/completions` : '/v1/chat/completions'
            const authToken = apiKey || localStorage.getItem('token') || ''

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ ...data, stream: true }),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()

            if (!reader) {
                throw new Error('No response body')
            }

            let buffer = ''
            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                // Append new data to buffer
                buffer += decoder.decode(value, { stream: true })

                // Split by newlines but keep incomplete lines in buffer
                const lines = buffer.split('\n')
                // Keep the last element (might be incomplete) in buffer
                buffer = lines.pop() || ''

                for (const line of lines) {
                    const trimmedLine = line.trim()
                    if (trimmedLine.startsWith('data: ')) {
                        const dataStr = trimmedLine.slice(6)
                        if (dataStr === '[DONE]') {
                            onComplete()
                            return
                        }
                        try {
                            const parsed = JSON.parse(dataStr)
                            const content = parsed.choices?.[0]?.delta?.content
                            const reasoningContent = parsed.choices?.[0]?.delta?.reasoning_content

                            if (content || reasoningContent) {
                                console.log('[SSE] Chunk received - content:', content, 'reasoning:', reasoningContent)
                                onChunk(content || '', reasoningContent)
                            }
                        } catch (e) {
                            // Skip invalid JSON
                            console.error('[SSE] Failed to parse:', dataStr, e)
                        }
                    }
                }
            }

            onComplete()
        } catch (error) {
            onError(error as Error)
        }
    }
}
