import { Button, Input } from "antd";
import TextArea from "antd/lib/input/TextArea";
import Image from "next/image";
import { useRef, useState } from "react";
import {
  getTasksFromOriginData,
  Timeline,
} from "../src/timeline/timeline.util";

import { TimeSortableComponent } from "../src/timeline/timeline.sortable";

interface AuthorTasks {
  author: string;
  tasks: Timeline.Task[];
}

export default function Timeline() {
  const [preCommitData, setpreCommitData] = useState<
    Timeline.AuthorTaskOrigin | undefined
  >();

  const [taskList, settaskList] = useState<Map<string, Timeline.Task[]>>(
    new Map()
  );

  //   const taskByAuthorMapRef = useRef<Map<string, Timeline.Task[]>>(new Map());

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

  return (
    <div>
      <div>demo</div>
      <div style={{ display: "flex" }}>
        <div
          style={{ width: 100, height: 100 }}
          onClick={() =>
            setpreCommitData({
              author: "",
              feature: "",
              text: "",
            })
          }
        >
          <Image src="/plus.svg" alt="Vercel Logo" width={72} height={16} />
        </div>
      </div>
      {!preCommitData ? null : (
        <div>
          <div style={{ display: "flex" }}>
            <div style={{ display: "flex" }}>
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
            <div style={{ display: "flex" }}>
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
          </div>

          <TextArea
            onChange={(e) => {
              setpreCommitData({
                ...preCommitData,
                text: e.target.value,
              });
            }}
          />
          <div>
            <Button
              type="primary"
              onClick={() => {
                const tasks = getTasksFromOriginData([preCommitData]);
                settaskList((prevMap) => {
                  //   const nextTasks = [...list, ...tasks];
                  tasks.forEach((task) => {
                    const prev = prevMap.get(task.author) || [];
                    prevMap.set(task.author, [...prev, task]);
                  });

                  return prevMap;
                });
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
      )}
      <div style={{ display: "flex" }}>
        {taskByAuthors.map((data) => (
          <div key={data.author}>
            <TimeSortableComponent
              tasks={data.tasks}
              otherAuthorTasks={data.others}
              onChange={(ntasks) => {
                settaskList((prevMap) => {
                  prevMap.set(data.author, ntasks);
                  return prevMap;
                });
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
