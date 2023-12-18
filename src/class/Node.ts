import Edge from "./Edge";

class NodeGraph {
  firstEdge: Edge | null;
  lastEdge: Edge | null;
  id: number;
  inDegree: number;
  outDegree: number;
  weight: number;
  nextNode: NodeGraph | null;

  constructor(id: number) {
    this.firstEdge = null;
    this.lastEdge = null;
    this.id = id;
    this.inDegree = 0;
    this.outDegree = 0;
    this.weight = 0.0;
    this.nextNode = null;
  }

  getFirstEdge(): Edge | null {
    return this.firstEdge;
  }

  getLastEdge(): Edge | null {
    return this.lastEdge;
  }

  getInDegree(): number {
    return this.inDegree;
  }

  getOutDegree(): number {
    return this.outDegree;
  }

  getWeight(): number {
    return this.weight;
  }

  getNextNode(): NodeGraph | null {
    return this.nextNode;
  }

  setNextNode(node: NodeGraph): void {
    this.nextNode = node;
  }

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
