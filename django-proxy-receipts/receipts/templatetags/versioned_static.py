"""Refresh local CSS and JS after edits without requiring a browser cache reset."""
from pathlib import Path

from django import template
from django.contrib.staticfiles import finders
from django.templatetags.static import static

register = template.Library()


@register.simple_tag
def versioned_static(name):
    url = static(name)
    path = finders.find(name)
    if path:
        separator = '&' if '?' in url else '?'
        return f'{url}{separator}v={Path(path).stat().st_mtime_ns}'
    return url
