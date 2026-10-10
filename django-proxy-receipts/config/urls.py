from django.contrib import admin
from django.urls import path, include
from receipts.views import journal

urlpatterns = [
    path('', journal, name='home'),
    path('admin/', admin.site.urls),
    path('customers/', include('customers.urls')),
    path('accounts/', include('accounts.urls')),
    path('departments/', include('departments.urls')),
    path('employees/', include('employees.urls')),
    path('organizations/', include('organizations.urls')),
    path('positions/', include('positions.urls')),
    path('units/', include('units.urls')),
    path('proxies/', include('proxies.urls')),
    path('products/', include('products.urls')),
    path('warehouses/', include('warehouses.urls')),
    path('receipts/', include('receipts.urls')),
]
