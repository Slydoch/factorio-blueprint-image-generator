import Entity from "./entity.js";

class ElectricPole extends Entity {
  getGraphics(factorioElement, element) {
    return factorioElement.pictures.layers;
  }
}

export default ElectricPole;