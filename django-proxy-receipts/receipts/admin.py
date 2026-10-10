from django.contrib import admin
from .models import ReceiptAct, ReceiptItem


class ReceiptItemInline(admin.TabularInline):
    model = ReceiptItem
    extra = 0


@admin.register(ReceiptAct)
class ReceiptActAdmin(admin.ModelAdmin):
    list_display = ['number', 'date', 'organization', 'contractor', 'warehouse']
    list_filter = ['organization', 'warehouse']
    search_fields = ['number', 'object_name']
    inlines = [ReceiptItemInline]


admin.site.site_header = 'Акты оприходования и доверенности'
