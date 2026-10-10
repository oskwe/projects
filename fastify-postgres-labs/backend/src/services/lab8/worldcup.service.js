import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const lab8DataDir = path.join(__dirname, '..', '..', '..', 'data', 'lab8');
const task2Dir = path.join(lab8DataDir, 'task2');
const task3Dir = path.join(lab8DataDir, 'task3');
const cupFilePath = path.join(task2Dir, 'cup.txt');
const groupsFilePath = path.join(task2Dir, 'groups.json');
const stadiumFilePath = path.join(task2Dir, 'stadium.json');
const resultsFilePath = path.join(task3Dir, 'resultsQatar22.json');
const cupUrl = 'https://raw.githubusercontent.com/openfootball/worldcup/master/2022--qatar/cup.txt';

const monthNumbers = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  May: '05',
  Jun: '06',
  Jul: '07',
  Aug: '08',
  Sep: '09',
  Oct: '10',
  Nov: '11',
  Dec: '12',
};

const groupTeams = {
  'Group A': ['Qatar', 'Ecuador', 'Senegal', 'Netherlands'],
  'Group B': ['England', 'Iran', 'USA', 'Wales'],
  'Group C': ['Argentina', 'Saudi Arabia', 'Mexico', 'Poland'],
  'Group D': ['France', 'Australia', 'Denmark', 'Tunisia'],
  'Group E': ['Spain', 'Costa Rica', 'Germany', 'Japan'],
  'Group F': ['Belgium', 'Canada', 'Morocco', 'Croatia'],
  'Group G': ['Brazil', 'Serbia', 'Switzerland', 'Cameroon'],
  'Group H': ['Portugal', 'Ghana', 'Uruguay', 'South Korea'],
};

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function normalizeCupText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/(Group [A-H] \|)/g, '\n$1')
    .replace(/(▪ Matchday \d+ \|)/g, '\n$1')
    .replace(/(▪ Group [A-H])/g, '\n$1')
    .replace(/((?:Sun|Mon|Tue|Wed|Thu|Fri|Sat) (?:Nov|Dec) \d{1,2})/g, '\n$1')
    .replace(/\n+/g, '\n')
    .trim();
}

function parseDate(dateText) {
  const match = dateText.match(/(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat) (Nov|Dec) (\d{1,2})/);
  if (!match) {
    return '';
  }
  return `2022-${monthNumbers[match[1]]}-${match[2].padStart(2, '0')}`;
}

function parseMatchLine(line, group, previousDate, previousTime) {
  const dateMatch = line.match(/^((?:Sun|Mon|Tue|Wed|Thu|Fri|Sat) (?:Nov|Dec) \d{1,2})\s+(.*)$/);
  const dateText = dateMatch ? dateMatch[1] : previousDate;
  const rest = dateMatch ? dateMatch[2] : line;
  const match = rest.match(/^(?:(\d{1,2}:\d{2})\s+)?(.+?)\s+(\d+)-(\d+)(?:\s+\([^)]+\))?\s+(.+?)\s+@\s+(.+?)(?:\s+\(|$)/);

  if (!match || !dateText) {
    return null;
  }

  return {
    group,
    date: parseDate(dateText),
    time: match[1] || previousTime,
    team1: match[2].trim(),
    score: `${match[3]}-${match[4]}`,
    team2: match[5].trim(),
    stadium: match[6].trim(),
  };
}

function parseCup(text) {
  const lines = normalizeCupText(text).split('\n').map((line) => line.trim()).filter(Boolean);
  const groupMap = new Map(
    Object.entries(groupTeams).map(([group, teams]) => [group, { group, teams, matches: [] }]),
  );
  const matches = [];
  let currentGroup = '';
  let currentDate = '';
  let currentTime = '';

  for (const line of lines) {
    const groupHeader = line.match(/^▪ Group ([A-H])$/);
    if (groupHeader) {
      currentGroup = `Group ${groupHeader[1]}`;
      currentDate = '';
      currentTime = '';
      continue;
    }

    const dateMatch = line.match(/^((?:Sun|Mon|Tue|Wed|Thu|Fri|Sat) (?:Nov|Dec) \d{1,2})/);
    if (dateMatch) {
      currentDate = dateMatch[1];
    }

    if (currentGroup) {
      const parsedMatch = parseMatchLine(line, currentGroup, currentDate, currentTime);
      if (parsedMatch) {
        currentTime = parsedMatch.time;
        matches.push(parsedMatch);
        groupMap.get(currentGroup).matches.push(parsedMatch);
      }
    }
  }

  const groups = Array.from(groupMap.values());
  const stadiums = Array.from(
    matches.reduce((map, match) => {
      if (!map.has(match.stadium)) {
        map.set(match.stadium, { stadium: match.stadium, matches: [] });
      }
      map.get(match.stadium).matches.push(match);
      return map;
    }, new Map()).values(),
  ).sort((a, b) => a.stadium.localeCompare(b.stadium));

  const results = [...matches].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  return { groups, stadiums, results };
}

class WorldCupService {
  async ensureCupFile() {
    try {
      return await fs.readFile(cupFilePath, 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    const response = await fetch(cupUrl);
    if (!response.ok) {
      throw new Error(`Не удалось скачать cup.txt: ${response.status}`);
    }

    const text = await response.text();
    await fs.mkdir(task2Dir, { recursive: true });
    await fs.writeFile(cupFilePath, text, 'utf8');
    return text;
  }

  async buildFiles() {
    const cupText = await this.ensureCupFile();
    const parsed = parseCup(cupText);
    await writeJson(groupsFilePath, parsed.groups);
    await writeJson(stadiumFilePath, parsed.stadiums);
    await writeJson(resultsFilePath, parsed.results);
    return parsed;
  }

  async getGroups() {
    return (await this.buildFiles()).groups;
  }

  async getStadiums() {
    return (await this.buildFiles()).stadiums;
  }

  async getResults() {
    return (await this.buildFiles()).results;
  }
}

export default new WorldCupService();
