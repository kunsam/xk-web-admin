// + 号，添加一个Feature
// 使用Demo数据
// 填写完之后，每个任务出现下拉框，选择需要依赖的任务
// 可以拖动排序任务

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
}

const demoData: Timeline.AuthorTaskOrigin[] = [
  {
    author: "sk",
    feature: "X",
    text: `
      做A(5h)
      做B(10h)
      做C(12h)
    `,
  },
  {
    author: "yh",
    feature: "Y",
    text: `
      做X(5h)
      做Y(10h)
      做Z(12h)
    `,
  },
];
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
      const taskName = lineText.replace(/(\(|\（)\d+h(\)|\）)/g, "");
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
