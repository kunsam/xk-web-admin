import { Graph } from "@antv/x6";
import { DagreLayout } from "@antv/layout";
import { DirectedGraph } from "graphology";
import { Timeline } from "./timeline.util";

const ColorList: string[] = [];
for (let i = 0; i <= 20; i++) {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  ColorList.push(randomColor);
}

function getColorMap(
  authorOriginMap: Map<string, Timeline.Task[]> = new Map()
) {
  const colorMap: Map<string, string> = new Map();
  let index = 0;
  authorOriginMap.forEach((_, author) => {
    if (!colorMap.has(author)) {
      const randomColor = ColorList[index % 20];
      index++;
      colorMap.set(author, `#${randomColor}`);
    }
  });

  return colorMap;
}

function getAuthorMapFromGraph(graph: DirectedGraph<Timeline.Task>) {
  const authorOriginMap: Map<string, Timeline.Task[]> = new Map();
  graph.forEachNode((nodeId) => {
    const task = graph.getNodeAttributes(nodeId) as Timeline.Task;
    const prev = authorOriginMap.get(task.author) || [];

    authorOriginMap.set(task.author, [...prev, task]);
  });

  return authorOriginMap;
}

export default function drawTimelineGraph(
  graph: DirectedGraph<Timeline.Task>,
  container: HTMLDivElement
) {
  const nodes: any[] = [];
  const edges: any[] = [];

  const authorOriginMap = getAuthorMapFromGraph(graph);
  const colorMap = getColorMap(authorOriginMap);

  const ROW_GAP = 60;
  const COLUMN_GAP = 40;

  let rowHeight = 0;

  authorOriginMap.forEach((tasks) => {
    let columnWidth = 20;

    tasks.forEach((task) => {
      task.waitTaskIds.forEach((w) => {
        columnWidth += COLUMN_GAP;
      });
      const width = task.name.length * 13;
      nodes.push({
        id: task.id,
        shape: "rect",
        x: columnWidth,
        y: rowHeight,
        width: task.name.length * 13,
        height: 40,
        label: task.name,
        attrs: {
          body: {
            fill: colorMap.get(task.author),
            stroke: "transparent",
          },
          label: {
            fill: "#ffffff",
            fontSize: 10,
            overflow: "hidden",
          },
        },
      });
      columnWidth += width + COLUMN_GAP;
    });
    rowHeight += ROW_GAP;
  });

  graph.forEachNode((nodeId) => {
    const attr = graph.getNodeAttributes(nodeId) as Timeline.Task;
    nodes.push({
      id: nodeId,
      shape: "circle",
      width: 32,
      height: 32,
      label: attr.name,
      attrs: {
        body: {
          fill: "#5F95FF",
          stroke: "transparent",
        },
        label: {
          fill: "#ffffff",
        },
      },
    });
  });
  graph.forEachEdge((edgeid) => {
    const source = graph.getSourceAttributes(edgeid);
    const target = graph.getTargetAttributes(edgeid);
    edges!.push({
      source: source.id,
      target: target.id,
      attrs: {
        line: {
          stroke: "#A2B1C3",
          strokeWidth: 2,
        },
      },
    });
  });

  const ngraph = new Graph({
    container,
  });

  ngraph.fromJSON({ nodes, edges });

  //   const dagreLayout = new DagreLayout({
  //     type: "dagre",
  //     rankdir: "LR",
  //     align: "UR",
  //     ranksep: 35,
  //     nodesep: 15,
  //   });
  //   const model = dagreLayout.layout({ nodes, edges });

  //   ngraph.fromJSON(model);
  ngraph.centerContent();
  ngraph.enablePanning(); // 启用画布平移
  return ngraph;
}
