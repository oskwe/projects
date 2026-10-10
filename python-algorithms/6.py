"алгоритм поиска случайного числа с индексно-последовательным поиском"
import random, math

data = sorted(random.sample(range(100), 20))
block = int(math.sqrt(len(data)))
index = [(data[min(i+block, len(data)-1)], i) for i in range(0, len(data), block)]

target = random.choice(data)
print(f"Ищем {target} в {data}")

# Поиск
start = next((idx for max_val, idx in index if target <= max_val), 0)
for i in range(start, min(start+block, len(data))):
    if data[i] == target:
        print(f"Найден на позиции {i}")
        break
else:
    print("Не найден")