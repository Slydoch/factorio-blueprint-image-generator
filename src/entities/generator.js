import { Jimp } from "jimp";
import Entity from "./entity.js";
import FactorioUtil from "../factorio-util.js";

class Generator extends Entity {
  constructor() {
    super();
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
      if (graphics_sets[`${element.name}.${graphic.filename}`]) {
        continue;
      }
      const fullImage = await Jimp.read(`./factorio/data/${graphic.filename}`);
      if(graphic.line_length) { // loading generator itself
        graphics_sets[`${element.name}.${graphic.filename}`] = new Jimp({
          width: graphic.width || graphic.size,
          height: graphic.height || graphic.size,
          color: 0x00000000
        });
        graphics_sets[`${element.name}.${graphic.filename}`].blit({
          src: fullImage.clone(),
          srcX: 0,
          srcY: 0,
          x: 0,
          y: 0,
          srcW: graphic.width || graphic.size,
          srcH: graphic.height || graphic.size
        })
      } else { // loading pipe covers
        graphics_sets[`${element.name}.${graphic.filename}`] = fullImage.crop(
          {
            x: 0,
            y: 0,
            w: graphic.width || graphic.size,
            h: graphic.height || graphic.size
          }
        );
      }
    }
  }
  getGraphicsForPreload(factorioElement, element) {
    return [
      ...factorioElement.horizontal_animation.layers,
      ...factorioElement.vertical_animation.layers,
      ...factorioElement.fluid_box.pipe_covers.west.layers,
      ...factorioElement.fluid_box.pipe_covers.east.layers,
      ...factorioElement.fluid_box.pipe_covers.north.layers,
      ...factorioElement.fluid_box.pipe_covers.south.layers
    ];
  }
  getGraphics(factorioElement, element) {
    return element.direction === 4
      ? factorioElement.horizontal_animation.layers
      : factorioElement.vertical_animation.layers;
  }

  applyRotation(element, pipe_connection) {
    const position = [...pipe_connection.position];
    const newPosition = [...position];
    switch (element.direction) {
      case 0:
        break;
      case 4:
        newPosition[0] = position[1];
        newPosition[1] = position[0];
        break;
    }
    return newPosition;
  }


  subRender(element, factorioElement, x, y, bp) {
    const pipe_covers = factorioElement.fluid_box.pipe_covers;
    const pipe_connections = factorioElement.fluid_box.pipe_connections;
    const bounds = this.getBounds(factorioElement);
    // render pipe connections
    for (let i = 0; i < pipe_connections.length; i++) {
      const pipe_connection = pipe_connections[i];
      let direction = pipe_connection.direction;
      if (element.direction !== 0) {
        direction += 12;
        direction %= 16;
      }
      const position = this.applyRotation(element, pipe_connection);
      const offset = {
        x: 0,
        y: 0
      };
      // rotate the pipe connection
      let graphics = [];
      switch (direction) {
        case 0:
          offset.y = -1;
          graphics = pipe_covers.north.layers;
          break;
        case 4:
          offset.x = 1;
          graphics = pipe_covers.east.layers;
          break;
        case 8:
          offset.y = 1;
          graphics = pipe_covers.south.layers;
          break;
        case 12:
          offset.x = -1;
          graphics = pipe_covers.west.layers;
          break;
      }
      let connected = false;
      // check if the pipe connection is connected
      for (let p = 0 ; p < bp.pipes.length; p++) {
        const pipe = bp.pipes[p];
        if (pipe.position.x === position[0] + offset.x + element.position.x && pipe.position.y === position[1] + offset.y + element.position.y) {
          connected = true;
        }
      }
      if (connected) {
        continue;
      }
      
      for (let j = 0; j < graphics.length; j++) {
        const graphic = graphics[j];
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
          x: destSize.x / 2 - srcSize.x / 2 + bounds.x1 + (position[0] + offset.x)*64,
          y: destSize.y / 2 - srcSize.y / 2 + bounds.y1 + (position[1] + offset.y)*64
        };
        const layer = graphic.draw_as_shadow ? bp.renderLayers.shadows : bp.renderLayers.low;
        layer.push([bp.graphics_sets[`${element.name}.${graphic.filename}`], x + destinationOffset.x + shift.x, y + destinationOffset.y + shift.y, {
          mode: Jimp.BLEND_SOURCE_OVER,
          opacitySource: 1,
          opacityDest: 1
        }, {element, factorioElement, path: `${element.name}.${graphic.filename}`}]);
      }
    }
  }
}

export default Generator;