"""Описать функцию, которая:
 а) заменяет значения всех нетерминальных узлов на среднее арифметическое их непосредственных потомков;
 b) определяет, является ли полученное дерево деревом бинарного
поиска."""

class TreeNode:
    """Узел бинарного дерева"""

    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

    def __str__(self):
        return str(self.value)

    def is_leaf(self):
        """Проверка, является ли узел листом"""
        return self.left is None and self.right is None


def replace_with_average(node):
    """Заменяет значения всех нетерминальных узлов на среднее арифметическое их непосредственных потомков.Возвращает новое значение узла или None для листьев.
    """
    if node is None or node.is_leaf():
        # Листья не меняем
        return None if node is None else node.value

    # Собираем значения непосредственных потомков
    children_values = []
    if node.left:
        children_values.append(node.left.value)
    if node.right:
        children_values.append(node.right.value)
    if children_values:
        avg = sum(children_values) / len(children_values)
        # Рекурсивно обрабатываем детей
        replace_with_average(node.left)
        replace_with_average(node.right)
        # Меняем значение текущего узла
        node.value = avg
        return avg

    return node.value


def is_bst(node, min_val=float('-inf'), max_val=float('inf')):
    """Проверяет, является ли дерево деревом бинарного поиска (BST).BST: для каждого узла:все значения в левом поддереве < значение узла,все значения в правом поддереве > значения узла
    """
    if node is None:
        return True
    # Проверяем, находится ли значение в допустимом диапазоне
    if not (min_val < node.value < max_val):
        return False
    # Рекурсивно проверяем
    # Для левого поддерева: max становится текущим значением
    # Для правого поддерева: min становится текущим значением
    return (is_bst(node.left, min_val, node.value) and
            is_bst(node.right, node.value, max_val))
def is_bst_alternative(node):
    """Альтернативная проверка BST с помощью in-order обхода.В BST in-order обход должен давать отсортированную последовательность.
    """

    def inorder_collect(node, result):
        if node is None:
            return
        inorder_collect(node.left, result)
        result.append(node.value)
        inorder_collect(node.right, result)
    values = []
    inorder_collect(node, values)
    
def create_test_tree_1():
    root = TreeNode(int(input()))
    root.left = TreeNode(int(input()))
    root.right = TreeNode(int(input()))
    root.left.left = TreeNode(int(input()))
    root.left.right = TreeNode(int(input()))
    root.right.left = TreeNode(int(input()))
    root.right.right = TreeNode(int(input()))
    return root

def create_test_tree_2():
    root = TreeNode(10)
    root.left = TreeNode(15)  # Нарушение: 15 > 10
    root.right = TreeNode(5)  # Нарушение: 5 < 10
    root.left.left = TreeNode(12)
    root.left.right = TreeNode(18)
    return root

def create_test_tree_3():
    root = TreeNode(int(input()))
    root.right = TreeNode(int(input()))
    root.right.right = TreeNode(int(input()))
    root.right.right.right = TreeNode(int(input()))
    return root


def print_tree(node, level=0, prefix="Root: "):
    """Визуализация дерева"""
    if node is not None:
        print(" " * (level * 4) + prefix + f"{node.value:.2f}" if isinstance(node.value, float) else str(node.value))
        if node.left or node.right:
            if node.left:
                print_tree(node.left, level + 1, "L--- ")
            if node.right:
                print_tree(node.right, level + 1, "R--- ")


def main():
    """Основная функция для демонстрации"""
    print("=" * 50)
    print("ТЕСТ 1: Исходное BST дерево")
    print("=" * 50)

    tree1 = create_test_tree_1()
    print("\nИсходное дерево:")
    print_tree(tree1)
    print(f"\nЯвляется BST? {is_bst(tree1)}")

    print("\n" + "=" * 50)
    print("После замены значений на среднее арифметическое потомков")
    print("=" * 50)

    replace_with_average(tree1)
    print("\nМодифицированное дерево:")
    print_tree(tree1)
    print(f"\nЯвляется BST? {is_bst(tree1)}")
    print(f"Проверка через in-order: {is_bst_alternative(tree1)}")

    print("\n" + "=" * 50)
    print("ТЕСТ 2: Исходное не-BST дерево")
    print("=" * 50)

    tree2 = create_test_tree_2()
    print("\nИсходное дерево:")
    print_tree(tree2)
    print(f"\nЯвляется BST? {is_bst(tree2)}")

    print("\nПосле замены значений:")
    replace_with_average(tree2)
    print_tree(tree2)
    print(f"\nЯвляется BST? {is_bst(tree2)}")

    print("\n" + "=" * 50)
    print("ТЕСТ 3: Линейное дерево")
    print("=" * 50)

    tree3 = create_test_tree_3()
    print("\nИсходное дерево:")
    print_tree(tree3)
    print(f"\nЯвляется BST? {is_bst(tree3)}")

    print("\nПосле замены значений:")
    replace_with_average(tree3)
    print_tree(tree3)
    print(f"\nЯвляется BST? {is_bst(tree3)}")

    # Дополнительный тест с плавающими значениями
    print("\n" + "=" * 50)
    print("ТЕСТ 4: Дерево с плавающими значениями")
    print("=" * 50)

    root = TreeNode(10.5)
    root.left = TreeNode(5.2)
    root.right = TreeNode(15.8)
    root.left.left = TreeNode(2.1)
    root.left.right = TreeNode(7.3)

    print("\nИсходное дерево:")
    print_tree(root)
    print(f"\nЯвляется BST? {is_bst(root)}")

    print("\nПосле замены значений:")
    replace_with_average(root)
    print_tree(root)
    print(f"\nЯвляется BST? {is_bst(root)}")


def process_specific_tree():
    """Обработка конкретного дерева из условия задачи"""
    print("\n" + "=" * 50)
    print("Обработка дерева")
    print("=" * 50)

    root = TreeNode(10)
    root.left = TreeNode(5)
    root.right = TreeNode(15)
    root.left.left = TreeNode(2)
    root.left.right = TreeNode(7)
    root.right.left = TreeNode(12)
    root.right.right = TreeNode(20)

    print("\n1. Исходное дерево:")
    print_tree(root)
    print(f"   Является BST? {is_bst(root)}")

    print("\n2. Заменяем значения нетерминальных узлов на среднее арифметическое потомков:")
    print("   - Узел 5: (2 + 7) / 2 = 4.5")
    print("   - Узел 15: (12 + 20) / 2 = 16.0")
    print("   - Узел 10: (4.5 + 16.0) / 2 = 10.25")
    replace_with_average(root)
    print("\3. Модифицированное дерево:")
    print_tree(root)
    print(f"\n4. Проверка BST после замены:")
    print(f"   Метод с диапазонами: {is_bst(root)}")
    print(f"   Метод in-order: {is_bst_alternative(root)}")

    # значения in-order обхода
    def inorder_values(node):
        if node is None:
            return []
        return inorder_values(node.left) + [node.value] + inorder_values(node.right)

    print(f"   In-order обход: {inorder_values(root)}")
    print("   Внимание: 10.25 > 10.0, поэтому нарушается свойство BST!")


if __name__ == "__main__":
    main()
    process_specific_tree()