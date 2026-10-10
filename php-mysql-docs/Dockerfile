FROM php:8.2-apache

# Установка расширений
RUN apt-get update && apt-get install -y \
    libzip-dev zip unzip \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    && docker-php-ext-install pdo pdo_mysql zip

# Включаем mod_rewrite
RUN a2enmod rewrite

# Копируем конфиг для Apache
COPY ./apache-config.conf /etc/apache2/sites-available/000-default.conf

# Указываем рабочую директорию
WORKDIR /var/www/html

# Даем права
RUN chown -R www-data:www-data /var/www/html
