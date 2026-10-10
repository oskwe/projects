import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFilePath = path.join(__dirname, '..', '..', '..', 'data', 'lab8', 'task1.txt');

function firstLetter(value = '') {
  return value.trim().charAt(0).toUpperCase();
}

class Task1Service {
  makeInitials({ surname, name, patronymic = '' }) {
    return {
      lastname: surname.trim(),
      firstnameLetter: firstLetter(name),
      surnameLetter: firstLetter(patronymic),
    };
  }

  async readRecords() {
    try {
      const data = await fs.readFile(dataFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async writeRecords(records) {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(records, null, 2), 'utf8');
  }

  async makeProjectStatus(query) {
    const records = await this.readRecords();
    const nextId = records.length > 0 ? Math.max(...records.map((record) => record.id || 0)) + 1 : 1;
    const hasProject = query.hasProject === 'true';
    const initials = this.makeInitials(query);
    const record = {
      id: nextId,
      ...initials,
      gender: query.gender || '',
      faculty: query.faculty || '',
      projectName: hasProject ? query.projectName || '' : '',
      projectParticipant: hasProject ? 'Участвует' : 'Не участвует',
      createdAt: new Date().toISOString(),
    };

    records.push(record);
    await this.writeRecords(records);

    return {
      id: record.id,
      lastname: record.lastname,
      firstnameLetter: record.firstnameLetter,
      surnameLetter: record.surnameLetter,
      projectParticipant: record.projectParticipant,
    };
  }
}

export default new Task1Service();
