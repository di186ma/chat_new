from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('api/register/', views.RegisterView.as_view(), name='register'),
    path('api/login/', views.LoginView.as_view(), name='login'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/user/', views.CurrentUserView.as_view(), name='current-user'),
    path('api/rooms/', views.RoomList.as_view(), name='room-list'),
    path('api/rooms/<int:pk>/', views.RoomDetail.as_view(), name='room-detail'),
    path('api/rooms/<int:room_id>/messages/', views.MessageList.as_view(), name='message-list'),
] 