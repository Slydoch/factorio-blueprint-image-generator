import { Jimp } from "jimp";
import Logger from "../logger.js";
const logger = new Logger("entity");

class Entity {
  constructor() {
    this.k = "";
    this.layer = "low";
  }

  getGraphicsForPreload(factorioElement, element) {
    return this.getGraphics(factorioElement, element);
  }
  getGraphics(factorioElement, element) {
    return null;
  }

  render(element, factorioElement, x, y, bp) {
    let graphics = this.getGraphics(factorioElement, element);
    if(!Array.isArray(graphics)) {
      graphics = [graphics];
    }
    for (let j = graphics.length - 1; j >= 0; j--) {
      const graphic = graphics[j];
      const filenames = [];
      if (Array.isArray(graphic.filenames)) {
        filenames.push(...graphic.filenames);
      } else {
        filenames.push(graphic.filename);
      }
      for (let f = 0; f < filenames.length; f++) {
        const filename = filenames[f].replace(/__/g, "");
        const bounds = this.getBounds(factorioElement);
        const shift = {
          x: graphic.shift ? graphic.shift[0] * 64 : 0,
          y: graphic.shift ? graphic.shift[1] * 64 : 0
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
        // logger.log(`Rendering ${element.name}.${filename}${graphicPosition}`);
        const layer = graphic.draw_as_shadow ? bp.renderLayers.shadows : bp.renderLayers[this.layer];
        layer.push([bp.graphics_sets[`${element.name}.${filename}${this.k}`], x + destinationOffset.x + shift.x, y + destinationOffset.y + shift.y, {
          mode: Jimp.BLEND_SOURCE_OVER,
          opacitySource: 1,
          opacityDest: 1
        }, { element, factorioElement, path: `${element.name}.${filename}${this.k}` }]);
      }
    }
  }

  applyRotation(element, pipe_connection) {
    const position = [...pipe_connection.position];
    return position;
  }

  subRender(element, factorioElement, x, y, bp) {
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