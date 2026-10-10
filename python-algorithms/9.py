"""Создать массив, содержащий данные о сотрудниках предприятия (ФИО, отдел, оклад,
адрес, домашний телефон, возраст). Вывести на экран данные о сотрудниках бухгалтерии в порядке убывании их окладов
Используя два алгоритма: первый - метод прямого включения, второй - сортировка Шелла"""
class Employee:
    def __init__(self, name, dept, salary, address, phone, age):
        self.name = name
        self.dept = dept
        self.salary = salary
        self.address = address
        self.phone = phone
        self.age = age

# Данные сотрудников
employees = [
    Employee("Иванов И.И.", "Бухгалтерия", int(input()), "ул. Ленина, 10", "111-22-33", 35),
    Employee("Петров П.П.", "IT", int(input()), "ул. Пушкина, 5", "444-55-66", 28),
    Employee("Сидорова А.В.", "Бухгалтерия", int(input()), "ул. Гагарина, 15", "777-88-99", 42),
    Employee("Кузнецов С.М.", "Отдел кадров", int(input()), "пр. Мира, 20", "123-45-67", 29),
    Employee("Смирнова О.Л.", "Бухгалтерия", int(input()), "ул. Советская, 3", "987-65-43", 38),
]

# Фильтруем бухгалтерию
accounting = [e for e in employees if e.dept == "Бухгалтерия"]

# Метод 1: Прямое включение (по убыванию)
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j].salary < key.salary:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr

# Метод 2: Сортировка Шелла (по убыванию)
def shell_sort(arr):
    n = len(arr)
    gap = n // 2
    while gap > 0:
        for i in range(gap, n):
            temp = arr[i]
            j = i
            while j >= gap and arr[j - gap].salary < temp.salary:
                arr[j] = arr[j - gap]
                j -= gap
            arr[j] = temp
        gap //= 2
    return arr

# Выводим результаты
print("Бухгалтерия (без сортировки):")
for emp in accounting:
    print(f"  {emp.name}: {emp.salary} руб.")

print("\nМетод прямого включения:")
sorted1 = insertion_sort(accounting.copy())
for emp in sorted1:
    print(f"  {emp.name}: {emp.salary} руб.")

print("\nСортировка Шелла:")
sorted2 = shell_sort(accounting.copy())
for emp in sorted2:
    print(f"  {emp.name}: {emp.salary} руб.")