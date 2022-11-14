import { Button, Select, TreeSelect } from "antd";
import Image from "next/image";
import { CSSProperties, useCallback, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggingStyle,
  NotDraggingStyle,
} from "react-beautiful-dnd";
import { Timeline } from "./timeline.util";

const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const getListStyle = (isDraggingOver: boolean) =>
  ({
    background: isDraggingOver ? "lightblue" : "lightgrey",
    padding: grid,
    width: 250,
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
    background: isDragging ? "lightgreen" : "grey",

    // styles we need to apply on draggables
    ...draggableStyle,
  } as CSSProperties);

interface TreeData {
  key: string;
  value: string;
  title: string;
  task?: Timeline.Task;
  children: TreeData[];
}

function getTreeData(tasks: Timeline.Task[]) {}

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
    [tasks]
  );

  const treeData: TreeData[] = otherAuthorTasks.map((data) => ({
    key: data.author,
    value: data.author,
    title: data.author,
    children: data.tasks.map((d) => ({
      key: d.id,
      value: d.id,
      title: d.name,
      task: d,
      children: [],
    })),
  }));

  const [selectModeIndex, setselectModeIndex] = useState<number>(-1);
  const [selectModeValues, setselectModeValues] = useState<string[]>([]);

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
                      </label>

                      {index === selectModeIndex ? (
                        <TreeSelect
                          style={{ width: "100%" }}
                          dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                          placeholder="Please select"
                          allowClear
                          treeCheckable
                          showCheckedStrategy="SHOW_PARENT"
                          onChange={(values, labelList, extra) => {
                            console.log(values, labelList, extra, "12312");
                            // selectModeValues(values)
                          }}
                          treeData={treeData}
                        ></TreeSelect>
                      ) : (
                        <Image
                          src="/plus.svg"
                          alt="plus"
                          width={16}
                          height={16}
                        />
                      )}
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
