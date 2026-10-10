"""Теги печатных форм: круглая печать организации и сумма прописью."""
import math
from uuid import uuid4

from django import template
from django.utils.html import escape
from django.utils.safestring import mark_safe

from receipts.money import amount_in_words

register = template.Library()


@register.filter
def in_words(value):
    return amount_in_words(value)


@register.simple_tag
def org_seal(name, inn='', okpo='', caption='ДЛЯ ДОКУМЕНТОВ', size=150, rotate=-8):
    """Круглая оттиск-печать организации (SVG) для места «М.П.».

    Текст по окружности берётся из справочника организаций, поэтому печать
    соответствует выбранной в документе организации.
    """
    name = (name or 'Организация').strip()
    details = ' · '.join(part for part in [f'ИНН {inn}' if inn else '', f'ОКПО {okpo}' if okpo else ''] if part)
    ring = f'{name.upper()} ★ {details} ★' if details else f'{name.upper()} ★ {name.upper()} ★'
    radius = 61
    circumference = 2 * math.pi * radius
    # Буквы уплотняются для длинных названий, чтобы текст замкнулся в кольцо.
    font = max(7.0, min(12.5, circumference / max(len(ring), 1) * 1.55))
    short = name
    if len(short) > 22:
        short = short[:21] + '…'
    ring_id = 'seal-ring-' + uuid4().hex[:8]
    svg = f'''<svg class="org-seal" viewBox="0 0 160 160" width="{int(size)}" height="{int(size)}" role="img"
 aria-label="Печать организации {escape(name)}" style="transform:rotate({float(rotate)}deg)">
<defs><path id="{ring_id}" d="M80,80 m-{radius},0 a{radius},{radius} 0 1,1 {radius * 2},0 a{radius},{radius} 0 1,1 -{radius * 2},0"/></defs>
<g fill="none" stroke="currentColor"><circle cx="80" cy="80" r="77" stroke-width="2.6"/><circle cx="80" cy="80" r="72" stroke-width="0.9"/>
<circle cx="80" cy="80" r="49" stroke-width="1.2"/><circle cx="80" cy="80" r="46" stroke-width="0.6"/></g>
<text fill="currentColor" font-family="Arial, sans-serif" font-weight="700" font-size="{font:.1f}">
<textPath href="#{ring_id}" textLength="{circumference - 4:.1f}" lengthAdjust="spacing">{escape(ring)}</textPath></text>
<g fill="currentColor" font-family="Arial, sans-serif" text-anchor="middle">
<text x="80" y="70" font-size="8.5" font-weight="700">{escape(short)}</text>
<text x="80" y="84" font-size="13" font-weight="700">★</text>
<text x="80" y="98" font-size="7.5">{escape(caption)}</text></g></svg>'''
    return mark_safe(svg)
