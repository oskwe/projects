import numpy as np
import matplotlib.pyplot as plt

# Диапазон для x1
x1 = np.linspace(0, 20, 400)

# Ограничения как функции x2(x1)
def line_A(x): return (90 - 5*x) / 9       # 5x1 + 9x2 <= 90
def line_B(x): return (58 - 6*x) / 9       # 6x1 + 9x2 <= 58
def line_C(x): return (98 - 7*x) / 13      # 7x1 + 13x2 <= 98
def line_D(x): return (24 - 6*x) / 12      # 6x1 + 12x2 >= 24 → x2 >= ...
def line_E(x): return (24 - 5*x) / 8       # 5x1 + 8x2 >= 24 → x2 >= ...

# Создаём график
plt.figure(figsize=(10, 8))

# Строим граничные прямые
plt.plot(x1, line_A(x1), label=r'$5x_1 + 9x_2 = 90$', color='blue')
plt.plot(x1, line_B(x1), label=r'$6x_1 + 9x_2 = 58$', color='green')
plt.plot(x1, line_C(x1), label=r'$7x_1 + 13x_2 = 98$', color='red')
plt.plot(x1, line_D(x1), label=r'$6x_1 + 12x_2 = 24$', color='purple')
plt.plot(x1, line_E(x1), label=r'$5x_1 + 8x_2 = 24$', color='orange')

# Заштриховываем области
x_fill = np.linspace(0, 15, 300)
y_upper = np.minimum(np.minimum(line_A(x_fill), line_B(x_fill)), line_C(x_fill))
y_lower = np.maximum(line_D(x_fill), line_E(x_fill))

# Ограничиваем y >= 0
y_upper = np.maximum(y_upper, 0)
y_lower = np.maximum(y_lower, 0)

# Заливка только там, где y_upper >= y_lower
valid = y_upper >= y_lower
plt.fill_between(x_fill, y_lower, y_upper, where=valid, color='gray', alpha=0.3, label='ОДР')

# Настройки графика
plt.xlim(0, 15)
plt.ylim(0, 12)
plt.xlabel(r'$x_1$')
plt.ylabel(r'$x_2$')
plt.title('График ограничений и ОДР (Вариант 15)')
plt.axhline(0, color='black', linewidth=0.5)
plt.axvline(0, color='black', linewidth=0.5)
plt.grid(True, linestyle='--', alpha=0.6)
plt.legend()
plt.show()