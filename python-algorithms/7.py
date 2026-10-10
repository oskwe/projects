"Число, нацело делящееся на X"
numbers = list(map(int, input().split()))
x = int(input())
print(f"Исходный:{numbers}")

for i, num in enumerate(numbers):
    if num % x == 0:
        print(f"Найдено{num} на позиции{i}")

        nums1=numbers.copy()
        pos=i
        while pos>0:
            nums1[pos], nums1[pos-1]=nums1[pos-1], nums1[pos]
            pos -=1
        print(f"Транспозиция:{nums1}")

