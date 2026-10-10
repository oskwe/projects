// backend/src/routes/lab7/index.js

export default async function routes(fastify, options) {

  // Главный роут API: GET /api/lab7/
  fastify.get('/', async (request, reply) => {
    return { 
      lab: '№7',
      description: 'API для заданий лабораторной работы №7',
      status: 'ok'
    };
  });

  // ЗАДАНИЕ 1: КАЛЬКУЛЯТОР
  // Доступен по GET /api/lab7/task1?operation=add&a=5&b=3
  fastify.get('/task1', async (request, reply) => {
    const { operation, a, b } = request.query;
    
    const numA = parseFloat(a);
    const numB = parseFloat(b);

    if (isNaN(numA) || isNaN(numB)) {
      reply.code(400);
      return { error: "Параметры 'a' и 'b' должны быть числами." };
    }

    let result;
    switch (operation) {
      case 'add': case '+': result = numA + numB; break;
      case 'subtract': case '-': result = numA - numB; break;
      case 'multiply': case '*': result = numA * numB; break;
      case 'divide': case '/': 
        if (numB === 0) {
            reply.code(400);
            return { error: "Деление на ноль!" };
        }
        result = numA / numB; 
        break;
      default:
        reply.code(400);
        return { error: "Неизвестная операция" };
    }

    return { operation, a: numA, b: numB, result };
  });

  // Заглушка для task2, чтобы не было 404
  fastify.get('/task2', async (request, reply) => {
      return { message: "Task 2 API is ready" };
  });
  // Эндпоинт 1: makeInitials
  // GET /api/lab7/task2/makeInitials?surname=Ivanov&name=Ivan&patronymic=Ovich
  fastify.get('/task2/makeInitials', async (request, reply) => {
    const { surname, name, patronymic } = request.query;

    if (!surname || !name) {
      reply.code(400);
      return { error: "Фамилия и Имя обязательны." };
    }

    // Берем первую букву имени и отчества (если есть)
    const firstnameLetter = name.charAt(0).toUpperCase();
    const surnameLetter = patronymic ? patronymic.charAt(0).toUpperCase() : '';

    return {
      lastname: surname,
      firstnameLetter,
      surnameLetter
    };
  });

  // Эндпоинт 2: makeProjectStatus
  // GET /api/lab7/task2/makeProjectStatus?surname=...&name=...&patronymic=...&hasProject=true
  fastify.get('/task2/makeProjectStatus', async (request, reply) => {
    const { surname, name, patronymic, hasProject } = request.query;

    if (!surname || !name) {
      reply.code(400);
      return { error: "Фамилия и Имя обязательны." };
    }

    // Формируем инициалы
    const initials = `${name.charAt(0).toUpperCase()}.${patronymic ? patronymic.charAt(0).toUpperCase() + '.' : ''}`;
    
    // Определяем статус
    // hasProject придет как строка "true" или "false", преобразуем в булево
    const isParticipating = (hasProject === 'true');
    const projectParticipant = isParticipating ? "Участвует" : "Не участвует";

    return {
      lastname: surname,
      initials: initials, // Или можно разбить на буквы, как в задании 1, но здесь просили initials
      projectParticipant
    };
  });


}