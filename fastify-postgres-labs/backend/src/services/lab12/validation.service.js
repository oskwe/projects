const FACULTY_CODES = ['ПИ', 'ИТ', 'БИ', 'ЭС', 'МХ', 'ЮФ', 'ФК'];

const fullNameRegexp = /^[А-ЯЁа-яё]+(?:[ -][А-ЯЁа-яё]+)*$/u;
const recordBookRegexp = /^(ПИ|ИТ|БИ|ЭС|МХ|ЮФ|ФК)-?2[0-5]0[1-4]\d{1,2}$/u;
const groupRegexp = /^(ПИ|ИТ|БИ|ЭС|МХ|ЮФ|ФК)-?2[0-5]0[1-4]$/u;

function cleanStudentPayload(payload = {}) {
  return {
    fullName: typeof payload.fullName === 'string' ? payload.fullName.trim() : '',
    recordBookNumber: typeof payload.recordBookNumber === 'string' ? payload.recordBookNumber.trim() : '',
    group: typeof payload.group === 'string' ? payload.group.trim() : '',
  };
}

function validateStudent(payload = {}) {
  const student = cleanStudentPayload(payload);
  const errors = [];

  if (!fullNameRegexp.test(student.fullName)) {
    errors.push('ФИО должно содержать только русские буквы, пробелы и дефисы.');
  }

  if (!recordBookRegexp.test(student.recordBookNumber)) {
    errors.push('Зачётка должна содержать группу и номер варианта, например ПИ240215.');
  }

  if (!groupRegexp.test(student.group)) {
    errors.push('Группа должна соответствовать шаблону ПИ2402 или ПИ-2402: год 20-25, номер 01-04, код факультета из списка.');
  }

  return {
    ok: errors.length === 0,
    errors,
    student,
  };
}

function getRules() {
  return {
    fullName: {
      pattern: fullNameRegexp.source,
      example: 'Мясников Никита Сергеевич',
    },
    recordBookNumber: {
      pattern: recordBookRegexp.source,
      example: 'ПИ240215',
    },
    group: {
      pattern: groupRegexp.source,
      example: 'ПИ2402',
      facultyCodes: FACULTY_CODES,
    },
  };
}

export {
  FACULTY_CODES,
  fullNameRegexp,
  recordBookRegexp,
  groupRegexp,
  cleanStudentPayload,
  validateStudent,
  getRules,
};
