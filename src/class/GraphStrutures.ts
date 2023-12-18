import Graph from "./Graph";
// import * as fs from "fs";

interface GraphStructuresType {
  adjacencyMatrix: number[][];
  incidenceMatrix: number[][];
  incidenceTable: { node: number; edge: number; weight: number }[];
}

class GraphStructures {
  static generateGraphStructures(graph: Graph): GraphStructuresType {
    // Inicializa as estruturas de dados
    const adjacencyMatrix: number[][] = Array.from(
      { length: graph.order },
      () => Array(graph.order).fill(0)
    );
    const incidenceMatrix: number[][] = Array.from(
      { length: graph.order },
      () => Array(graph.numberEdges).fill(0)
    );
    const incidenceTable: { node: number; edge: number; weight: number }[] = [];

    // Mapeia os IDs dos nós para índices na matriz
    const nodeIndices: Map<number, number> = new Map();
    let nodeIndexCounter = graph.order - 1;

    let currentNode = graph.firstNode;
    while (currentNode !== null) {
      nodeIndices.set(currentNode.id, nodeIndexCounter);
      nodeIndexCounter--;
      currentNode = currentNode.nextNode;
    }

    // Preenche as estruturas de dados
    currentNode = graph.firstNode;
    let columnIndex = 0;

    while (currentNode !== null) {
      let currentEdge = currentNode.firstEdge;

      while (currentEdge !== null) {
        // Preenche a matriz de adjacências
        const sourceIndex = nodeIndices.get(currentNode.id) as number;
        const targetIndex = nodeIndices.get(currentEdge.targetId) as number;

        adjacencyMatrix[sourceIndex][targetIndex] = graph.weightedEdge
          ? currentEdge.weight
          : 1;

        // if (!graph.directed && targetIndex > sourceIndex)
        //   adjacencyMatrix[sourceIndex][targetIndex] = graph.weightedEdge
        //     ? currentEdge.weight
        //     : 1;
        // if (graph.directed)
        //   adjacencyMatrix[sourceIndex][targetIndex] = graph.weightedEdge
        //     ? currentEdge.weight
        //     : 1;

        // Preenche a matriz de incidências
        incidenceMatrix[sourceIndex][currentEdge.id] = !graph.directed
          ? 1
          : graph.weightedEdge
          ? -currentEdge.weight
          : 1;
        incidenceMatrix[targetIndex][currentEdge.id] = !graph.directed
          ? 1
          : graph.weightedEdge
          ? currentEdge.weight
          : 1;

        // Preenche a tabela de incidências
        incidenceTable.push({
          node: currentNode.id - 1,
          edge: currentEdge.id,
          weight: graph.weightedEdge ? currentEdge.weight : 1,
        });

        currentEdge = currentEdge.nextEdge;
        columnIndex++;
      }

      currentNode = currentNode.nextNode;
    }

    return { adjacencyMatrix, incidenceMatrix, incidenceTable };
  }

  static async readFileAndCreateGraph(file: File): Promise<Graph | null> {
    try {
      const fileContent = await this.readTextFile(file);
      const data = fileContent.trim().split("\n");

      const order = parseInt(data[0], 10);
      const graph = new Graph(
        order,
        this.isGraphDirected(fileContent),
        true,
        false
      );

      for (let i = 1; i <= order; i++) {
        graph.insertNode(i);
      }

      for (let i = 1; i <= order; i++) {
        const weights = data[i].split(" ").map(Number);
        for (let j = 0; j < order; j++) {
          if (weights[j] !== 999 && weights[j] !== 0) {
            graph.insertEdge(i, j + 1, weights[j]);
          }
        }
      }

      return graph;
    } catch (error: any) {
      console.error(`Error reading file: ${error.message}`);
      return null;
    }
  }

  static async readTextFile(file: File): Promise<string> {
    const fileContent = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const result = event?.target?.result as string;
        resolve(result);
      };

      reader.onerror = (event) => {
        reject(new Error("Error reading file."));
      };

      reader.readAsText(file);
    });

    return fileContent;
  }

  static isGraphDirected(matrixString: string): boolean {
    // Divide a string em linhas
    const lines = matrixString.trim().split("\n");

    // Obtém o número de vértices a partir da primeira linha
    const numVertices = parseInt(lines[0], 10);

    // Cria uma matriz a partir das linhas restantes
    const matrix = lines.slice(1).map((line) => line.split(" ").map(Number));

    // Verifica se a parte inferior da diagonal principal contém apenas zeros
    for (let i = 0; i < numVertices; i++) {
      for (let j = 0; j < i; j++) {
        if (matrix[i][j] !== 0) {
          return true; // Se encontrar um valor diferente de zero, o grafo é orientado
        }
      }
    }

    return false; // Se todos os valores na parte inferior da
  }

  static graphToGraphviz(graph: Graph): string {
    const isDirected = graph.getDirected();

    let graphvizString = isDirected ? "digraph G {\n" : "graph G {\n";

    let currentNode = graph.firstNode;

    while (currentNode !== null) {
      graphvizString += `  ${currentNode.id};\n`;

      let currentEdge = currentNode.firstEdge;

      while (currentEdge !== null) {
        graphvizString += `  ${currentNode.id} ${isDirected ? "->" : "--"} ${
          currentEdge.targetId
        }`;
        if (currentEdge.weight !== 0) {
          graphvizString += ` [label=${currentEdge.weight}]`;
        }
        graphvizString += ";\n";

        currentEdge = currentEdge.nextEdge;
      }

      currentNode = currentNode.nextNode;
    }

    graphvizString += "}\n";

    return graphvizString;
  }

  static generateGraphFromNodesArray(nodes: number[]) {
    if (!Array.isArray(nodes) || nodes.length === 0) {
      console.error("O vetor de inteiros é inválido.");
      return;
    }

    const graphDOT = ["graph G {"];

    for (let i = 0; i < nodes.length; i++) {
      graphDOT.push(`  ${i} [label="${nodes[i]}"];`);
      if (i < nodes.length - 1) {
        graphDOT.push(`  ${i} -- ${i + 1};`);
      }
    }

    graphDOT.push("}");

    return graphDOT.join("\n");
  }

  // static adjacencyToIncidence(adjacencyMatrix: number[][]): number[][] {
  //   const numVertices = adjacencyMatrix.length;
  //   const numEdges = this.countEdges(adjacencyMatrix);

  //   const incidenceMatrix: number[][] = Array.from(
  //     { length: numVertices },
  //     () => Array(numEdges).fill(0)
  //   );

  //   let edgeIndex = 0;

  //   for (let i = 0; i < numVertices; i++) {
  //     for (let j = i; j < numVertices; j++) {
  //       if (adjacencyMatrix[i][j] !== 0) {
  //         incidenceMatrix[i][edgeIndex] = 1;
  //         incidenceMatrix[j][edgeIndex] = -1;
  //         edgeIndex++;
  //       }
  //     }
  //   }

  //   return incidenceMatrix;
  // }

  static countEdges(adjacencyMatrix: number[][]): number {
    const numVertices = adjacencyMatrix.length;
    let count = 0;

    for (let i = 0; i < numVertices; i++) {
      for (let j = i; j < numVertices; j++) {
        if (adjacencyMatrix[i][j] !== 0) {
          count++;
        }
      }
    }

    return count;
  }

  // static incidenceToAdjacency(incidenceMatrix: number[][]): number[][] {
  //   const numVertices = incidenceMatrix.length;
  //   const numEdges = incidenceMatrix[0].length;

  //   const adjacencyMatrix: number[][] = Array.from(
  //     { length: numVertices },
  //     () => Array(numVertices).fill(0)
  //   );

  //   for (let edgeIndex = 0; edgeIndex < numEdges; edgeIndex++) {
  //     let startVertex = -1;
  //     let endVertex = -1;

  //     for (let vertex = 0; vertex < numVertices; vertex++) {
  //       if (incidenceMatrix[vertex][edgeIndex] === 1) {
  //         startVertex = vertex;
  //       } else if (incidenceMatrix[vertex][edgeIndex] === -1) {
  //         endVertex = vertex;
  //       }
  //     }

  //     if (startVertex !== -1 && endVertex !== -1) {
  //       adjacencyMatrix[startVertex][endVertex] = 1;
  //       adjacencyMatrix[endVertex][startVertex] = 1; // Para grafos não direcionados
  //     }
  //   }

  //   return adjacencyMatrix;
  // }

  // static incidenceToIncidenceTable(incidenceMatrix: number[][]): number[][] {
  //   const numVertices = incidenceMatrix.length;
  //   const numEdges = incidenceMatrix[0].length;

  //   const incidenceTable: number[][] = Array.from({ length: numVertices }, () =>
  //     Array(numEdges).fill(0)
  //   );

  //   for (let edgeIndex = 0; edgeIndex < numEdges; edgeIndex++) {
  //     let startVertex = -1;
  //     let endVertex = -1;

  //     for (let vertex = 0; vertex < numVertices; vertex++) {
  //       if (incidenceMatrix[vertex][edgeIndex] === 1) {
  //         startVertex = vertex;
  //       } else if (incidenceMatrix[vertex][edgeIndex] === -1) {
  //         endVertex = vertex;
  //       }
  //     }

  //     if (startVertex !== -1 && endVertex !== -1) {
  //       incidenceTable[startVertex][edgeIndex] = 1;
  //       incidenceTable[endVertex][edgeIndex] = -1;
  //     }
  //   }

  //   return incidenceTable;
  // }

  // static adjacencyToIncidenceTable(adjacencyMatrix: number[][]): number[][] {
  //   const numVertices = adjacencyMatrix.length;
  //   const numEdges = this.countEdges(adjacencyMatrix);

  //   const incidenceTable: number[][] = Array.from({ length: numVertices }, () =>
  //     Array(numEdges).fill(0)
  //   );

  //   let edgeIndex = 0;

  //   for (let i = 0; i < numVertices; i++) {
  //     for (let j = i; j < numVertices; j++) {
  //       if (adjacencyMatrix[i][j] !== 0) {
  //         incidenceTable[i][edgeIndex] = 1;
  //         incidenceTable[j][edgeIndex] = -1;
  //         edgeIndex++;
  //       }
  //     }
  //   }

  //   return incidenceTable;
  // }

  // static incidenceTableToAdjacency(incidenceTable: number[][]): number[][] {
  //   const numVertices = incidenceTable.length;
  //   const numEdges = incidenceTable[0].length;

  //   const adjacencyMatrix: number[][] = Array.from(
  //     { length: numVertices },
  //     () => Array(numVertices).fill(0)
  //   );

  //   for (let edgeIndex = 0; edgeIndex < numEdges; edgeIndex++) {
  //     let startVertex = -1;
  //     let endVertex = -1;

  //     for (let vertex = 0; vertex < numVertices; vertex++) {
  //       if (incidenceTable[vertex][edgeIndex] === 1) {
  //         startVertex = vertex;
  //       } else if (incidenceTable[vertex][edgeIndex] === -1) {
  //         endVertex = vertex;
  //       }
  //     }

  //     if (startVertex !== -1 && endVertex !== -1) {
  //       adjacencyMatrix[startVertex][endVertex] = 1;
  //       adjacencyMatrix[endVertex][startVertex] = 1; // Para grafos não direcionados
  //     }
  //   }

  //   return adjacencyMatrix;
  // }

  // static incidenceTableToIncidenceMatrix(
  //   incidenceTable: number[][]
  // ): number[][] {
  //   const numVertices = incidenceTable.length;
  //   const numEdges = incidenceTable[0].length;

  //   const incidenceMatrix: number[][] = Array.from({ length: numEdges }, () =>
  //     Array(numVertices).fill(0)
  //   );

  //   for (let vertexIndex = 0; vertexIndex < numVertices; vertexIndex++) {
  //     for (let edgeIndex = 0; edgeIndex < numEdges; edgeIndex++) {
  //       incidenceMatrix[edgeIndex][vertexIndex] =
  //         incidenceTable[vertexIndex][edgeIndex];
  //     }
  //   }

  //   return incidenceMatrix;
  // }

  static incidenceToAdjacencyString(incidenceMatrix: number[][]): string {
    const numVertices = incidenceMatrix.length;
    const numEdges = incidenceMatrix[0].length;
    const adjacencyMatrix: number[][] = Array.from(
      { length: numVertices },
      () => Array(numVertices).fill(0)
    );

    for (let edgeIndex = 0; edgeIndex < numEdges; edgeIndex++) {
      let startVertex = -1;
      let endVertex = -1;

      for (let vertex = 0; vertex < numVertices; vertex++) {
        if (incidenceMatrix[vertex][edgeIndex] === 1) {
          startVertex = vertex;
        } else if (incidenceMatrix[vertex][edgeIndex] === -1) {
          endVertex = vertex;
        }
      }

      if (startVertex !== -1 && endVertex !== -1) {
        adjacencyMatrix[startVertex][endVertex] = 1;
        adjacencyMatrix[endVertex][startVertex] = 1; // Para grafos não direcionados
      }
    }

    // Formata a matriz de adjacências como uma string
    let result = `${numVertices}\n`;
    for (let i = 0; i < numVertices; i++) {
      result += adjacencyMatrix[i].join(" ") + "\n";
    }

    return result.trim();
  }

  static incidenceTableToAdjacencyString(incidenceTable: number[][]): string {
    const numVertices = incidenceTable.length;
    const numEdges = incidenceTable[0].length;
    const adjacencyMatrix: number[][] = Array.from(
      { length: numVertices },
      () => Array(numVertices).fill(0)
    );

    for (let edgeIndex = 0; edgeIndex < numEdges; edgeIndex++) {
      let startVertex = -1;
      let endVertex = -1;

      for (let vertex = 0; vertex < numVertices; vertex++) {
        if (incidenceTable[vertex][edgeIndex] === 1) {
          startVertex = vertex;
        } else if (incidenceTable[vertex][edgeIndex] === -1) {
          endVertex = vertex;
        }
      }

      if (startVertex !== -1 && endVertex !== -1) {
        adjacencyMatrix[startVertex][endVertex] = 1;
        adjacencyMatrix[endVertex][startVertex] = 1; // Para grafos não direcionados
      }
    }

    // Formata a matriz de adjacências como uma string
    let result = `${numVertices}\n`;
    for (let i = 0; i < numVertices; i++) {
      result += adjacencyMatrix[i].join(" ") + "\n";
    }

    return result.trim();
  }

  static createAdjacencyMatrixFromList(vertices: number[]): number[][] {
    const matrixSize = vertices.length;
    const adjacencyMatrix: number[][] = Array.from({ length: matrixSize }, () =>
      Array(matrixSize).fill(0)
    );

    for (let i = 0; i < matrixSize - 1; i++) {
      adjacencyMatrix[i][i + 1] = vertices[i + 1];
    }

    return adjacencyMatrix;
  }

  static getArrayEdgesEulerianCycle(list: {
    edges: { source: number; target: number }[];
  }) {
    let edges = "";

    for (let i = 0; i < list.edges.length; i++) {
      edges = `${edges} ${edges ? " - " : ""} ${list.edges[i].source + 1}`;
    }

    return edges;
  }

  static formatPrimResult(result: {
    edges: { source: number; target: number; weight: number }[];
    totalWeight: number;
  }) {
    const { edges, totalWeight } = result;

    let lText = "Peso total: " + totalWeight + "\n";

    for (let i = 0; i < edges.length; i++) {
      lText += `aresta: (${edges[i].source + 1},${
        edges[i].target + 1
      }), peso: ${edges[i].weight} \n`;
    }

    return lText;
  }
}

export default GraphStructures;
