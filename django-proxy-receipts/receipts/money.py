"""Сумма прописью для строки «Итого … (прописью)» печатной формы."""
from decimal import Decimal, ROUND_HALF_UP

UNITS = {
    'm': ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'],
    'f': ['', 'одна', 'две', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'],
}
TEENS = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать',
         'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать']
TENS = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто']
HUNDREDS = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот']
# (формы: 1, 2–4, 5–20), род
SCALES = [
    (('рубль', 'рубля', 'рублей'), 'm'),
    (('тысяча', 'тысячи', 'тысяч'), 'f'),
    (('миллион', 'миллиона', 'миллионов'), 'm'),
    (('миллиард', 'миллиарда', 'миллиардов'), 'm'),
]


def plural(number, forms):
    number = abs(number) % 100
    if 10 < number < 20:
        return forms[2]
    number %= 10
    if number == 1:
        return forms[0]
    if 2 <= number <= 4:
        return forms[1]
    return forms[2]


def triad(number, gender):
    words = [HUNDREDS[number // 100]]
    rest = number % 100
    if 10 <= rest < 20:
        words.append(TEENS[rest - 10])
    else:
        words += [TENS[rest // 10], UNITS[gender][rest % 10]]
    return [w for w in words if w]


def amount_in_words(value):
    """1234.5 -> «Одна тысяча двести тридцать четыре рубля 50 копеек»."""
    value = Decimal(value or 0).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    rubles = int(value)
    kopecks = int((value - rubles) * 100)
    if rubles == 0:
        words = ['ноль', 'рублей']
    else:
        words = []
        number, index = rubles, 0
        while number and index < len(SCALES):
            part = number % 1000
            forms, gender = SCALES[index]
            if part:
                chunk = triad(part, gender) + [forms and plural(part, forms)]
                words = chunk + words
            elif index == 0:
                words = ['рублей'] + words
            number //= 1000
            index += 1
    text = ' '.join(words)
    text = text[0].upper() + text[1:]
    return f"{text} {kopecks:02d} {plural(kopecks, ('копейка', 'копейки', 'копеек'))}"
