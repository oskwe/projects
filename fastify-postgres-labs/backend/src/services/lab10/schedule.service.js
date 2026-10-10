import lab10Service from './lab10.service.js';

const referenceConfigs = {
  departments: {
    directory: 'departments',
    fields: ['title'],
    fromApi: (payload) => ({ title: payload.title || payload.name }),
    toApi: (row) => ({ ...row, name: row.title }),
  },
  positions: {
    directory: 'positions',
    fields: ['title'],
    fromApi: (payload) => ({ title: payload.title || payload.name }),
    toApi: (row) => ({ ...row, name: row.title }),
  },
  persons: {
    directory: 'persons',
    fields: ['full_name', 'email'],
    fromApi: (payload) => ({ full_name: payload.full_name || payload.name, email: payload.email || '' }),
    toApi: (row) => ({ ...row, name: row.full_name }),
  },
  teachers: {
    directory: 'teachers',
    fields: ['person_id', 'department_id', 'position_id'],
    fromApi: (payload) => payload,
    toApi: (row) => ({ ...row, name: row.full_name }),
  },
  buildings: {
    directory: 'buildings',
    fields: ['title', 'address'],
    fromApi: (payload) => ({ title: payload.title || payload.name, address: payload.address || '' }),
    toApi: (row) => ({ ...row, name: row.title, building_code: row.title }),
  },
  rooms: {
    directory: 'classrooms',
    fields: ['building_id', 'title', 'capacity'],
    fromApi: (payload) => ({
      building_id: payload.building_id,
      title: payload.title || payload.name,
      capacity: payload.capacity || 0,
    }),
    toApi: (row) => ({
      ...row,
      name: row.title,
      roomLabel: `${row.building || ''} ${row.title || ''}`.trim(),
      building_code: row.building || '',
    }),
  },
  disciplines: {
    directory: 'disciplines',
    fields: ['title'],
    fromApi: (payload) => ({ title: payload.title || payload.name }),
    toApi: (row) => ({ ...row, name: row.title }),
  },
  groups: {
    directory: 'groups',
    fields: ['title'],
    fromApi: (payload) => ({ title: payload.title || payload.name }),
    toApi: (row) => ({ ...row, name: row.title }),
  },
  'lesson-types': {
    directory: 'lesson-types',
    fields: ['title'],
    fromApi: (payload) => ({ title: payload.title || payload.name }),
    toApi: (row) => ({ ...row, name: row.title }),
  },
};

export function getReferenceConfig(resource) {
  return referenceConfigs[resource] || null;
}

function normalizeEntry(row) {
  const start = String(row.start_time || row.starts_at || '').slice(0, 5);
  return {
    id: row.id,
    week_number: row.week,
    day_of_week: row.day_of_week,
    lesson_number: row.lesson_number || 1,
    starts_at: start,
    ends_at: row.ends_at || '',
    group_id: row.group_id,
    group_name: row.group_title,
    discipline_id: row.discipline_id,
    discipline_name: row.discipline,
    teacher_id: row.teacher_id,
    teacher_name: row.teacher,
    room_id: row.classroom_id,
    room_name: row.classroom,
    lesson_type_id: row.lesson_type_id,
    lesson_type_name: row.lesson_type,
    notes: row.notes || '',
  };
}

function toLab10Schedule(payload) {
  return {
    week: Number(payload.week_number),
    day_of_week: Number(payload.day_of_week),
    start_time: payload.starts_at,
    group_id: Number(payload.group_id),
    classroom_id: Number(payload.room_id),
    discipline_id: Number(payload.discipline_id),
    teacher_id: Number(payload.teacher_id),
    lesson_type_id: Number(payload.lesson_type_id),
  };
}

const scheduleService = {
  async listReference(db, resource) {
    const config = getReferenceConfig(resource);
    if (!config) {
      return [];
    }

    const rows = await lab10Service.listDirectory(db, config.directory);
    return rows.map(config.toApi);
  },

  async createReference(db, resource, payload) {
    const config = getReferenceConfig(resource);
    if (!config) {
      return null;
    }

    const item = await lab10Service.createDirectoryItem(db, config.directory, config.fromApi(payload));
    return config.toApi(item);
  },

  async updateReference(db, resource, id, payload) {
    const config = getReferenceConfig(resource);
    if (!config) {
      return null;
    }

    const item = await lab10Service.updateDirectoryItem(db, config.directory, id, config.fromApi(payload));
    return item ? config.toApi(item) : null;
  },

  async deleteReference(db, resource, id) {
    const config = getReferenceConfig(resource);
    if (!config) {
      return null;
    }

    return lab10Service.deleteDirectoryItem(db, config.directory, id);
  },

  async getScheduleEntries(db, query = {}) {
    const rows = await lab10Service.listSchedule(db, query);
    return rows.map(normalizeEntry);
  },

  async createScheduleEntry(db, payload) {
    const item = await lab10Service.createSchedule(db, toLab10Schedule(payload));
    const rows = await lab10Service.listSchedule(db, {});
    return normalizeEntry(rows.find((row) => row.id === item.id) || item);
  },

  async updateScheduleEntry(db, id, payload) {
    const item = await lab10Service.updateSchedule(db, id, toLab10Schedule(payload));
    if (!item) {
      return null;
    }

    const rows = await lab10Service.listSchedule(db, {});
    return normalizeEntry(rows.find((row) => row.id === item.id) || item);
  },

  async deleteScheduleEntry(db, id) {
    return lab10Service.deleteSchedule(db, id);
  },
};

export default scheduleService;
