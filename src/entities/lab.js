import Entity from "./entity.js";

class Lab extends Entity {
  constructor() {
    super();
  }
  getGraphics(factorioElement, element) {
    return factorioElement.off_animation.layers;
  }
}

export default Lab;