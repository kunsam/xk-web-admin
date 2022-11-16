import { Button, Input } from "antd";
import TextArea from "antd/lib/input/TextArea";
import Image from "next/image";
import TimelineComponent from "react-calendar-timeline";
import { useEffect, useRef, useState } from "react";
import {
  generateUUID,
  generaTimeline,
  generaTimelineGraph,
  getTasksFromOriginData,
  Timeline,
} from "./timeline.util";
import dynamic from "next/dynamic";
import clipboard from "clipboardy";
import type { Graph } from "@antv/x6";
import drawTimelineGraph from "./timeline.graph";
import "react-calendar-timeline/lib/Timeline.css";
import { addMonths, addYears } from "date-fns";

const TimeSortableComponent = dynamic(
  () => import("./timeline.sortable").then((r) => r.TimeSortableComponent),
  {
    ssr: false,
  }
);

interface TimelineCalItem {
  id: string;
  group: string;
  title: string;
  start_time: number | Date;
  end_time: number | Date;
}

const demoData: Timeline.AuthorTaskOrigin[] = [
  {
    author: "sk",
    feature: "X",
    text: `
      做X1(5h)
      做X2(10h)
      做X3(12h)
    `,
  },
  {
    author: "yh",
    feature: "Y",
    text: `
      做Y1(5h)
      做Y2(16h)
      做Y3(12h)
    `,
  },
  {
    author: "xy",
    feature: "Z",
    text: `
      做Z1(5h)
      做Z2(10h)
      做Z3(12h)
    `,
  },
];

const tasks = getTasksFromOriginData(demoData);

tasks.forEach((task) => {
  if (task.name.includes("Y1")) {
    const findTask = tasks.find((t) => t.name.includes("X1"));
    task.waitTaskIds.push(findTask!.id);
  }
  if (task.name.includes("Z1")) {
    const findTask = tasks.find((t) => t.name.includes("Y1"));
    task.waitTaskIds.push(findTask!.id);
  }
  if (task.name.includes("Y2")) {
    const findTask = tasks.find((t) => t.name.includes("X2"));
    task.waitTaskIds.push(findTask!.id);
  }
  if (task.name.includes("Z3")) {
    const findTask1 = tasks.find((t) => t.name.includes("X3"));
    const findTask2 = tasks.find((t) => t.name.includes("Y2"));
    task.waitTaskIds.push(findTask1!.id);
    task.waitTaskIds.push(findTask2!.id);
  }
});

const initMap: Map<string, Timeline.Task[]> = new Map();
tasks.forEach((task) => {
  const prev = initMap.get(task.author) || [];
  initMap.set(task.author, [...prev, task]);
});

const minTime = addYears(new Date(), -1).getTime();
const maxTime = addYears(new Date(), 1).getTime();

export default function TimelinePage() {
  const [preCommitData, setpreCommitData] = useState<
    Timeline.AuthorTaskOrigin | undefined
  >();

  const [updateDirtyTime, setupdateDirtyTime] = useState<number>(0);
  // const [resultText, setresultText] = useState<string>("");
  const [taskList, settaskList] =
    useState<Map<string, Timeline.Task[]>>(initMap);

  const [timeLineGroups, settimeLineGroups] = useState<
    { id: string; title: string }[]
  >([]);
  const [timeLineItems, settimeLineItems] = useState<TimelineCalItem[]>([]);

  const canvasRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph>();

  const taskByAuthors: {
    author: string;
    tasks: Timeline.Task[];
    others: { author: string; tasks: Timeline.Task[] }[];
  }[] = [];

  taskList.forEach((data, author) => {
    const others: { author: string; tasks: Timeline.Task[] }[] = [];
    taskList.forEach((otasks, otherAuthor) => {
      if (author === otherAuthor) {
        return;
      }
      others.push({
        author: otherAuthor,
        tasks: otasks,
      });
    });

    taskByAuthors.push({
      author,
      others,
      tasks: data,
    });
  });

  useEffect(() => {
    const graph = generaTimelineGraph(taskList);
    if (graphRef.current) {
      graphRef.current.clearGrid();
      graphRef.current.dispose();
    }
    graphRef.current = drawTimelineGraph(graph, canvasRef.current!);
  }, [updateDirtyTime, taskList]);

  return (
    <div style={{ padding: 5, width: "100vw" }}>
      <div>demo</div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          paddingBottom: 5,
          borderBottom: "1px dashed #ccc",
        }}
      >
        <Button
          onClick={() => {
            setpreCommitData({
              author: "",
              feature: "",
              text: "",
            });
          }}
        >
          添加开发者
        </Button>

        <Button
          onClick={() => {
            const { authorTaskMap } = generaTimeline(taskList);
            const groups: { id: string; title: string }[] = [];
            const items: TimelineCalItem[] = [];
            authorTaskMap.forEach((tasks, author) => {
              groups.push({ id: author, title: `${author}任务` });
              tasks.forEach((task) => {
                items.push({
                  id: task.id,
                  group: task.author,
                  title: task.name,
                  start_time: task.startDate.getTime(),
                  end_time: task.endDate.getTime(),
                });
              });
            });
            settimeLineGroups(groups);
            settimeLineItems(items);
          }}
        >
          生成Timeline
        </Button>

        <Button
          onClick={() => {
            const { text } = generaTimeline(taskList);
            clipboard.write(text).then(() => {
              window.open("https://markwhen.com/");
            });
          }}
        >
          打开第三方Timeline
        </Button>
      </div>

      {!preCommitData ? null : (
        <div style={{ padding: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label>Author:</label>
              <Input
                width={100}
                onChange={(e) => {
                  setpreCommitData({
                    ...preCommitData,
                    author: e.target.value,
                  });
                }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label>FeatureName:</label>
              <Input
                width={100}
                placeholder="可以不填"
                onChange={(e) => {
                  setpreCommitData({
                    ...preCommitData,
                    feature: e.target.value,
                  });
                }}
              />
            </div>
            <div>
              <Button
                type="primary"
                onClick={() => {
                  const tasks = getTasksFromOriginData([preCommitData]);
                  settaskList((prevMap) => {
                    tasks.forEach((task) => {
                      const prev = prevMap.get(task.author) || [];
                      prevMap.set(task.author, [...prev, task]);
                    });
                    return prevMap;
                  });
                  setupdateDirtyTime(new Date().getTime());
                  setpreCommitData(undefined);
                }}
              >
                确认
              </Button>
              <Button
                onClick={() => {
                  setpreCommitData(undefined);
                }}
              >
                取消
              </Button>
            </div>
          </div>

          <TextArea
            style={{ width: "80%", marginTop: 10 }}
            onChange={(e) => {
              setpreCommitData({
                ...preCommitData,
                text: e.target.value,
              });
            }}
          />
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          borderBottom: "1px dashed #ccc",
        }}
      >
        {taskByAuthors.map((data) => (
          <div
            key={data.author}
            style={{
              padding: 14,
              margin: 10,
              border: "1px solid #ccc",
              boxShadow:
                "rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h3 style={{ textAlign: "center", margin: 0 }}>
                author: {data.author}
              </h3>
              <a
                onClick={() => {
                  settaskList((prevMap) => {
                    prevMap.set(data.author, [
                      ...data.tasks,
                      {
                        id: generateUUID(),
                        name: "任务",
                        author: data.author,
                        feature: data.tasks[0].feature || "",
                        durationInHour: 0,
                        waitTaskIds: [],
                      },
                    ]);
                    return prevMap;
                  });
                  setupdateDirtyTime(new Date().getTime());
                }}
              >
                添加任务
              </a>
              <a
                onClick={() => {
                  settaskList((prevMap) => {
                    prevMap.delete(data.author);
                    return prevMap;
                  });
                  setupdateDirtyTime(new Date().getTime());
                }}
              >
                删除
              </a>
            </div>
            <TimeSortableComponent
              tasks={data.tasks}
              otherAuthorTasks={data.others}
              onChange={(ntasks) => {
                settaskList((prevMap) => {
                  prevMap.set(data.author, ntasks);
                  return prevMap;
                });
                setupdateDirtyTime(new Date().getTime());
              }}
            />
          </div>
        ))}
      </div>

      <h3>工作流示意图</h3>
      <div ref={canvasRef} style={{ width: "80%", height: 400 }}></div>

      <div style={{ padding: 20 }}>
        <TimelineComponent
          groups={timeLineGroups}
          items={timeLineItems}
          minZoom={60 * 60 * 1000 * 24}
          maxZoom={2 * 365.24 * 86400 * 1000}
          defaultTimeStart={new Date()}
          defaultTimeEnd={addMonths(new Date(), 1)}
          onTimeChange={(
            visibleTimeStart,
            visibleTimeEnd,
            updateScrollCanvas
          ) => {
            if (visibleTimeStart < minTime && visibleTimeEnd > maxTime) {
              updateScrollCanvas(minTime, maxTime);
            } else if (visibleTimeStart < minTime) {
              updateScrollCanvas(
                minTime,
                minTime + (visibleTimeEnd - visibleTimeStart)
              );
            } else if (visibleTimeEnd > maxTime) {
              updateScrollCanvas(
                maxTime - (visibleTimeEnd - visibleTimeStart),
                maxTime
              );
            } else {
              updateScrollCanvas(visibleTimeStart, visibleTimeEnd);
            }
          }}
          // visibleTimeStart={addYears(new Date(), -1).getTime()}
          // visibleTimeEnd={addYears(new Date(), 1).getTime()}
          // defaultTimeEnd={moment().add(12, 'hour')}
        />
      </div>
    </div>
  );
}
