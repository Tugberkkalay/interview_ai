import asyncio
import base64
import json
import os
from channels.generic.websocket import AsyncWebsocketConsumer
from google import genai

# Helper for tool declarations
def get_tools_declaration():
    create_demo_request_tool = {
        "function_declarations": [{
            "name": "create_demo_request",
            "description": "Kullanıcı AÇIKÇA ve NET bir şekilde demo almak istediğini belirttiğinde, ONAY verdiğinde VE kullanıcıdan AD, ŞİRKET ve TARİH bilgilerini aldıktan sonra bu fonksiyonu çağır. ASLA eksik bilgi ile çağırma.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "name": { "type": "STRING", "description": "Kullanıcının adı ve soyadı" },
                    "company": { "type": "STRING", "description": "Kullanıcının şirketi" },
                    "preferredTime": { "type": "STRING", "description": "Tercih edilen tarih ve saat" },
                    "contact": { "type": "STRING", "description": "Telefon numarası (Opsiyonel)" }
                },
                "required": ["name", "company", "preferredTime"]
            }
        }]
    }
    
    end_session_tool = {
        "function_declarations": [{
            "name": "end_session",
            "description": "Görüşmeyi bitirmek için bu fonksiyonu çağır. ÇOK DİKKATLİ KULLAN! Sadece iki durumda çağır: 1) Demo talebi aldıktan sonra kullanıcı görüşmeyi bitirmek istediğinde, 2) Demo talebi yoksa müşteri açıkça ve net bir şekilde görüşmeyi bitirmek istediğinde VE müşteriden teyit aldıktan sonra.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "reason": { "type": "STRING", "description": "Session'ın kapatılma nedeni" }
                },
                "required": []
            }
        }]
    }
    
    return [create_demo_request_tool, end_session_tool]


def normalize_tools(tools):
    if not tools:
        return None
    normalized = []
    for tool in tools:
        if "function_declarations" in tool:
            normalized.append(tool)
        elif "functionDeclarations" in tool:
            normalized.append({"function_declarations": tool["functionDeclarations"]})
    return normalized or None


def build_live_config(config_data, use_default_tools=False):
    system_instruction = config_data.get("systemInstruction")
    response_modalities = config_data.get("responseModalities")
    input_audio_transcription = config_data.get("inputAudioTranscription")
    output_audio_transcription = config_data.get("outputAudioTranscription")
    speech_config = config_data.get("speechConfig")

    tools = normalize_tools(config_data.get("tools"))
    if not tools and use_default_tools:
        tools = get_tools_declaration()

    config = {}
    if not response_modalities:
        response_modalities = ["AUDIO"]
    if response_modalities:
        config["response_modalities"] = response_modalities
    if system_instruction:
        config["system_instruction"] = system_instruction
    if tools:
        config["tools"] = tools
    if speech_config:
        config["speech_config"] = speech_config
    if input_audio_transcription is not None:
        config["input_audio_transcription"] = input_audio_transcription
    if output_audio_transcription is not None:
        config["output_audio_transcription"] = output_audio_transcription

    return config

class AssistantConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            print("GEMINI_API_KEY not found!")
            await self.close(code=4003) # Forbidden
            return

        self.client = genai.Client(api_key=self.api_key, http_options={'api_version': 'v1alpha'})
        self.gemini_session = None
        self.session_active = False
        self.session_task = None
        self.pending_text_inputs = []
        self.pending_media_inputs = []
        self.pending_audio_chunks = []

        await self.accept()
        print("WebSocket connected!")

    async def disconnect(self, close_code):
        print(f"WebSocket disconnected with code: {close_code}")
        self.session_active = False
        if self.session_task:
            self.session_task.cancel()
            self.session_task = None
        # Clean up Gemini session if possible/needed (Python SDK manages this mostly)
        pass

    async def receive(self, text_data=None, bytes_data=None):
        if text_data:
            try:
                data = json.loads(text_data)
                type = data.get("type")
                
                if type == "connect_gemini":
                    # Start Gemini Session
                    config = data.get("config", {})
                    model = data.get("model")
                    if self.session_task:
                        self.session_task.cancel()
                    self.session_task = asyncio.create_task(self.start_gemini_session(config, model))
                
                elif type == "client_content":
                    # Send text input to Gemini
                    if self.gemini_session:
                        await self.gemini_session.send(input=data.get("content"), end_of_turn=data.get("end_of_turn", False))
                
                elif type == "tool_response":
                    # Send tool response to Gemini
                    if self.gemini_session:
                         await self.gemini_session.send(input=data.get("response"))
                
                elif type == "realtime_input":
                    # Handle realtime input (text or media)
                    if "text" in data:
                        text_content = data.get("text")
                        end_of_turn = data.get("end_of_turn", True)
                        if self.gemini_session:
                            await self.gemini_session.send(input=text_content, end_of_turn=end_of_turn)
                        else:
                            self.pending_text_inputs.append({
                                "text": text_content,
                                "end_of_turn": end_of_turn
                            })

                    media = data.get("media")
                    if media and media.get("data") and media.get("mimeType"):
                        decoded = base64.b64decode(media["data"])
                        if self.gemini_session:
                            await self.gemini_session.send(
                                input={"mime_type": media["mimeType"], "data": decoded}
                            )
                        else:
                            self.pending_media_inputs.append({
                                "mime_type": media["mimeType"],
                                "data": decoded
                            })

            except json.JSONDecodeError:
                print("Invalid JSON received")
        
        if bytes_data:
            # Send audio chunk to Gemini
            if self.gemini_session:
                # Python SDK send accepts data chunks for audio/video
                # "mime_type": "audio/pcm" is default for audio bytes usually
                await self.gemini_session.send(input={"mime_type": "audio/pcm;rate=16000", "data": bytes_data})
            else:
                self.pending_audio_chunks.append(bytes_data)


    async def start_gemini_session(self, config_data, model_id=None):
        try:
            model = model_id or config_data.get("model") or "gemini-2.0-flash-exp"
            
            # Extract config
            use_default_tools = "/ws/assistant/" in self.scope.get("path", "")
            config = build_live_config(config_data, use_default_tools=use_default_tools)
            
            print(f"Connecting to Gemini Live: {model}")
            
            # Use 'aio' for Async iteration
            async with self.client.aio.live.connect(model=model, config=config) as session:
                self.gemini_session = session
                self.session_active = True

                # Flush any buffered inputs
                if self.pending_text_inputs:
                    for item in self.pending_text_inputs:
                        await self.gemini_session.send(
                            input=item.get("text"),
                            end_of_turn=item.get("end_of_turn", True)
                        )
                    self.pending_text_inputs = []
                if self.pending_media_inputs:
                    for item in self.pending_media_inputs:
                        await self.gemini_session.send(
                            input={"mime_type": item["mime_type"], "data": item["data"]}
                        )
                    self.pending_media_inputs = []
                if self.pending_audio_chunks:
                    for chunk in self.pending_audio_chunks:
                        await self.gemini_session.send(
                            input={"mime_type": "audio/pcm;rate=16000", "data": chunk}
                        )
                    self.pending_audio_chunks = []
                
                # Notify frontend that we are connected
                await self.send(text_data=json.dumps({"type": "gemini_connected"}))
                print("Gemini Live Connected, listening for events...")
                
                # Listen for messages from Gemini
                async for response in session.receive():
                    if not self.session_active:
                        break
                         
                    server_content = response.server_content
                    tool_calls = response.tool_call
                    
                    if server_content:
                        input_transcription = getattr(server_content, "input_transcription", None)
                        output_transcription = getattr(server_content, "output_transcription", None)
                        interrupted = getattr(server_content, "interrupted", None)

                        if input_transcription:
                            await self.send(text_data=json.dumps({
                                "type": "input_transcription",
                                "text": input_transcription.text
                            }))

                        if output_transcription:
                            await self.send(text_data=json.dumps({
                                "type": "output_transcription",
                                "text": output_transcription.text
                            }))

                        if interrupted:
                            await self.send(text_data=json.dumps({
                                "type": "interrupted"
                            }))

                        # Handle Model Turn (Audio/Text)
                        model_turn = server_content.model_turn
                        if model_turn:
                            for part in model_turn.parts:
                                if part.text:
                                    print(f"Received text from Gemini: {part.text[:50]}...")
                                    await self.send(text_data=json.dumps({
                                        "type": "text", 
                                        "text": part.text
                                    }))
                                if part.inline_data:
                                    # It's audio data
                                    await self.send(bytes_data=part.inline_data.data)

                    if tool_calls:
                        print("Received tool call from Gemini")
                        # Handle Tool Calls
                        fc_list = []
                        for fc in tool_calls.function_calls:
                            fc_list.append({
                                "id": fc.id,
                                "name": fc.name,
                                "args": fc.args
                            })
                        
                        await self.send(text_data=json.dumps({
                            "type": "tool_call",
                            "functionCalls": fc_list
                        }))
                        
        except asyncio.CancelledError:
            self.session_active = False
            raise
        except Exception as e:
            print(f"Gemini Session Error: {e}")
            import traceback
            traceback.print_exc()
            await self.send(text_data=json.dumps({"type": "error", "message": str(e)}))
            # Don't close immediately, let frontend handle
            self.session_active = False
