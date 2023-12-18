import GraphStructures from "./GraphStrutures";
import NodeGraph from "./Node";

class Graph {
  // Propriedades
  order: number;
  numberEdges: number;
  directed: boolean;
  weightedEdge: boolean;
  weightedNode: boolean;
  firstNode: NodeGraph | null;
  lastNode: NodeGraph | null;

  // Construtor
  constructor(
    order: number,
    directed: boolean,
    weightedEdge: boolean,
    weightedNode: boolean
  ) {
    this.order = order;
    this.numberEdges = 0;
    this.directed = directed;
    this.weightedEdge = weightedEdge;
    this.weightedNode = weightedNode;
    this.firstNode = null;
    this.lastNode = null;
  }
  getOrder(): number {
    return this.order;
  }

  getNumberEdges(): number {
    return this.numberEdges;
  }

  getDirected(): boolean {
    return this.directed;
  }

  getWeightedEdge(): boolean {
    return this.weightedEdge;
  }

  getWeightedNode(): boolean {
    return this.weightedNode;
  }

  getFirstNode(): NodeGraph | null {
    return this.firstNode;
  }

  getLastNode(): NodeGraph | null {
    return this.lastNode;
  }

  insertNode(id: number): void {
    const newNode = new NodeGraph(id);
    newNode.nextNode = this.firstNode;
    this.firstNode = newNode;
  }

  insertEdge(sourceId: number, targetId: number, weight: number): void {
    const sourceNode = this.findNode(sourceId);
    const targetNode = this.findNode(targetId);

    if (sourceNode && targetNode) {
      if (
        !this.directed &&
        (sourceNode.hasEdge(targetId) || targetNode.hasEdge(sourceId))
      ) {
        return;
      }

      sourceNode.insertEdge(this.numberEdges, targetId, weight);

      if (!this.directed) {
        targetNode.insertEdge(this.numberEdges, sourceId, weight);
      }

      this.numberEdges++;
    }
  }

  removeNode(id: number): void {
    let currentNode = this.firstNode;
    let previousNode: NodeGraph | null = null;

    while (currentNode !== null && currentNode.id !== id) {
      previousNode = currentNode;
      currentNode = currentNode.nextNode;
    }

    if (currentNode !== null) {
      if (previousNode !== null) {
        previousNode.nextNode = currentNode.nextNode;
      } else {
        this.firstNode = currentNode.nextNode;
      }
    }
  }

  findNode(id: number): NodeGraph | null {
    let currentNode = this.firstNode;
    while (currentNode !== null && currentNode.id !== id) {
      currentNode = currentNode.nextNode;
    }
    return currentNode;
  }

  graphToGraphviz(): string {
    const isDirected = this.directed;
    let graphvizString = isDirected ? "digraph G {\n" : "graph G {\n";

    let currentNode = this.firstNode;
    const addedEdges: Set<string> = new Set();

    while (currentNode !== null) {
      graphvizString += `  ${currentNode.id};\n`;

      let currentEdge = currentNode.firstEdge;

      while (currentEdge !== null) {
        const edgeKey = `${currentNode.id}-${currentEdge.targetId}`;
        if (!addedEdges.has(edgeKey)) {
          const edgeLabel =
            currentEdge.weight !== 0 ? ` [label=${currentEdge.weight}]` : "";
          graphvizString += `  ${currentNode.id} ${isDirected ? "->" : "--"} ${
            currentEdge.targetId
          }${edgeLabel};\n`;

          addedEdges.add(edgeKey);

          if (!isDirected) {
            addedEdges.add(`${currentEdge.targetId}-${currentNode.id}`);
          }
        }

        currentEdge = currentEdge.nextEdge;
      }

      currentNode = currentNode.nextNode;
    }

    graphvizString += "}\n";

    return graphvizString;
  }

  depthFirstSearch(startNode: number): Graph {
    const adjacencyMatrix =
      GraphStructures.generateGraphStructures(this).adjacencyMatrix;
    const visited: boolean[] = Array(this.order).fill(false);
    const result = new Graph(
      this.order,
      this.directed,
      this.weightedEdge,
      this.weightedNode
    );

    const aux = (node: number) => {
      visited[node] = true;

      if (!result.findNode(node + 1)) result.insertNode(node + 1);

      for (let neighbor = 0; neighbor < this.order; neighbor++) {
        if (adjacencyMatrix[node][neighbor] && !visited[neighbor]) {
          if (!result.findNode(neighbor + 1)) result.insertNode(neighbor + 1);

          result.insertEdge(
            node + 1,
            neighbor + 1,
            adjacencyMatrix[node][neighbor]
          );
          aux(neighbor);
        }
      }
    };

    aux(startNode - 1);

    return result;
  }

  breadthFirstSearch(startNode: number): Graph {
    const adjacencyMatrix =
      GraphStructures.generateGraphStructures(this).adjacencyMatrix;
    const visited: boolean[] = Array(this.order).fill(false);
    const queue: number[] = [];
    const result = new Graph(
      this.order,
      this.directed,
      this.weightedEdge,
      this.weightedNode
    );

    visited[startNode - 1] = true;
    queue.push(startNode - 1);

    while (queue.length > 0) {
      const currentNode = queue.shift() as number;
      // result.push(currentNode + 1);
      if (!result.findNode(currentNode + 1)) result.insertNode(currentNode + 1);

      for (let neighbor = 0; neighbor < this.order; neighbor++) {
        if (adjacencyMatrix[currentNode][neighbor] && !visited[neighbor]) {
          visited[neighbor] = true;
          if (!result.findNode(neighbor + 1)) result.insertNode(neighbor + 1);
          result.insertEdge(
            currentNode + 1,
            neighbor + 1,
            adjacencyMatrix[currentNode][neighbor]
          );
          queue.push(neighbor);
        }
      }
    }

    return result;
  }

  agmPrim(): {
    edges: { source: number; target: number; weight: number }[];
    totalWeight: number;
  } {
    const adjacencyMatrix =
      GraphStructures.generateGraphStructures(this).adjacencyMatrix;
    const parent: number[] = new Array(this.order).fill(-1);
    const distances: number[] = new Array(this.order).fill(Number.MAX_VALUE);
    const visited: boolean[] = new Array(this.order).fill(false);

    distances[0] = 0;

    for (let count = 0; count < this.order - 1; count++) {
      const u = this.minDistance(distances, visited);
      visited[u] = true;

      for (let v = 0; v < this.order; v++) {
        if (
          adjacencyMatrix[u][v] &&
          !visited[v] &&
          adjacencyMatrix[u][v] < distances[v]
        ) {
          parent[v] = u;
          distances[v] = adjacencyMatrix[u][v];
        }
      }
    }

    return this.constructMST(parent);
  }

  constructMST(parent: number[]): {
    edges: { source: number; target: number; weight: number }[];
    totalWeight: number;
  } {
    const edges: { source: number; target: number; weight: number }[] = [];
    let totalWeight = 0;
    const adjacencyMatrix =
      GraphStructures.generateGraphStructures(this).adjacencyMatrix;

    for (let v = 1; v < this.order; v++) {
      const source = parent[v];
      const target = v;
      const weight = adjacencyMatrix[v][parent[v]];

      edges.push({ source, target, weight });
      totalWeight += weight;
    }

    return { edges: edges, totalWeight };
  }

  minDistance(distances: number[], visited: boolean[]): number {
    let min = Number.MAX_VALUE;
    let minIndex = -1;

    for (let node = 0; node < this.order; node++) {
      if (!visited[node] && distances[node] <= min) {
        min = distances[node];
        minIndex = node;
      }
    }

    return minIndex;
  }

  dijkstra(initialNode: number): {
    paths: { target: number; path: number[]; weight: number }[];
  } {
    const paths: { target: number; path: number[]; weight: number }[] = [];
    const visited: boolean[] = new Array(this.order).fill(false);
    const distances: number[] = new Array(this.order).fill(Number.MAX_VALUE);
    const parentDijkstra: number[][] = Array.from({ length: this.order }, () =>
      Array(this.order).fill(-1)
    );
    const adjacencyMatrix =
      GraphStructures.generateGraphStructures(this).adjacencyMatrix;

    distances[initialNode] = 0;

    for (let count = 0; count < this.order - 1; count++) {
      const u = this.minDistance(distances, visited);
      visited[u] = true;

      for (let v = 0; v < this.order; v++) {
        if (
          !visited[v] &&
          adjacencyMatrix[u][v] &&
          distances[u] !== Number.MAX_VALUE &&
          distances[u] + adjacencyMatrix[u][v] < distances[v]
        ) {
          distances[v] = distances[u] + adjacencyMatrix[u][v];
          parentDijkstra[initialNode][v] = u;
        }
      }
    }

    for (let v = 0; v < this.order; v++) {
      if (v !== initialNode) {
        const path = this.shortestPath(
          parentDijkstra[initialNode],
          initialNode,
          v
        );
        const weight = distances[v];
        paths.push({ target: v, path, weight });
      }
    }

    return { paths };
  }

  shortestPath(
    parentDijkstra: number[],
    initialNode: number,
    targetNode: number
  ): number[] {
    const path: number[] = [];

    let currentNode = targetNode;
    while (currentNode !== initialNode) {
      path.unshift(currentNode);
      currentNode = parentDijkstra[currentNode];
    }

    path.unshift(initialNode);
    return path;
  }

  eulerianCycle(): { edges: { source: number; target: number }[] } | null {
    if (!this.isConnected() || !this.hasEulerianCycle()) {
      return null;
    }
    const adjacencyMatrix =
      GraphStructures.generateGraphStructures(this).adjacencyMatrix;
    const visitedEdges: boolean[][] = Array.from({ length: this.order }, () =>
      Array(this.order).fill(false)
    );
    const cycleEdges: { source: number; target: number }[] = [];

    const depthFirstSearch = (node: number) => {
      for (let neighbor = 0; neighbor < this.order; neighbor++) {
        if (
          adjacencyMatrix[node][neighbor] !== 0 &&
          !visitedEdges[node][neighbor]
        ) {
          visitedEdges[node][neighbor] = true;
          visitedEdges[neighbor][node] = true;

          depthFirstSearch(neighbor);

          cycleEdges.push({ source: node, target: neighbor });
        }
      }
    };

    depthFirstSearch(0);

    return { edges: cycleEdges.reverse() };
  }

  isConnected(): boolean {
    let numNodes = 0;
    const graph = this.depthFirstSearch(1);
    let currentNodee = graph.firstNode;

    while (currentNodee != null) {
      numNodes++;
      currentNodee = currentNodee.nextNode;
    }

    return graph.order === numNodes;
  }

  hasEulerianCycle(): boolean {
    const adjacencyMatrix =
      GraphStructures.generateGraphStructures(this).adjacencyMatrix;

    for (let node = 0; node < this.order; node++) {
      let degree = 0;
      for (let neighbor = 0; neighbor < this.order; neighbor++) {
        if (adjacencyMatrix[node][neighbor] !== 0) {
          degree++;
        }
      }

      if (degree % 2 !== 0) {
        return false;
      }
    }

    return true;
  }

  topologicalSort(): number[] | null {
    if (!this.directed) {
      alert("O grafo precisa ser direcionado.");
      return null;
    }
    const visited: boolean[] = Array(this.order).fill(false);
    const stack: number[] = [];
    const result: number[] = [];
    const adjacencyMatrix =
      GraphStructures.generateGraphStructures(this).adjacencyMatrix;

    const deepFirstSearch = (node: number) => {
      visited[node] = true;

      for (let neighbor = 0; neighbor < this.order; neighbor++) {
        if (adjacencyMatrix[node][neighbor] && !visited[neighbor]) {
          deepFirstSearch(neighbor);
        }
      }

      stack.push(node);
    };

    for (let node = 0; node < this.order; node++) {
      if (!visited[node]) {
        deepFirstSearch(node);
      }
    }

    while (stack.length > 0) {
      result.push(stack.pop()! + 1);
    }

    return result.length === this.order ? result : null;
  }
}

export default Graph;
