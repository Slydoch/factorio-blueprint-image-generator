import Entity from "./entity.js";

class Container extends Entity {
  getGraphics(factorioElement, element) {
    return factorioElement.picture.layers;
  }
}

export default Container;