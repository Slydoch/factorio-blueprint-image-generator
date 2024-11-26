import Entity from "./entity.js";

class AssemblingMachine extends Entity {
  constructor() {
    super();
  }
  getGraphics(factorioElement, element) {
    if(factorioElement.graphics_set.animation.north) { // if it has different directions
      switch(element.direction) {
        case 4:
          return factorioElement.graphics_set.animation.east.layers;
        case 8:
          return factorioElement.graphics_set.animation.south.layers;
        case 12:
          return factorioElement.graphics_set.animation.west.layers;
        default:
          return factorioElement.graphics_set.animation.north.layers;
      }
    } else {
      return factorioElement.graphics_set.animation.layers;
    }
  }
  getGraphicsForPreload(factorioElement, element) {
    if(factorioElement.graphics_set.animation.north) { // if it has different directions
      return [
        ...factorioElement.graphics_set.animation.north.layers,
        ...factorioElement.graphics_set.animation.east.layers,
        ...factorioElement.graphics_set.animation.south.layers,
        ...factorioElement.graphics_set.animation.west.layers
      ];
    } else {
      return factorioElement.graphics_set.animation.layers;
    }
  }
}

export default AssemblingMachine;