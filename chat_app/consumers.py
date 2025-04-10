import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from .models import Room, Message
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        logger.info("WebSocket connection attempt")
        try:
            self.room_name = self.scope['url_route']['kwargs']['room_name']
            self.room_group_name = f'chat_{self.room_name}'
            logger.info(f"Room name: {self.room_name}")

            try:
                query_string = self.scope['query_string'].decode()
                logger.info(f"Query string: {query_string}")
                token = query_string.split('=')[1]
                logger.info(f"Token: {token}")
                access_token = AccessToken(token)
                self.user = await self.get_user(access_token['user_id'])
                if not self.user:
                    logger.error("User not found")
                    await self.close(code=4003)
                    return
                logger.info(f"User authenticated: {self.user.username}")
            except Exception as e:
                logger.error(f"WebSocket authentication error: {e}")
                await self.close(code=4003)
                return

            room = await self.get_or_create_room()
            if not room:
                logger.error(f"Failed to create/get room {self.room_name}")
                await self.close(code=4004)
                return
            logger.info(f"Room {self.room_name} ready")

            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()
        except Exception as e:
            logger.error(f"WebSocket connection error: {e}")
            await self.close(code=4000)

    async def disconnect(self, close_code):
        logger.info(f"WebSocket disconnected with code: {close_code}")
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json['message']
            logger.info(f"Received message: {message}")

            saved_message = await self.save_message(message)
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'username': self.user.username
                }
            )
        except Exception as e:
            logger.error(f"Error processing message: {e}")

    async def chat_message(self, event):
        try:
            message = event['message']
            username = event['username']
            logger.info(f"Sending message: {message} from {username}")

            await self.send(text_data=json.dumps({
                'message': message,
                'username': username
            }))
        except Exception as e:
            logger.error(f"Error sending message: {e}")

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            logger.error(f"User {user_id} not found")
            return None

    @database_sync_to_async
    def get_or_create_room(self):
        try:
            room, created = Room.objects.get_or_create(name=self.room_name)
            return room
        except Exception as e:
            logger.error(f"Error getting/creating room: {e}")
            return None

    @database_sync_to_async
    def save_message(self, content):
        try:
            logger.info(f"Trying to save message: {content} in room: {self.room_name} by user: {self.user.username}")
            room = Room.objects.get(name=self.room_name)
            message = Message.objects.create(
                room=room,
                user=self.user,
                content=content
            )
            logger.info(f"Message saved to database with ID: {message.id}")
            return message
        except Exception as e:
            logger.error(f"Error saving message: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return None 