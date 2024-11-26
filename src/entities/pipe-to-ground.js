import Entity from "./entity.js";

class PipeToGround extends Entity {
  constructor() {
    super();
  }
  getGraphics(factorioElement, element) {
    switch (element.direction) {
      case 4:
        return factorioElement.pictures.east;
      case 8:
        return factorioElement.pictures.south;
      case 12:
        return factorioElement.pictures.west;
      default:
        return factorioElement.pictures.north;
    }
  }
  getGraphicsForPreload(factorioElement, element) {
    return Object.values(factorioElement.pictures);
  }
}

export default PipeToGround;