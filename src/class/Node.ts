import Edge from "./Edge";

class NodeGraph {
  // Propriedades
  firstEdge: Edge | null;
  lastEdge: Edge | null;
  id: number;
  inDegree: number;
  outDegree: number;
  weight: number;
  nextNode: NodeGraph | null;

  // Construtor
  constructor(id: number) {
    this.firstEdge = null;
    this.lastEdge = null;
    this.id = id;
    this.inDegree = 0;
    this.outDegree = 0;
    this.weight = 0.0;
    this.nextNode = null;
  }

  // Getter para a primeira aresta
  getFirstEdge(): Edge | null {
    return this.firstEdge;
  }

  // Getter para a última aresta
  getLastEdge(): Edge | null {
    return this.lastEdge;
  }

  // Getter para o grau de entrada
  getInDegree(): number {
    return this.inDegree;
  }

  // Getter para o grau de saída
  getOutDegree(): number {
    return this.outDegree;
  }

  // Getter para o peso do nó
  getWeight(): number {
    return this.weight;
  }

  // Getter para o próximo nó
  getNextNode(): NodeGraph | null {
    return this.nextNode;
  }

  // Setter para o próximo nó
  setNextNode(node: NodeGraph): void {
    this.nextNode = node;
  }

  // Setter para o peso do nó
  setWeight(weight: number): void {
    this.weight = weight;
  }

  insertEdge(id: number, targetId: number, weight: number): void {
    const newEdge = new Edge(id, targetId, weight);
    newEdge.nextEdge = this.firstEdge;
    this.firstEdge = newEdge;
  }

  removeEdge(targetId: number): boolean {
    let currentEdge = this.firstEdge;
    let previousEdge: Edge | null = null;

    while (currentEdge !== null && currentEdge.targetId !== targetId) {
      previousEdge = currentEdge;
      currentEdge = currentEdge.nextEdge;
    }

    if (currentEdge !== null) {
      if (previousEdge !== null) {
        previousEdge.nextEdge = currentEdge.nextEdge;
      } else {
        this.firstEdge = currentEdge.nextEdge;
      }
      return true;
    }

    return false;
  }

  hasEdge(targetId: number): boolean {
    let currentEdge = this.firstEdge;
    while (currentEdge !== null) {
      if (currentEdge.targetId === targetId) {
        return true;
      }
      currentEdge = currentEdge.nextEdge;
    }
    return false;
  }

  incrementOutDegree(): void {
    this.outDegree++;
  }

  decrementOutDegree(): void {
    this.outDegree--;
  }

  incrementInDegree(): void {
    this.inDegree++;
  }

  decrementInDegree(): void {
    this.inDegree--;
  }
}

export default NodeGraph;
