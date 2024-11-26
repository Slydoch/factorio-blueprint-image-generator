import { Jimp } from "jimp";
import FactorioUtil from "../factorio-util.js";

class Entity {
  constructor() {
    this.k = "";
  }

  getGraphicsForPreload(factorioElement, element) {
    return this.getGraphics(factorioElement, element);
  }
  getGraphics(factorioElement, element) {
    return null;
  }
  render(element, factorioElement, x, y, img, bp) {
    const graphics = this.getGraphics(factorioElement, element);
    for (let j = graphics.length - 1; j >= 0; j--) {
      const graphic = graphics[j];
      const bounds = this.getBounds(factorioElement);
      const shift = {
        x: graphic.shift ? graphic.shift[0]*64 : 0,
        y: graphic.shift ? graphic.shift[1]*64 : 0
      };
      const srcSize = {
        x: graphic.width || graphic.size,
        y: graphic.height || graphic.size
      };
      const destSize = {
        x: bounds.x2 - bounds.x1,
        y: bounds.y2 - bounds.y1
      };
      const destinationOffset = {
        x: destSize.x / 2 - srcSize.x / 2 + bounds.x1,
        y: destSize.y / 2 - srcSize.y / 2 + bounds.y1
      };
      const opacity = graphic.draw_as_shadow ? 0.5 : 1;
      const graphicPosition = (graphic.x || graphic.y) ? `.${graphic.x || 0}.${graphic.y || 0}` : "";
      img.push([bp.graphics_sets[`${element.name}.${graphic.filename}${this.k}${graphicPosition}`], x + destinationOffset.x + shift.x, y + destinationOffset.y + shift.y, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: opacity,
        opacityDest: 1
      }, {element, factorioElement, path: `${element.name}.${graphic.filename}${this.k}`}]);
    }
  }

  applyRotation(element, pipe_connection) {
    const position = [...pipe_connection.position];
    return position;
  }

  subRender(element, factorioElement, x, y, img, bp) {
  }

  getBounds(factorioElement) {
    const bounds = {
      x1: -32,
      y1: -32,
      x2: 32,
      y2: 32
    };
    
    const elementSize = factorioElement.size || {
      "width": 1,
      "height": 1
    };
    bounds.x1 = -32 * elementSize.width;
    bounds.y1 = -32 * elementSize.height;
    bounds.x2 = 32 * elementSize.width;
    bounds.y2 = 32 * elementSize.height;
    return bounds;
  }
}

export default Entity;