import { LiveServerMessage, Modality, FunctionDeclaration } from '@google/genai';

export class LiveClient {
    private url: string;

    constructor(url: string) {
        this.url = url;
    }

    async connect(options: any): Promise<ProxySession> {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(this.url);
            
            const session = new ProxySession(ws, options.config);

            ws.onopen = async () => {
                console.log("WebSocket connected to backend");
                if (options.callbacks?.onopen) {
                    await options.callbacks.onopen();
                }
                resolve(session);
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                reject(error);
            };
            
            // Allow session to hook into onmessage
            const originalOnMessage = ws.onmessage;
            ws.onmessage = (event) => {
                 session.handleMessage(event, options.callbacks?.onmessage);
            };
        });
    }
}

class ProxySession {
    private ws: WebSocket;
    private config: any;

    constructor(ws: WebSocket, config: any) {
        this.ws = ws;
        this.config = config;
        
        // Send connection config to backend
        this.ws.send(JSON.stringify({
            type: "connect_gemini",
            config: {
                systemInstruction: config.systemInstruction
            }
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
            }

        } catch (e) {
            console.error("Proxy message error", e);
        }
    }

    sendRealtimeInput(input: { media?: any, text?: string }) {
        if (input.text) {
             this.ws.send(JSON.stringify({ 
                 type: "realtime_input", 
                 text: input.text 
             }));
        }
        if (input.media) {
             if (input.media instanceof Blob) {
                 this.ws.send(input.media);
             } else if (input.media.data) {
                 // If it's base64 string (from some legacy code), better to convert to blob or send as specific type
                 // SiteAssistantButton uses createPcmBlob which returns Blob
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
  var base64    = ''
  var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

  var bytes         = new Uint8Array(arrayBuffer)
  var byteLength    = bytes.byteLength
  var byteRemainder = byteLength % 3
  var mainLength    = byteLength - byteRemainder

  var a, b, c, d
  var chunk

  // Main loop deals with bytes in chunks of 3
  for (var i = 0; i < mainLength; i = i + 3) {
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

    a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
    d = chunk & 63               // 63       = 2^6 - 1

    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder == 1) {
    chunk = bytes[mainLength]

    a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2
    b = (chunk & 3)   << 4 // 3   = 2^2 - 1

    base64 += encodings[a] + encodings[b] + '=='
  } else if (byteRemainder == 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

    a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4
    c = (chunk & 15)    <<  2 // 15    = 2^4 - 1

    base64 += encodings[a] + encodings[b] + encodings[c] + '='
  }

  return base64
}
