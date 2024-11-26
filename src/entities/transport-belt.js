import Entity from "./entity.js";
import FactorioUtil from "../factorio-util.js";
import { Jimp } from "jimp";
import Logger from "../logger.js";
const logger = new Logger("entity.transport-belt");

class TransportBelt extends Entity {
  constructor() {
    super();
    this.belts = [];
    this.directions = {
      "north": 0,
      "northeast": 1,
      "east": 2,
      "southeast": 3,
      "south": 4,
      "southwest": 5,
      "west": 6,
      "northwest": 7
    };
    this.neighboursIndex = {
      "north": 0,
      "east": 1,
      "south": 2,
      "west": 3
    };
    this.models = {
      "west-east": 0,
      "east-west": 1,
      "south-north": 2,
      "north-south": 3,
      "east-north": 4,
      "north-east": 5,
      "west-north": 6,
      "north-west": 7,
      "south-east": 8,
      "east-south": 9,
      "south-west": 10,
      "west-south": 11,
      "ending-south-in": 12,
      "ending-south-out": 13,
      "ending-west-in": 14,
      "ending-west-out": 15,
      "ending-north-in": 16,
      "ending-north-out": 17,
      "ending-east-in": 18,
      "ending-east-out": 19,
    };
  }
  listBelts(data, factorioData) {
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      const entity = factorioData[element.name];
      if (!entity) {
        continue;
      }
      if (entity.type == "transport-belt" || (entity.type == "underground-belt" && element.type == "output")) {
        element.direction = element.direction || 0;
        this.belts.push(element);
      }
    }
    this.belts = this.setBeltsNeighbours(this.belts);
    this.belts = this.calculateSpriteIdForBelts(this.belts);

  }

  setBeltsNeighbours(belts) {
    for (let i = 0; i < belts.length; i++) {
      const belt = belts[i];
      belt.neighbours = [
        { direction: -1 },
        { direction: -1 },
        { direction: -1 },
        { direction: -1 }
      ];
      for (let j = 0; j < belts.length; j++) {
        if (i === j) {
          continue;
        }
        const otherBelt = belts[j];
        if (belt.position.x === otherBelt.position.x) {
          if (belt.position.y - 1 === otherBelt.position.y) { // north
            belt.neighbours[this.neighboursIndex.north] = otherBelt;
          } else if (belt.position.y + 1 === otherBelt.position.y) { // south
            belt.neighbours[this.neighboursIndex.south] = otherBelt;
          }
        } else if (belt.position.y === otherBelt.position.y) {
          if (belt.position.x - 1 === otherBelt.position.x) { // west
            belt.neighbours[this.neighboursIndex.west] = otherBelt;
          } else if (belt.position.x + 1 === otherBelt.position.x) { // east
            belt.neighbours[this.neighboursIndex.east] = otherBelt;
          }
        }
      }
    }
    return belts;
  }
  calculateSpriteIdForBelts(belts) {
    for (let i = 0; i < belts.length; i++) {
      const belt = belts[i];
      const direction = belt.direction;
      let spriteId = this.models["south-north"];
      switch (direction) {
        case FactorioUtil._directions.north:
          if (belt.forceStraight || belt.neighbours[this.neighboursIndex["south"]].direction === FactorioUtil._directions["north"]) {
            spriteId = this.models["south-north"];
          } else if (
            belt.neighbours[this.neighboursIndex["east"]].direction === FactorioUtil._directions["west"] &&
            belt.neighbours[this.neighboursIndex["west"]].direction !== FactorioUtil._directions["east"]
          ) {
            spriteId = this.models["east-north"];
          } else if (
            belt.neighbours[this.neighboursIndex["west"]].direction === FactorioUtil._directions["east"] &&
            belt.neighbours[this.neighboursIndex["east"]].direction !== FactorioUtil._directions["west"]
          ) {
            spriteId = this.models["west-north"];
          } else {
            spriteId = this.models["south-north"];
          }
          break;
        case FactorioUtil._directions.east:
          if (belt.forceStraight || belt.neighbours[this.neighboursIndex["west"]].direction === FactorioUtil._directions["east"]) {
            spriteId = this.models["west-east"];
          } else if (
            belt.neighbours[this.neighboursIndex["north"]].direction === FactorioUtil._directions["south"] &&
            belt.neighbours[this.neighboursIndex["south"]].direction !== FactorioUtil._directions["north"]
          ) {
            spriteId = this.models["north-east"];
          } else if (
            belt.neighbours[this.neighboursIndex["south"]].direction === FactorioUtil._directions["north"] &&
            belt.neighbours[this.neighboursIndex["north"]].direction !== FactorioUtil._directions["south"]
          ) {
            spriteId = this.models["south-east"];
          } else {
            spriteId = this.models["west-east"];
          }
          break;
        case FactorioUtil._directions.south:
          if (belt.forceStraight || belt.neighbours[this.neighboursIndex["north"]].direction === FactorioUtil._directions["south"]) {
            spriteId = this.models["north-south"];
          } else if (
            belt.neighbours[this.neighboursIndex["east"]].direction === FactorioUtil._directions["west"] &&
            belt.neighbours[this.neighboursIndex["west"]].direction !== FactorioUtil._directions["east"]
          ) {
            spriteId = this.models["east-south"];
          } else if (
            belt.neighbours[this.neighboursIndex["west"]].direction === FactorioUtil._directions["east"] &&
            belt.neighbours[this.neighboursIndex["east"]].direction !== FactorioUtil._directions["west"]
          ) {
            spriteId = this.models["west-south"];
          } else {
            spriteId = this.models["north-south"];
          }
          break;
        case FactorioUtil._directions.west:
          if (belt.forceStraight || belt.neighbours[this.neighboursIndex["east"]].direction === FactorioUtil._directions["west"]) {
            spriteId = this.models["east-west"];
          } else if (
            belt.neighbours[this.neighboursIndex["north"]].direction === FactorioUtil._directions["south"] &&
            belt.neighbours[this.neighboursIndex["south"]].direction !== FactorioUtil._directions["north"]
          ) {
            spriteId = this.models["north-west"];
          } else if (
            belt.neighbours[this.neighboursIndex["south"]].direction === FactorioUtil._directions["north"] &&
            belt.neighbours[this.neighboursIndex["north"]].direction !== FactorioUtil._directions["south"]
          ) {
            spriteId = this.models["south-west"];
          } else {
            spriteId = this.models["east-west"];
          }
          break;
      }
      belt.spriteId = spriteId;
    }
    return belts;
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
      for (let k = 0; k < graphic.direction_count; k++) {
        graphics_sets[`${element.name}.${graphic.filename}.${k}`] = new Jimp({
          width: graphic.width || graphic.size,
          height: graphic.height || graphic.size,
          color: 0x00000000
        });
        graphics_sets[`${element.name}.${graphic.filename}.${k}`].blit({
          src: fullImage.clone(),
          srcX: 0,
          srcY: k * (graphic.height || graphic.size),
          x: 0,
          y: 0,
          srcW: graphic.width || graphic.size,
          srcH: graphic.height || graphic.size
        })
      }
    }
  }

  subRender(element, factorioElement, x, y, bp) {
    const spriteName = Object.keys(this.models)[element.spriteId].split("-");
    const from = spriteName[0];
    const to = spriteName[1];
    const bounds = this.getBounds(factorioElement);
    const graphic = this.getGraphics(factorioElement, element);
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
    const composeModelNameA = "ending-" + from + "-in";
    const composeModelNameB = "ending-" + to + "-out";
    const modelA = this.models[composeModelNameA];
    const modelB = this.models[composeModelNameB];
    const shiftA = {
      x: (from == "east") ? 64 : (from == "west") ? -64 : 0,
      y: (from == "south") ? 64 : (from == "north") ? -64 : 0
    };
    const shiftB = {
      x: (to == "east") ? 64 : (to == "west") ? -64 : 0,
      y: (to == "south") ? 64 : (to == "north") ? -64 : 0
    };
    if ((element.drawIn !== false) && element.neighbours[this.neighboursIndex[from]].direction != FactorioUtil._reverseDirections[from]) {
      const layer = bp.renderLayers.mid;
      layer.push([bp.graphics_sets[`${element.name}.${graphic.filename}.${modelA}`], x + destinationOffset.x + shiftA.x, y + destinationOffset.y + shiftA.y, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 1,
        opacityDest: 1
      }, {
        element,
        factorioElement,
        path: `${element.name}.${graphic.filename}.${modelA}`
      }]);
    }
    const neighbourTo = element.neighbours[this.neighboursIndex[to]];
    const neighbourToFrom = neighbourTo.entity_number ? Object.keys(this.models)[neighbourTo.spriteId].split("-")[0] : false;
    if (
      (element.drawOut !== false) && 
      (
        neighbourTo.direction === -1 ||
        (
          neighbourToFrom && FactorioUtil._directions[neighbourToFrom] != FactorioUtil._reverseDirections[to]
        )
      )
    ) {
      const layer = bp.renderLayers.mid;
      layer.push([bp.graphics_sets[`${element.name}.${graphic.filename}.${modelB}`], x + destinationOffset.x + shiftB.x, y + destinationOffset.y + shiftB.y, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 1,
        opacityDest: 1
      }, {
        element,
        factorioElement,
        path: `${element.name}.${graphic.filename}.${modelB}`
      }]);
    }
  }

  getGraphics(factorioElement, element) {
    this.k = `.${element.spriteId}`;
    return factorioElement.belt_animation_set.animation_set;
  }
}

export default TransportBelt;