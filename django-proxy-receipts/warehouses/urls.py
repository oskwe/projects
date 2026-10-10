from django.urls import path
from .views import WarehouseListView, WarehouseCreateView, WarehouseUpdateView, WarehouseDeleteView

app_name = 'warehouses'
urlpatterns = [
    path('', WarehouseListView.as_view(), name='list'),
    path('create/', WarehouseCreateView.as_view(), name='create'),
    path('edit/<int:pk>/', WarehouseUpdateView.as_view(), name='edit'),
    path('delete/<int:pk>/', WarehouseDeleteView.as_view(), name='delete'),
]
