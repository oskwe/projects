import {
  cleanStudentPayload,
  getRules,
  validateStudent,
} from '../../services/lab12/validation.service.js';

const studentBodySchema = {
  type: 'object',
  required: ['fullName', 'recordBookNumber', 'group'],
  additionalProperties: false,
  properties: {
    fullName: {
      type: 'string',
      minLength: 1,
      pattern: '^[А-ЯЁа-яё]+(?:[ -][А-ЯЁа-яё]+)*$',
    },
    recordBookNumber: {
      type: 'string',
      pattern: '^(ПИ|ИТ|БИ|ЭС|МХ|ЮФ|ФК)-?2[0-5]0[1-4]\\d{1,2}$',
    },
    group: {
      type: 'string',
      pattern: '^(ПИ|ИТ|БИ|ЭС|МХ|ЮФ|ФК)-?2[0-5]0[1-4]$',
    },
  },
};

function sendValidationError(reply, errors) {
  return reply.code(400).send({
    error: 'Данные не прошли серверную проверку',
    details: errors,
  });
}

export default async function lab12Routes(fastify) {
  fastify.get('/', async () => ({
    lab: '12',
    topic: 'Регулярные выражения',
    routes: ['/no-check', '/manual-check', '/schema-check', '/rules'],
  }));

  fastify.get('/rules', async () => getRules());

  fastify.post('/no-check', async (request) => ({
    message: 'Запрос принят без серверной проверки. Этот способ можно обойти.',
    method: 'no-check',
    student: cleanStudentPayload(request.body),
  }));

  fastify.post('/manual-check', async (request, reply) => {
    const result = validateStudent(request.body);

    if (!result.ok) {
      return sendValidationError(reply, result.errors);
    }

    return {
      message: 'Ручная проверка через RegExp успешно пройдена',
      method: 'manual-check',
      student: result.student,
    };
  });

  fastify.post(
    '/schema-check',
    {
      schema: {
        body: studentBodySchema,
      },
    },
    async (request) => ({
      message: 'Валидация JSON Schema успешно пройдена',
      method: 'schema-check',
      student: cleanStudentPayload(request.body),
    }),
  );
}
