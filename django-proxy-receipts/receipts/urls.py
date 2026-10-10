from django.urls import path
from . import views

app_name = 'receipts'
urlpatterns = [
    path('', views.journal, name='list'),
    path('create/', views.edit_act, name='create'),
    path('view/<int:pk>/', views.detail, name='detail'),
    path('edit/<int:pk>/', views.edit_act, name='edit'),
    path('copy/<int:pk>/', views.copy_act, name='copy'),
    path('delete/<int:pk>/', views.delete_act, name='delete'),
    path('print/<int:pk>/', views.print_act, name='print'),
]
