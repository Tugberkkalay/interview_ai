import { LiveServerMessage } from '../types/gemini';

export class LiveClient {
    private url: string;

    constructor(url: string) {
        this.url = url;
    }

    async connect(options: any): Promise<ProxySession> {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(this.url);
            let session: ProxySession;

            ws.onopen = async () => {
                console.log("WebSocket connected to backend");

                // Create session only after connection is established
                session = new ProxySession(ws, options.config, options.model);

                // Resolve BEFORE calling onopen so that sessionPromise is available inside onopen
                resolve(session);

                if (options.callbacks?.onopen) {
                    await options.callbacks.onopen();
                }
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                reject(error);
            };

            // Allow session to hook into onmessage
            ws.onmessage = (event) => {
                if (session) {
                    session.handleMessage(event, options.callbacks?.onmessage);
                }
            };
        });
    }
}

class ProxySession {
    private ws: WebSocket;
    private config: any;
    private model?: string;
    private debugTextCount = 0;
    private debugAudioCount = 0;

    constructor(ws: WebSocket, config: any, model?: string) {
        this.ws = ws;
        this.config = config;
        this.model = model;

        // Send connection config to backend
        this.ws.send(JSON.stringify({
            type: "connect_gemini",
            model: this.model,
            config: this.config
        }));
    }

    handleMessage(event: MessageEvent, onMessageCallback?: (msg: LiveServerMessage) => void) {
        try {
            // Handle binary audio data from backend
            if (event.data instanceof Blob) {
                event.data.arrayBuffer().then(buffer => {
                    // Create a server message with inlineData for audio
                    const msg: any = {
                        serverContent: {
                            modelTurn: {
                                parts: [{
                                    inlineData: {
                                        mimeType: "audio/pcm;rate=24000",
                                        data: base64ArrayBuffer(buffer)
                                    }
                                }]
                            }
                        }
                    };
                    if (onMessageCallback) onMessageCallback(msg);
                });
                return;
            }

            if (event.data instanceof ArrayBuffer) {
                const msg: any = {
                    serverContent: {
                        modelTurn: {
                            parts: [{
                                inlineData: {
                                    mimeType: "audio/pcm;rate=24000",
                                    data: base64ArrayBuffer(event.data)
                                }
                            }]
                        }
                    }
                };
                if (onMessageCallback) onMessageCallback(msg);
                return;
            }

            const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;

            if (data.type === "text") {
                const msg: any = {
                    serverContent: {
                        modelTurn: {
                            parts: [{ text: data.text }]
                        }
                    }
                };
                if (onMessageCallback) onMessageCallback(msg);

            } else if (data.type === "tool_call") {
                const msg: any = {
                    toolCall: {
                        functionCalls: data.functionCalls
                    }
                };
                if (onMessageCallback) onMessageCallback(msg);
            } else if (data.type === "input_transcription") {
                const msg: any = {
                    serverContent: {
                        inputTranscription: { text: data.text }
                    }
                };
                if (onMessageCallback) onMessageCallback(msg);
            } else if (data.type === "output_transcription") {
                const msg: any = {
                    serverContent: {
                        outputTranscription: { text: data.text }
                    }
                };
                if (onMessageCallback) onMessageCallback(msg);
            } else if (data.type === "interrupted") {
                const msg: any = {
                    serverContent: {
                        interrupted: true
                    }
                };
                if (onMessageCallback) onMessageCallback(msg);
            }

        } catch (e) {
            console.error("Proxy message error", e);
        }
    }

    sendRealtimeInput(input: { media?: any, text?: string, endOfTurn?: boolean }) {
        if (input.text !== undefined) {
            if (this.debugTextCount < 5) {
                console.debug("WS send text", {
                    length: input.text?.length ?? 0,
                    endOfTurn: input.endOfTurn
                });
                this.debugTextCount += 1;
            }
            this.ws.send(JSON.stringify({
                type: "realtime_input",
                text: input.text,
                end_of_turn: input.endOfTurn
            }));
        }
        if (input.media) {
            if (input.media instanceof Blob) {
                if (this.debugAudioCount < 5) {
                    console.debug("WS send audio blob", {
                        size: input.media.size,
                        type: input.media.type
                    });
                    this.debugAudioCount += 1;
                }
                this.ws.send(input.media);
            } else if (input.media.data && input.media.mimeType) {
                if (this.debugAudioCount < 5) {
                    console.debug("WS send audio base64", {
                        length: input.media.data?.length ?? 0,
                        mimeType: input.media.mimeType
                    });
                    this.debugAudioCount += 1;
                }
                this.ws.send(JSON.stringify({
                    type: "realtime_input",
                    media: {
                        mimeType: input.media.mimeType,
                        data: input.media.data
                    }
                }));
            }
        }
    }

    sendToolResponse(response: any) {
        this.ws.send(JSON.stringify({
            type: "tool_response",
            response: response
        }));
    }

    close() {
        this.ws.close();
    }
}

// Helper to convert ArrayBuffer to Base64
function base64ArrayBuffer(arrayBuffer: ArrayBuffer) {
    var base64 = ''
    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

    var bytes = new Uint8Array(arrayBuffer)
    var byteLength = bytes.byteLength
    var byteRemainder = byteLength % 3
    var mainLength = byteLength - byteRemainder

    var a, b, c, d
    var chunk

    // Main loop deals with bytes in chunks of 3
    for (var i = 0; i < mainLength; i = i + 3) {
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

        a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
        b = (chunk & 258048) >> 12 // 258048   = (2^6 - 1) << 12
        c = (chunk & 4032) >> 6 // 4032     = (2^6 - 1) << 6
        d = chunk & 63               // 63       = 2^6 - 1

        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
    }

    // Deal with the remaining bytes and padding
    if (byteRemainder == 1) {
        chunk = bytes[mainLength]

        a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2
        b = (chunk & 3) << 4 // 3   = 2^2 - 1

        base64 += encodings[a] + encodings[b] + '=='
    } else if (byteRemainder == 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

        a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
        b = (chunk & 1008) >> 4 // 1008  = (2^6 - 1) << 4
        c = (chunk & 15) << 2 // 15    = 2^4 - 1

        base64 += encodings[a] + encodings[b] + encodings[c] + '='
    }

    return base64
}
