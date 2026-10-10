export const initialsQuerySchema = {
  type: 'object',
  properties: {
    surname: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1 },
    patronymic: { type: 'string' },
  },
  required: ['surname', 'name'],
};

export const projectStatusQuerySchema = {
  type: 'object',
  properties: {
    surname: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1 },
    patronymic: { type: 'string' },
    hasProject: { type: 'string', enum: ['true', 'false'] },
    projectName: { type: 'string' },
    gender: { type: 'string' },
    faculty: { type: 'string' },
  },
  required: ['surname', 'name', 'hasProject'],
};
