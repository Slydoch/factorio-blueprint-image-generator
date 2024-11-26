import Entity from "./entity.js";
import { Jimp } from "jimp";
import Logger from "../logger.js";
const logger = new Logger("entity.underground-belt");

class UndergroundBelt extends Entity {
  constructor() {
    super();
    this.layer = "high";
  }

  async customPreload(entity, element, graphics_sets) {
    let graphics = [];
    graphics = this.getGraphicsForPreload(entity, element);
    if(!Array.isArray(graphics)) {
      graphics = [graphics];
    }
    for (let j = 0; j < graphics.length; j++) {
      const graphic = graphics[j];
      graphic.filename = graphic.filename.replace(/__/g, "");
      for (let k = 0; k < 4; k++) { // 4 sprites per row
        graphic.x = k * (graphic.width || graphic.size);
        if (graphics_sets[`${element.name}.${graphic.filename}.${k}`]) {
          continue;
        }
        const fullImage = graphics_sets[`${element.name}.${graphic.filename}`] || (await Jimp.read(`./factorio/data/${graphic.filename}`));
        if(!graphics_sets[`${element.name}.${graphic.filename}`]) {
          //logger.log(`Loading ${element.name}.${graphic.filename}`);
          graphics_sets[`${element.name}.${graphic.filename}`] = fullImage;
        }
        const inOrOut = graphic.direction ? '.' + graphic.direction : '';
        graphics_sets[`${element.name}.${graphic.filename}.${k}${inOrOut}`] = new Jimp({
          width: graphic.width || graphic.size,
          height: graphic.height || graphic.size,
          color: 0x00000000
        });
        graphics_sets[`${element.name}.${graphic.filename}.${k}${inOrOut}`].blit({
          src: fullImage.clone(),
          srcX: graphic.x || k * (graphic.width || graphic.size),
          srcY: graphic.y || 0,
          x: 0,
          y: 0,
          srcW: graphic.width || graphic.size,
          srcH: graphic.height || graphic.size
        });
      }
    }
  }
  subRender(element, factorioElement, x, y, bp) {
    const bounds = this.getBounds(factorioElement);
    const graphics = [
      factorioElement.structure.back_patch.sheet,
      factorioElement.structure.front_patch.sheet
    ];
    for (let j = 0; j < graphics.length; j++) {
      const graphic = graphics[j];
      graphic.filename = graphic.filename.replace(/__/g, "");
      const shift = {
        x: graphic.shift ? graphic.shift[0] : 0,
        y: graphic.shift ? graphic.shift[1] : 0
      };
      const srcSize = {
        x: graphic.width,
        y: graphic.height
      };
      const destSize = {
        x: bounds.x2 - bounds.x1,
        y: bounds.y2 - bounds.y1
      };
      const destinationOffset = {
        x: destSize.x / 2 - srcSize.x / 2 + bounds.x1,
        y: destSize.y / 2 - srcSize.y / 2 + bounds.y1
      };
      const layer = graphic.draw_as_shadow ? bp.renderLayers.shadows : bp.renderLayers[j === 0 ? 'low' : 'high']; // first layer is low, second is high
      let dir = 0;
      switch (element.direction) {
        case 4:
          dir = "." + (element.type === 'input' ? 1 : 3);
          break;
        case 8:
          dir = "." + (element.type === 'input' ? 2 : 0);
          break;
        case 12:
          dir = "." + (element.type === 'input' ? 3 : 1);
          break;
        default:
          dir = "." + (element.type === 'input' ? 0 : 2);
          break;
      }
      layer.push([bp.graphics_sets[`${element.name}.${graphic.filename}${dir}`], x + destinationOffset.x + shift.x * 2, y + destinationOffset.y + shift.y * 2, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 1,
        opacityDest: 1
      }, { element, factorioElement, path: `${element.name}.${graphic.filename}.${dir}` }]);
    }
  }


  getGraphics(factorioElement, element) {
    switch (element.direction) {
      case 4:
        this.k = "." + (element.type === 'input' ? 1 : 3) + "." + element.type;
        break;
      case 8:
        this.k = "." + (element.type === 'input' ? 2 : 0) + "." + element.type;
        break;
      case 12:
        this.k = "." + (element.type === 'input' ? 3 : 1) + "." + element.type;
        break;
      default:
        this.k = "." + (element.type === 'input' ? 0 : 2) + "." + element.type;
        break;
    }
    return [
      {
        ...factorioElement.structure["direction_" + element.type.replace('put', '')].sheet,
        direction: element.type
      }
    ];
  }
  getGraphicsForPreload(factorioElement, element) {
    return [
      {
        ...factorioElement.structure.direction_in.sheet,
        direction: 'input'
      },
      {
        ...factorioElement.structure.direction_out.sheet,
        direction: 'output'
      },
      factorioElement.structure.back_patch.sheet,
      factorioElement.structure.front_patch.sheet
    ];
  }
}

export default UndergroundBelt;