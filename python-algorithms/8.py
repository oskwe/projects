"тип хеш-функции аддитивная с использованием методом цепочек: бинарное дерево"
class SimpleNode:
    def __init__(self, key, value):
        self.key = key
        self.value = value
        self.left = None
        self.right = None
class BinaryTreeChain:
    """Хеш-таблица"""
    def __init__(self, size=10):
        self.size = size
        self.table =[None] * size

    def hash_func(self, key):
        """Аддитивная хеш-функция"""
        if isinstance(key, str):
            return sum(ord(c) for c in key) % self.size
        return hash(key) % self.size


    def _tree_insert(self, node, key, value):

        if node is None:
            return SimpleNode(key, value)
        if key<node.key:
            node.left = self._tree_insert(node.left, key, value)
        elif key>node.key:
            node.right=self._tree_insert(node.left,key,value)
        else:
            node.value=value #обновление значения
        return node
    def _tree_search(self, node, key):
        if node is None or node.key ==key:
            return node.value if node else None
        if key<node.key:
            return self._tree_search(node.left, key)
        return self._tree_search(node.right, key)
    def insert(self, key, value):
        idx=self.hash_func(key)
        self.table[idx]=self._tree_insert(self.table[idx], key, value)
    def get(self, key):
        idx=self.hash_func(key)
        return self._tree_search(self.table[idx],key)
    def print_tree(self, node, level=0):
        if node:
            self.print_tree(node.left, level +1)
            print(""*level+ f"{node.key}:{node.value}")
            self.print_tree(node.right, level +1)
ht=BinaryTreeChain(size=5)
ht.insert("ap", int(input()))
ht.insert("b", int(input()))
ht.insert("c", int(input()))

print("Результат ap", ht.get("ap"))
print("Результат b", ht.get("b"))
print("\nСодеримое")
for i in range(5):
    if ht.table[i]:
        print(f"\nЯчейка{i}:")
        ht.print_tree(ht.table[i])
