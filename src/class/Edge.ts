// Implementação da classe Edge
class Edge {
  id: number;
  targetId: number;
  nextEdge: Edge | null;
  weight: number;

  // Construtor
  constructor(id: number, targetId: number, weight?: number) {
    this.id = id;
    this.targetId = targetId;
    this.nextEdge = null;
    this.weight = weight || 0.0;
  }

  // Getter para o ID do destino
  getTargetId() {
    return this.targetId;
  }

  // Getter para a próxima aresta
  getNextEdge() {
    return this.nextEdge;
  }

  // Getter para o peso da aresta
  getWeight() {
    return this.weight;
  }

  // Setter para a próxima aresta
  setNextEdge(edge: Edge) {
    this.nextEdge = edge;
  }

  // Setter para o peso da aresta
  setWeight(weight: number) {
    this.weight = weight;
  }
}

export default Edge;
