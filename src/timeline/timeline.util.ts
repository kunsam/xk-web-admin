// + 号，添加一个Feature
// 使用Demo数据
// 填写完之后，每个任务出现下拉框，选择需要依赖的任务
// 可以拖动排序任务
import { DirectedGraph } from "graphology";
import {
  set,
  addHours,
  differenceInCalendarDays,
  format,
  isWithinInterval,
  differenceInHours,
  isSaturday,
  addDays,
  isSunday,
  max,
} from "date-fns";

export namespace Timeline {
  export interface AuthorTaskOrigin {
    author: string;
    feature: string;
    text: string;
  }
  export interface Task {
    id: string;
    name: string;
    author: string;
    feature: string;
    durationInHour: number;
    waitTaskIds: string[];
  }
  export interface TaskEnhance extends Task {
    startDate: Date;
    endDate: Date;
  }
}

const _lut: string[] = [];

for (let i = 0; i < 256; i += 1) {
  _lut[i] = (i < 16 ? "0" : "") + i.toString(16);
}

export function generateUUID() {
  // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136

  const d0 = (Math.random() * 0xffffffff) | 0;
  const d1 = (Math.random() * 0xffffffff) | 0;
  const d2 = (Math.random() * 0xffffffff) | 0;
  const d3 = (Math.random() * 0xffffffff) | 0;
  const uuid =
    _lut[d0 & 0xff] +
    _lut[(d0 >> 8) & 0xff] +
    _lut[(d0 >> 16) & 0xff] +
    _lut[(d0 >> 24) & 0xff] +
    _lut[d1 & 0xff] +
    _lut[(d1 >> 8) & 0xff] +
    _lut[((d1 >> 16) & 0x0f) | 0x40] +
    _lut[(d1 >> 24) & 0xff] +
    _lut[(d2 & 0x3f) | 0x80] +
    _lut[(d2 >> 8) & 0xff] +
    _lut[(d2 >> 16) & 0xff] +
    _lut[(d2 >> 24) & 0xff] +
    _lut[d3 & 0xff] +
    _lut[(d3 >> 8) & 0xff] +
    _lut[(d3 >> 16) & 0xff] +
    _lut[(d3 >> 24) & 0xff];

  // .toUpperCase() here flattens concatenated strings to save heap memory space.
  return uuid.toUpperCase();
}

export function getTasksFromOriginData(data: Timeline.AuthorTaskOrigin[]) {
  // getTask
  const tasks: Timeline.Task[] = [];
  data.forEach((item) => {
    const splitByLine = item.text.split("\n");
    splitByLine.forEach((lineText) => {
      if (/^[\s　]*$/.test(lineText.replace(/\n/g, ""))) {
        return;
      }
      const taskName = lineText
        .replace(/(\(|\（)\d+h(\)|\）)/g, "")
        .replace(/\n/g, "")
        .replace(/(^\s+)|(\s+$)/g, "");
      if (!taskName) {
        return;
      }

      let durationInHour: number = 0;
      const hourText = lineText.match(/(\(|\（)\d+h(\)|\）)/g);
      if (hourText && hourText[0]) {
        const fhourText = hourText[0]
          .replace(/\(|\（|\)|\）/g, "")
          .replace(/\"\'/g, "")
          .replace(/h/g, "");

        if (fhourText) {
          try {
            durationInHour = Number(fhourText);
          } catch {}
        }
      }

      // .replace(/\[.+\]/g, "")
      // .replace(/\(.+\)/g, "")
      // .replace(/\（.+\）/g, "")
      // .replace(/\{.+\}/g, "")
      // .replace(/\s/g, "");

      tasks.push({
        id: generateUUID(),
        name: taskName,
        author: item.author,
        feature: item.feature,
        durationInHour,
        waitTaskIds: [],
      });
    });
  });

  return tasks;
}

function getSameDayValidHour(
  startTime: Date,
  endTime: Date
): { lastestEndTime: Date; validHour: number } {
  // TODO HolidDay
  if (isSaturday(startTime)) {
    return { lastestEndTime: addDays(startTime, 2), validHour: 0 };
  } else if (isSunday(startTime)) {
    return { lastestEndTime: addDays(startTime, 1), validHour: 0 };
  }

  const sameDate9 = set(new Date(startTime), {
    hours: 9,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });
  const sameDate12 = set(new Date(startTime), {
    hours: 12,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });
  const sameDate14 = set(new Date(startTime), {
    hours: 14,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });
  const sameDate18 = set(new Date(startTime), {
    hours: 18,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });
  const sameDate24 = set(new Date(startTime), {
    hours: 24,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });
  const tomorrowStart = set(new Date(endTime), {
    date: endTime.getDate() + 1,
    hours: 9,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });
  if (isWithinInterval(startTime, { start: sameDate9, end: sameDate12 })) {
    if (isWithinInterval(endTime, { start: sameDate9, end: sameDate12 })) {
      return {
        validHour: differenceInHours(endTime, startTime),
        lastestEndTime: endTime,
      };
    } else if (
      isWithinInterval(endTime, { start: sameDate12, end: sameDate14 })
    ) {
      return {
        validHour: 3,
        lastestEndTime: sameDate14,
      };
    } else if (
      isWithinInterval(endTime, { start: sameDate14, end: sameDate18 })
    ) {
      return {
        validHour: 3 + differenceInHours(endTime, sameDate14),
        lastestEndTime: endTime,
      };
    } else if (
      isWithinInterval(endTime, { start: sameDate18, end: sameDate24 })
    ) {
      return {
        validHour: 3 + 4,
        lastestEndTime: tomorrowStart,
      };
    }
  } else if (
    isWithinInterval(startTime, { start: sameDate12, end: sameDate14 })
  ) {
    if (isWithinInterval(endTime, { start: sameDate14, end: sameDate18 })) {
      return {
        validHour: differenceInHours(endTime, sameDate14),
        lastestEndTime: endTime,
      };
    } else if (
      isWithinInterval(endTime, { start: sameDate18, end: sameDate24 })
    ) {
      return {
        validHour: 4,
        lastestEndTime: tomorrowStart,
      };
    }
  } else if (
    isWithinInterval(startTime, { start: sameDate14, end: sameDate18 })
  ) {
    if (endTime.getHours() === 18) {
      return {
        validHour: differenceInHours(endTime, startTime),
        lastestEndTime: tomorrowStart,
      };
    } else if (
      isWithinInterval(endTime, { start: sameDate14, end: sameDate18 })
    ) {
      return {
        validHour: differenceInHours(endTime, startTime),
        lastestEndTime: endTime,
      };
    } else if (
      isWithinInterval(endTime, { start: sameDate18, end: sameDate24 })
    ) {
      return {
        validHour: differenceInHours(sameDate18, startTime),
        lastestEndTime: tomorrowStart,
      };
    }
  }
  return {
    validHour: 0,
    lastestEndTime: tomorrowStart,
  };
}

function getEndTimeWithLoop(startTime: Date, hour: number): Date {
  if (isSaturday(startTime)) {
    return getEndTimeWithLoop(addDays(startTime, 2), hour);
  } else if (isSunday(startTime)) {
    return getEndTimeWithLoop(addDays(startTime, 1), hour);
  }

  const endTime = addHours(startTime, hour);

  let diffDays = differenceInCalendarDays(endTime, startTime);

  let currentStartTime = new Date(startTime);
  let validHour = 0;
  let lastestEndTime: Date = endTime;

  while (diffDays > 0) {
    const currentEndTime = set(new Date(currentStartTime), {
      hours: 24,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
    const data = getSameDayValidHour(currentStartTime, currentEndTime);
    validHour += data.validHour;
    lastestEndTime = data.lastestEndTime;
    currentStartTime = set(addDays(currentStartTime, 1), {
      hours: 9,
    });
    diffDays--;
  }

  if (diffDays === 0) {
    const data = getSameDayValidHour(currentStartTime, endTime);
    validHour += data.validHour;
    lastestEndTime = data.lastestEndTime;
  }

  if (validHour < hour) {
    return getEndTimeWithLoop(lastestEndTime, hour - validHour);
  }
  return endTime;
}

function getTextFromTimelineFeature(
  authorOriginMap: Map<string, Timeline.TaskEnhance[]>
) {
  const colorMap: Map<string, string> = new Map();
  const authorIndexMap: Map<string, number> = new Map();
  let index = 1;
  authorOriginMap.forEach((_, author) => {
    if (!colorMap.has(author)) {
      const randomColor = Math.floor(Math.random() * 16777215).toString(16);
      colorMap.set(author, `#${randomColor}`);
      authorIndexMap.set(author, index);
      index++;
    }
  });
  let text = "";

  colorMap.forEach((color, colorKey) => {
    const index = authorIndexMap.get(colorKey);
    text += `#Color${index}: ${color}\n`;
  });

  const authorMap: Map<string, Map<string, Timeline.TaskEnhance[]>> = new Map();
  authorOriginMap.forEach((tasks, author) => {
    const prevAuthorMap: Map<string, Timeline.TaskEnhance[]> =
      authorMap.get(author) || new Map();
    tasks.forEach((item) => {
      const featureName = item.feature || item.author;
      const prev = prevAuthorMap.get(featureName) || [];
      prevAuthorMap.set(featureName, [...prev, item]);
    });

    authorMap.set(author, prevAuthorMap);
  });

  authorMap.forEach((featureMap, author) => {
    const index = authorIndexMap.get(author);

    featureMap.forEach((tasks, featureName) => {
      text += `section ${featureName} #Color${index} \n`;
      tasks.forEach((child) => {
        text += `${format(child.startDate, "MM/dd/yyyy")}-${format(
          child.endDate,
          "MM/dd/yyyy"
        )}: ${child.name} #Color${index} \n`;
      });
      text += `endSection\n\n`;
    });
  });
  return text;
}

export function generaTimelineGraph(map: Map<string, Timeline.Task[]>) {
  const graph = new DirectedGraph<Timeline.Task>();
  map.forEach((tasks) => {
    let preTask: Timeline.Task | undefined;
    tasks.forEach((task) => {
      graph.mergeNode(task.id, task);
      if (preTask) {
        graph.mergeEdge(preTask.id, task.id);
      }
      preTask = task;
    });
  });
  map.forEach((tasks) => {
    tasks.forEach((task) => {
      task.waitTaskIds.forEach((wid) => {
        graph.mergeEdge(wid, task.id);
      });
    });
  });
  return graph;
}

export function generaTimeline(map: Map<string, Timeline.Task[]>) {
  const graph = generaTimelineGraph(map);

  let currentNodes: string[] = [];

  graph.forEachNode((node) => {
    const inDegree = graph.inDegree(node);
    if (inDegree === 0) {
      currentNodes.push(node);
    }
  });

  let currentDate = new Date();
  const TaskEnhanceMap: Map<string, Timeline.TaskEnhance> = new Map();

  const visitSet = new Set();

  while (currentNodes.length) {
    const nextcurrentNodes: string[] = [];
    currentNodes.forEach((taskId) => {
      const task = graph.getNodeAttributes(taskId) as Timeline.Task;
      const neighbors = graph.inNeighbors(task.id);
      const allDates: Date[] = [];
      neighbors.forEach((nei) => {
        const ctaskE = TaskEnhanceMap.get(nei);
        if (ctaskE) {
          allDates.push(ctaskE.endDate);
        }
      });
      const maxDate = allDates.length ? max(allDates) : currentDate;
      const startDate = new Date(maxDate);
      const taskEnhance: Timeline.TaskEnhance = {
        ...task,
        startDate: new Date(startDate),
        endDate: getEndTimeWithLoop(new Date(startDate), task.durationInHour),
      };
      TaskEnhanceMap.set(taskEnhance.id, taskEnhance);
      graph.outNeighbors(taskId).forEach((outn) => {
        if (!visitSet.has(outn)) {
          // 防止循环
          visitSet.add(outn);
          nextcurrentNodes.push(outn);
        }
      });
    });
    currentNodes = nextcurrentNodes;
  }

  const retmap: Map<string, Timeline.TaskEnhance[]> = new Map();
  map.forEach((tasks, author) => {
    const rtasks = tasks.map((t) => TaskEnhanceMap.get(t.id)!);
    retmap.set(author, rtasks);
  });

  return {
    graph,
    authorTaskMap: retmap,
    text: getTextFromTimelineFeature(retmap),
  };
}
