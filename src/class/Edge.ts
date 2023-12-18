// Implementação da classe Edge
class Edge {
  id: number;
  targetId: number;
  nextEdge: Edge | null;
  weight: number;

  constructor(id: number, targetId: number, weight?: number) {
    this.id = id;
    this.targetId = targetId;
    this.nextEdge = null;
    this.weight = weight || 0.0;
  }

  getTargetId() {
    return this.targetId;
  }

  getNextEdge() {
    return this.nextEdge;
  }

  getWeight() {
    return this.weight;
  }

  setNextEdge(edge: Edge) {
    this.nextEdge = edge;
  }

  setWeight(weight: number) {
    this.weight = weight;
  }
}

export default Edge;
