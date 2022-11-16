import { Input, InputNumber, InputRef, Tooltip, TreeSelect } from "antd";
import { CSSProperties, useCallback, useRef, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggingStyle,
  NotDraggingStyle,
  resetServerContext,
} from "react-beautiful-dnd";
import { Timeline } from "./timeline.util";

resetServerContext();

const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const getListStyle = (isDraggingOver: boolean) =>
  ({
    background: isDraggingOver ? "lightblue" : "#fff",
    padding: grid,
    width: 450,
  } as CSSProperties);

const getItemStyle = (
  isDragging: boolean,
  draggableStyle: DraggingStyle | NotDraggingStyle | undefined
) =>
  ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: isDragging ? "lightgreen" : "#fff",
    border: "1px dashed #ccc",

    // styles we need to apply on draggables
    ...draggableStyle,
  } as CSSProperties);

interface TreeData {
  key: string;
  value: string;
  title: string;
  task?: Timeline.Task;
  children: TreeData[];
  selectable: boolean;
}

function getDepenTask(
  task: Timeline.Task,
  otherAuthorTasks: { author: string; tasks: Timeline.Task[] }[]
) {
  const filterTasks: Timeline.Task[] = [];
  otherAuthorTasks.forEach((otaskData) => {
    otaskData.tasks.forEach((otask) => {
      if (task.waitTaskIds.includes(otask.id)) {
        filterTasks.push(otask);
      }
    });
  });
  if (filterTasks.length === 0) {
    return null;
  }
  const text = filterTasks.map((o) => `author: ${o.author}: ${o.name}`);
  return (
    <Tooltip
      title={
        <>
          {filterTasks.map((task) => (
            <p key={task.id}>
              author: {task.author}: {task.name}
            </p>
          ))}
        </>
      }
    >
      <span style={{ textDecoration: "underline" }}>【等待】</span>
    </Tooltip>
  );
}

export function TimeSortableComponent({
  tasks,
  onChange,
  otherAuthorTasks,
}: {
  tasks: Timeline.Task[];
  otherAuthorTasks: { author: string; tasks: Timeline.Task[] }[];
  onChange: (tasks: Timeline.Task[]) => void;
}) {
  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) {
        return;
      }

      const changedTasks = reorder(
        tasks,
        result.source.index,
        result.destination.index
      );
      onChange(changedTasks);
    },
    [tasks, onChange]
  );

  const treeData: TreeData[] = otherAuthorTasks.map((data) => ({
    key: data.author,
    value: data.author,
    title: data.author,
    selectable: false,
    children: data.tasks.map((d) => ({
      key: d.id,
      value: d.id,
      title: d.name,
      task: d,
      children: [],
      selectable: true,
    })),
  }));

  const [selectModeIndex, setselectModeIndex] = useState<number>(-1);
  const [inputModeIndex, setinputModeIndex] = useState<number>(-1);
  const [inputTaskIndex, setinputTaskIndex] = useState<number>(-1);
  // const [selectModeValues, setselectModeValues] = useState<string[]>([]);
  const inputNumberRef = useRef<HTMLInputElement>(null);
  const inputTaskRef = useRef<InputRef>(null);

  const onSubmit = useCallback(
    (item: Timeline.Task) => {
      if (inputNumberRef.current?.value) {
        onChange(
          tasks.map((task) => {
            if (task === item) {
              return {
                ...task,
                durationInHour: parseInt(inputNumberRef.current!.value),
              };
            }
            return task;
          })
        );
      }

      setinputModeIndex(-1);
    },
    [tasks, onChange]
  );

  const onSubmitTaskName = useCallback(
    (item: Timeline.Task) => {
      if (inputTaskRef && inputTaskRef.current?.input?.value) {
        onChange(
          tasks.map((task) => {
            if (task === item) {
              return {
                ...task,
                name: inputTaskRef.current?.input?.value!,
              };
            }
            return task;
          })
        );
      }

      setinputTaskIndex(-1);
    },
    [tasks, onChange]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
          >
            {tasks.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={getItemStyle(
                      snapshot.isDragging,
                      provided.draggableProps.style
                    )}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <label>
                        [{item.feature}]{item.name}({item.durationInHour}h)
                        {getDepenTask(item, otherAuthorTasks)}
                      </label>

                      <div style={{ display: "flex", gap: 8 }}>
                        {index === inputTaskIndex ? (
                          <Input
                            defaultValue={item.name}
                            ref={inputTaskRef}
                            onBlur={() => {
                              onSubmitTaskName(item);
                            }}
                            onPressEnter={() => {
                              onSubmitTaskName(item);
                            }}
                          />
                        ) : (
                          <a
                            onClick={(e) => {
                              e.stopPropagation();
                              setinputTaskIndex(index);
                            }}
                          >
                            内容
                          </a>
                        )}

                        {index === selectModeIndex ? (
                          <TreeSelect
                            style={{ width: "100%", minWidth: 150 }}
                            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                            placeholder="Please select"
                            allowClear
                            multiple
                            showCheckedStrategy="SHOW_PARENT"
                            onChange={(values, labelList, extra) => {
                              onChange(
                                tasks.map((task) => {
                                  if (task === item) {
                                    return {
                                      ...task,
                                      waitTaskIds: [
                                        ...task.waitTaskIds,
                                        ...values,
                                      ],
                                    };
                                  }
                                  return task;
                                })
                              );
                            }}
                            onBlur={() => {
                              setselectModeIndex(-1);
                            }}
                            treeData={treeData}
                          ></TreeSelect>
                        ) : (
                          <a
                            onClick={(e) => {
                              e.stopPropagation();
                              setselectModeIndex(index);
                            }}
                          >
                            等待
                          </a>
                        )}

                        {index === inputModeIndex ? (
                          <InputNumber
                            step={1}
                            min={0}
                            defaultValue={item.durationInHour}
                            ref={inputNumberRef}
                            max={1000}
                            onBlur={() => {
                              onSubmit(item);
                            }}
                            onPressEnter={() => {
                              onSubmit(item);
                            }}
                          />
                        ) : (
                          <a
                            onClick={(e) => {
                              e.stopPropagation();
                              setinputModeIndex(index);
                            }}
                          >
                            时间
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
