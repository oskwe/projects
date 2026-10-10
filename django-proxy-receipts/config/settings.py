from pathlib import Path
import os
import json

BASE_DIR = Path(__file__).resolve().parent.parent
# Локальные параметры подключения к PostgreSQL (файл не передаётся в архивах).
connection_file = BASE_DIR / 'database.local.json'
connection = json.loads(connection_file.read_text(encoding='utf-8')) if connection_file.exists() else {}

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'local-study-receipt-acts-change-for-production')
DEBUG = os.environ.get('DJANGO_DEBUG', '1') == '1'
ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', '127.0.0.1,localhost,testserver').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'accounts',
    'customers',
    'departments',
    'employees',
    'organizations',
    'positions',
    'products',
    'units',
    'proxies',
    'warehouses',
    'receipts',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'
TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [BASE_DIR / 'templates'],
    'APP_DIRS': True,
    'OPTIONS': {'context_processors': [
        'django.template.context_processors.request',
        'django.contrib.auth.context_processors.auth',
        'django.contrib.messages.context_processors.messages',
    ]},
}]
WSGI_APPLICATION = 'config.wsgi.application'

# По методичке используется PostgreSQL (база crm_akt). Без настроек PostgreSQL
# проект запускается на SQLite, чтобы его можно было открыть на любом компьютере.
DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': BASE_DIR / 'db.sqlite3'}}
if os.environ.get('DJANGO_USE_SQLITE') != '1' and (os.environ.get('POSTGRES_DB') or connection.get('NAME')):
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.postgresql',
        **{key: os.environ.get('POSTGRES_' + ('DB' if key == 'NAME' else key), connection.get(key, fallback))
           for key, fallback in {'NAME': '', 'USER': 'postgres', 'PASSWORD': '', 'HOST': 'localhost', 'PORT': '5432'}.items()},
    }

LANGUAGE_CODE = 'ru'
TIME_ZONE = 'Europe/Moscow'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
