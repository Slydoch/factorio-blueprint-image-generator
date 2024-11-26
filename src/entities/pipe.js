import Entity from "./entity.js";
import { Jimp } from "jimp";

class Pipe extends Entity {
  calculateSpriteNameForPipes(pipes) {
    for (let i = 0; i < pipes.length; i++) {
      const pipe = pipes[i];
      const neighbours = pipe.neighbours;
      let spriteName = "pipe";
      let rotation = 0;
      if (neighbours[0] && neighbours[1] && neighbours[2] && neighbours[3]) {
        spriteName = "pipe-x-junction";
        rotation = 0;
      } else if (neighbours[0] && neighbours[1] && neighbours[2]) {
        spriteName = "pipe-t-junction";
        rotation = 0;
      } else if (neighbours[0] && neighbours[1] && neighbours[3]) {
        spriteName = "pipe-t-junction";
        rotation = 1;
      } else if (neighbours[0] && neighbours[2] && neighbours[3]) {
        spriteName = "pipe-t-junction";
        rotation = 2;
      } else if (neighbours[1] && neighbours[2] && neighbours[3]) {
        spriteName = "pipe-t-junction";
        rotation = 3;
      } else if (neighbours[0] && neighbours[1]) {
        spriteName = "pipe-corner";
        rotation = 0;
      } else if (neighbours[1] && neighbours[2]) {
        spriteName = "pipe-corner";
        rotation = 1;
      } else if (neighbours[2] && neighbours[3]) {
        spriteName = "pipe-corner";
        rotation = 2;
      } else if (neighbours[3] && neighbours[0]) {
        spriteName = "pipe-corner";
        rotation = 3;
      } else if (neighbours[0] && neighbours[2]) {
        spriteName = "pipe-straight";
        rotation = 0;
      } else if (neighbours[1] && neighbours[3]) {
        spriteName = "pipe-straight";
        rotation = 1;
      } else if (neighbours[0] && !neighbours[2]) {
        spriteName = "pipe-end";
        rotation = 0;
      } else if (neighbours[1] && !neighbours[3]) {
        spriteName = "pipe-end";
        rotation = 1;
      } else if (neighbours[2] && !neighbours[0]) {
        spriteName = "pipe-end";
        rotation = 2;
      } else if (neighbours[3] && !neighbours[1]) {
        spriteName = "pipe-end";
        rotation = 3;
      } else if (!neighbours[0] && !neighbours[1] && !neighbours[2] && !neighbours[3]) {
        spriteName = "pipe-single";
        rotation = 0;
      }
      pipe.spriteName = spriteName;
      switch (spriteName) {
        case "pipe-straight":
          switch (rotation) {
            case 0:
              pipe.spriteName = "straight_vertical";
              break;
            case 1:
              pipe.spriteName = "straight_horizontal";
              break;
          }
          break;
        case "pipe-corner":
          switch (rotation) {
            case 0:
              pipe.spriteName = "corner_up_right";
              break;
            case 1:
              pipe.spriteName = "corner_down_right";
              break;
            case 2:
              pipe.spriteName = "corner_down_left";
              break;
            case 3:
              pipe.spriteName = "corner_up_left";
              break;
          }
          break;
        case "pipe-t-junction":
          switch (rotation) {
            case 0:
              pipe.spriteName = "t_right";
              break;
            case 1:
              pipe.spriteName = "t_up";
              break;
            case 2:
              pipe.spriteName = "t_left";
              break;
            case 3:
              pipe.spriteName = "t_down";
              break;
          }
          break;
        case "pipe-end":
          switch (rotation) {
            case 0:
              pipe.spriteName = "ending_up";
              break;
            case 1:
              pipe.spriteName = "ending_right";
              break;
            case 2:
              pipe.spriteName = "ending_down";
              break;
            case 3:
              pipe.spriteName = "ending_left";
              break;
          }
          break;
        case "pipe-single":
          pipe.spriteName = "straight_vertical_single";
          break;
        case "pipe-x-junction":
          pipe.spriteName = "cross";
          break;
      }
      pipes[i] = pipe;
    }
    return pipes;
  }
  setPipesNeighbours(pipes) {
    for (let i = 0; i < pipes.length; i++) {
      pipes[i].neighbours = [
        null, // top
        null, // east
        null, // bottom
        null  // west
      ];
      const possibleNeighboursPositions = [];
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          // skip the current pipe
          if (x === 0 && y === 0) {
            continue;
          }
          // only horizontal and vertical neighbours
          if (x !== 0 && y !== 0) {
            continue;
          }
          possibleNeighboursPositions.push({ x: x, y: y });
        }
      }
      for (let j = 0; j < pipes.length; j++) {
        const otherPipe = pipes[j];
        if (pipes[i].entity_number === otherPipe.entity_number) {
          continue;
        }
        // check if the other pipe is a neighbour
        for (let k = 0; k < possibleNeighboursPositions.length; k++) {
          const position = possibleNeighboursPositions[k];
          if (pipes[i].position.x + position.x === otherPipe.position.x && pipes[i].position.y + position.y === otherPipe.position.y) {
            otherPipe.direction = null;
            const offset = {
              x: otherPipe.position.x - pipes[i].position.x,
              y: otherPipe.position.y - pipes[i].position.y
            };
            switch (offset.x + "-" + offset.y) {
              case "0--1":
                pipes[i].direction = 0; // top
                break;
              case "1-0":
                pipes[i].direction = 1; // east
                break;
              case "0-1":
                pipes[i].direction = 2; // bottom
                break;
              case "-1-0":
                pipes[i].direction = 3; // west
                break;
            }
            pipes[i].neighbours[pipes[i].direction] = otherPipe;
          }
        }
      }
    }
    return pipes;
  }
  getGraphicsForPreload(factorioElement, element) {
    return Object.values(factorioElement.pictures);
  }
  getGraphics(factorioElement, element) {
    return factorioElement.pictures[element.spriteName];
  }
  render(element, factorioElement, x, y, bp) {
    const bounds = this.getBounds(factorioElement);
    const graphic = this.getGraphics(factorioElement, element);
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
    const layer = graphic.draw_as_shadow ? bp.renderLayers.shadows : bp.renderLayers.low;
    layer.push([bp.graphics_sets[`${element.name}.${graphic.filename}`], x + destinationOffset.x + shift.x * 2, y + destinationOffset.y + shift.y * 2, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 1,
      opacityDest: 1
    }, {element, factorioElement, path: `${element.name}.${graphic.filename}${this.k}`}]);
  }
}

export default Pipe;