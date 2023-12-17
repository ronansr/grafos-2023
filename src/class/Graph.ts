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

  // Getter para a ordem do grafo
  getOrder(): number {
    return this.order;
  }

  // Getter para o número de arestas
  getNumberEdges(): number {
    return this.numberEdges;
  }

  // Getter para a direção do grafo
  getDirected(): boolean {
    return this.directed;
  }

  // Getter para arestas ponderadas
  getWeightedEdge(): boolean {
    return this.weightedEdge;
  }

  // Getter para nós ponderados
  getWeightedNode(): boolean {
    return this.weightedNode;
  }

  // Getter para o primeiro nó
  getFirstNode(): NodeGraph | null {
    return this.firstNode;
  }

  // Getter para o último nó
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
        // If the graph is undirected and the edge already exists, do nothing
        return;
      }

      sourceNode.insertEdge(this.numberEdges, targetId, weight);

      if (!this.directed) {
        // If the graph is undirected, insert the reverse edge as well
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

  searchNode(id: number): boolean {
    // Implementar lógica
    return false;
  }

  getNode(id: number): NodeGraph | null {
    // Implementar lógica
    return null;
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

          // Mark the edge as added
          addedEdges.add(edgeKey);

          if (!isDirected) {
            // For undirected graphs, also mark the reverse edge as added
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

  depthFirstSearch(startNode: number): number[] {
    const adjacencyMatrix =
      GraphStructures.generateGraphStructures(this).adjacencyMatrix;
    const visited: boolean[] = Array(this.order).fill(false);
    const result: number[] = [];

    const aux = (node: number) => {
      visited[node] = true;
      result.push(node + 1);

      for (let neighbor = 0; neighbor < this.order; neighbor++) {
        if (adjacencyMatrix[node][neighbor] && !visited[neighbor]) {
          aux(neighbor);
        }
      }
    };

    aux(startNode - 1);

    return result;
  }

  breadthFirstSearch(startNode: number): number[] {
    const adjacencyMatrix =
      GraphStructures.generateGraphStructures(this).adjacencyMatrix;
    const visited: boolean[] = Array(this.order).fill(false);
    const queue: number[] = [];
    const result: number[] = [];

    visited[startNode - 1] = true;
    queue.push(startNode - 1);

    while (queue.length > 0) {
      const currentNode = queue.shift() as number;
      result.push(currentNode + 1);

      for (let neighbor = 0; neighbor < this.order; neighbor++) {
        if (adjacencyMatrix[currentNode][neighbor] && !visited[neighbor]) {
          visited[neighbor] = true;
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
    const key: number[] = new Array(this.order).fill(Number.MAX_VALUE);
    const mstSet: boolean[] = new Array(this.order).fill(false);

    key[0] = 0; // Inicializa a chave do primeiro vértice como 0, pois será o ponto de partida

    for (let count = 0; count < this.order - 1; count++) {
      const u = this.minKey(key, mstSet);
      mstSet[u] = true;

      for (let v = 0; v < this.order; v++) {
        if (
          adjacencyMatrix[u][v] !== 0 &&
          !mstSet[v] &&
          adjacencyMatrix[u][v] < key[v]
        ) {
          parent[v] = u;
          key[v] = adjacencyMatrix[u][v];
        }
      }
    }

    return this.constructMST(parent);
  }

  private minKey(key: number[], mstSet: boolean[]): number {
    let min = Number.MAX_VALUE;
    let minIndex = -1;

    for (let v = 0; v < this.order; v++) {
      if (!mstSet[v] && key[v] < min) {
        min = key[v];
        minIndex = v;
      }
    }

    return minIndex;
  }

  private constructMST(parent: number[]): {
    edges: { source: number; target: number; weight: number }[];
    totalWeight: number;
  } {
    const mstEdges: { source: number; target: number; weight: number }[] = [];
    let totalWeight = 0;
    const adjacencyMatrix =
      GraphStructures.generateGraphStructures(this).adjacencyMatrix;

    for (let v = 1; v < this.order; v++) {
      const source = parent[v];
      const target = v;
      const weight = adjacencyMatrix[v][parent[v]];

      mstEdges.push({ source, target, weight });
      totalWeight += weight;
    }

    return { edges: mstEdges, totalWeight };
  }

  private minDistance(distances: number[], visited: boolean[]): number {
    let min = Number.MAX_VALUE;
    let minIndex = -1;

    for (let v = 0; v < this.order; v++) {
      if (!visited[v] && distances[v] <= min) {
        min = distances[v];
        minIndex = v;
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
          adjacencyMatrix[u][v] !== 0 &&
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

  private shortestPath(
    parentDijkstra: number[],
    initialNode: number,
    targetNode: number
  ): number[] {
    const path: number[] = [];

    let currentVertex = targetNode;
    while (currentVertex !== initialNode) {
      path.unshift(currentVertex);
      currentVertex = parentDijkstra[currentVertex];
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

    const dfs = (vertex: number) => {
      for (let neighbor = 0; neighbor < this.order; neighbor++) {
        if (
          adjacencyMatrix[vertex][neighbor] !== 0 &&
          !visitedEdges[vertex][neighbor]
        ) {
          visitedEdges[vertex][neighbor] = true;
          visitedEdges[neighbor][vertex] = true;

          dfs(neighbor);

          cycleEdges.push({ source: vertex, target: neighbor });
        }
      }
    };

    dfs(0);

    return { edges: cycleEdges.reverse() };
  }

  private isConnected(): boolean {
    const visited: number[] = this.depthFirstSearch(1);

    return visited?.length === this.order;
  }

  private hasEulerianCycle(): boolean {
    const adjacencyMatrix =
      GraphStructures.generateGraphStructures(this).adjacencyMatrix;

    for (let vertex = 0; vertex < this.order; vertex++) {
      let degree = 0;
      for (let neighbor = 0; neighbor < this.order; neighbor++) {
        if (adjacencyMatrix[vertex][neighbor] !== 0) {
          degree++;
        }
      }

      if (degree % 2 !== 0) {
        return false;
      }
    }

    return true;
  }
}

export default Graph;
