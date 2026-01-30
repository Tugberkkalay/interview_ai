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

        await self.accept()
        print("WebSocket connected!")

    async def disconnect(self, close_code):
        print(f"WebSocket disconnected with code: {close_code}")
        self.session_active = False
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
                    await self.start_gemini_session(config)
                
                elif type == "client_content":
                    # Send text input to Gemini
                    if self.gemini_session:
                        await self.gemini_session.send(input=data.get("content"), end_of_turn=data.get("end_of_turn", False))
                
                elif type == "tool_response":
                    # Send tool response to Gemini
                    if self.gemini_session:
                         await self.gemini_session.send(input=data.get("response"))
                
                elif type == "realtime_input":
                     # Handle realtime input (text)
                     if self.gemini_session:
                         # Python SDK might send text via separate method or flexible send
                         # data['data'] should contain the text
                         text_content = data.get("text")
                         if text_content:
                             await self.gemini_session.send(input=text_content, end_of_turn=True)

            except json.JSONDecodeError:
                print("Invalid JSON received")
        
        if bytes_data:
            # Send audio chunk to Gemini
            if self.gemini_session:
                # Python SDK send accepts data chunks for audio/video
                # "mime_type": "audio/pcm" is default for audio bytes usually
                await self.gemini_session.send(input={"mime_type": "audio/pcm", "data": bytes_data})


    async def start_gemini_session(self, config_data):
        try:
            model_id = "gemini-2.0-flash-exp"
            
            # Extract config
            system_instruction = config_data.get("systemInstruction")
            tools = get_tools_declaration()
            response_modalities = ["AUDIO"] 
            
            # Setup config object
            config = {
                "response_modalities": response_modalities,
                "system_instruction": system_instruction,
                "tools": tools, 
            }
            
            print(f"Connecting to Gemini Live: {model_id}")
            
            # Use 'aio' for Async iteration
            async with self.client.aio.live.connect(model=model_id, config=config) as session:
                self.gemini_session = session
                self.session_active = True
                
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
                        
        except Exception as e:
            print(f"Gemini Session Error: {e}")
            import traceback
            traceback.print_exc()
            await self.send(text_data=json.dumps({"type": "error", "message": str(e)}))
            # Don't close immediately, let frontend handle
            self.session_active = False
