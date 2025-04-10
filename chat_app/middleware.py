from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class TokenAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        try:
            query_string = scope["query_string"].decode()
            logger.info(f"WebSocket connection attempt with query: {query_string}")
            token = query_string.split("=")[1]
            access_token = AccessToken(token)
            user = await self.get_user(access_token["user_id"])
            scope["user"] = user
            logger.info(f"WebSocket authenticated user: {user.username}")
        except Exception as e:
            logger.error(f"TokenAuthMiddleware error: {e}")
            scope["user"] = AnonymousUser()
        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            logger.error(f"User {user_id} not found")
            return AnonymousUser() 