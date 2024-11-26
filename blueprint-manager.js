import { Jimp, loadFont, BlendMode } from "jimp";
import { SANS_12_BLACK } from "jimp/fonts";
import Preprocessor from "./src/preprocessor.js";
import Entities from "./src/entities/entities.js";
import Logger from "./src/logger.js";
import Wires from "./src/wires.js";
const logger = new Logger();
const Types = Object.keys(Entities);

class BlueprintManager {
  constructor(bpData, factorio, cb) {
    this.bpData = bpData;
    this.factorio = factorio;
    this.entities = [];
    this.addedElement = [];
    this.preprocessBpData();
    this.wiresManager = new Wires(this, this.bpData.blueprint.wires);
    this.minX = 1.797693134862315E+308;
    this.minY = 1.797693134862315E+308;
    this.maxX = -1.797693134862315E+308;
    this.maxY = -1.797693134862315E+308;
    this.size = { x: 0, y: 0 };
    this.renderLayers = {
      shadows: [],
      low: [],
      mid: [],
      high: []
    };
    this.font = null;
    this.undoneElements = [];
    this.graphics_sets = {};
    this.pipes = [];
    logger.log('BlueprintManager created');
    this.wiresManager.preloadImages().then(() => {
      logger.log('Wires preloaded');
      return loadFont(SANS_12_BLACK);
    }).then(font => {
      logger.log('Font loaded');
      this.font = font;
      return this.preloadImages();
    }).then(() => {
      logger.log('Images preloaded');
      this.initialize();
      cb(this);
    });
  }
  preprocessBpData() {
    for (let i = 0; i < this.bpData.blueprint.entities.length; i++) {
      this.bpData.blueprint.entities[i] = Preprocessor._Element(this.bpData.blueprint.entities[i], this);
    }
    this.entities = [
      ...this.bpData.blueprint.entities
    ];
    this.entities.push(...this.addedElement);
  }
  initialize() {
    this.pipes = this.listPipes(this.bpData, this.factorio);
    this.pipes = Entities.pipe.setPipesNeighbours(this.pipes);
    this.pipes = Entities.pipe.calculateSpriteNameForPipes(this.pipes);
    Entities["transport-belt"].listBelts(this.entities, this.factorio.entities);
    this.calculateSize();
  }
  listPipes(data, factorio) {
    const pipes = [];
    // adding pipes to the list
    for (let i = 0; i < data.blueprint.entities.length; i++) {
      const element = data.blueprint.entities[i];
      if (element.name === "pipe") {
        pipes.push(element);
      }
    }
    // adding fluid boxes entries to the list
    for (let i = 0; i < data.blueprint.entities.length; i++) {
      const element = data.blueprint.entities[i];
      const entity = factorio.entities[element.name];
      if (entity && entity.fluid_box) {
        for (let j = 0; j < entity.fluid_box.pipe_connections.length; j++) {
          const pipeConnection = entity.fluid_box.pipe_connections[j];
          // apply rotation to the pipe connection
          let position = pipeConnection.position;
          let entityManager = Entities[entity.type] || Entities[entity.name];
          if (entityManager) {
            position = entityManager.applyRotation(element, pipeConnection);
          }
          const pipe = {
            entity_number: element.entity_number,
            name: "pipe",
            position: {
              x: element.position.x + position[0],
              y: element.position.y + position[1]
            }
          };
          pipes.push(pipe);
        }
      }
    }
    return pipes;
  }
  async preloadImages() {
    const loadedElements = [];
    for (let i = 0; i < this.entities.length; i++) {
      if (loadedElements.includes(this.entities[i].name)) {
        continue;
      }
      loadedElements.push(this.entities[i].name);
      const element = this.entities[i];
      if (this.factorio.entities[element.name] && Types.includes(this.factorio.entities[element.name].type)) {
        const entity = this.factorio.entities[element.name];
        let entityManager = Entities[entity.type] || Entities[entity.name];
        if (!entityManager || entityManager.customPreload !== undefined) {
          await entityManager.customPreload(entity, element, this.graphics_sets);
          continue;
        }
        let graphics = [];
        if (Types.includes(entity.type)) {
          graphics = entityManager.getGraphicsForPreload(entity, element);
          if(!Array.isArray(graphics)) {
            graphics = [graphics];
          }
        }
        
        for (let j = 0; j < graphics.length; j++) {
          const graphic = graphics[j];
          logger.log(`Loading ${element.name}.${graphic.filename}`, graphic);
          const filenames = [];
          if(Array.isArray(graphic.filenames)) {
            filenames.push(...graphic.filenames);
          } else {
            filenames.push(graphic.filename);
          }
          for(let f = 0; f < filenames.length; f++) {
            let filename = filenames[f];
            filename = filename.replace(/__/g, "");
            const graphicPosition = (graphic.x || graphic.y) ? `.${graphic.x || 0}.${graphic.y || 0}` : "";
            if (this.graphics_sets[`${element.name}.${filename}${graphicPosition}`] || filename.includes("visualization")) {
              continue;
            }
            
            const fullImage = this.graphics_sets[`${element.name}.${filename}`] || (await Jimp.read(`./factorio/data/${filename}`));
            if(!this.graphics_sets[`${element.name}.${filename}`] && graphicPosition !== "") {
              logger.log(`Loading ${element.name}.${filename}`);
              this.graphics_sets[`${element.name}.${filename}`] = fullImage;
            }
            logger.log(`Loading ${element.name}.${filename}${graphicPosition}`);
            this.graphics_sets[`${element.name}.${filename}${graphicPosition}`] = new Jimp({
              width: graphic.width || graphic.size,
              height: graphic.height || graphic.size,
              color: 0x00000000
            });
            this.graphics_sets[`${element.name}.${filename}${graphicPosition}`].blit({
              src: fullImage.clone(),
              srcX: 0,
              srcY: 0,
              x: 0,
              y: 0,
              srcW: graphic.width || graphic.size,
              srcH: graphic.height || graphic.size
            });
          }
        }
      }
    }
  }
  calculateMinAndMax() {
    for (let i = 0; i < this.bpData.blueprint.entities.length; i++) {
      const element = this.bpData.blueprint.entities[i];
      this.minX = Math.min(this.minX, element.position.x);
      this.minY = Math.min(this.minY, element.position.y);
      this.maxX = Math.max(this.maxX, element.position.x);
      this.maxY = Math.max(this.maxY, element.position.y);
    }
  }
  calculateSize() {
    this.calculateMinAndMax();
    this.size.x = (this.maxX - this.minX + 1 + 5) * 64;
    this.size.y = (this.maxY - this.minY + 1 + 5) * 64;
  }

  prepare() {
    for (let i = 0; i < this.entities.length; i++) {
      const element = this.entities[i];
      const factorioElement = this.factorio.entities[element.name];
      const x = (element.position.x - this.minX + 2) * 64;
      const y = (element.position.y - this.minY + 2) * 64;
      if (!factorioElement) {
        logger.error(`Element ${element.name} not found in factorio data`);
        continue;
      }
      if (Types.includes(factorioElement.type)) {
        Entities[factorioElement.type].render(element, factorioElement, x, y, this);
        Entities[factorioElement.type].subRender(element, factorioElement, x, y, this);
      }
      else {
        this.undoneElements.push(element.name);
        //this.renderDefault(element, x, y);
      }
      //this.renderDebugElement(element, x, y);
    }
    // remove undone elements duplicates
    this.undoneElements = [...new Set(this.undoneElements)];
    logger.log('This entities aren\'t done yet', this.undoneElements);
  }

  draw() {
    logger.log('Start drawing, creating images');
    // create a new image with the calculated size
    const img = new Jimp({
      width: this.size.x,
      height: this.size.y,
      color: 0x00000000
    });
    const shadows = new Jimp({
      width: this.size.x,
      height: this.size.y,
      color: 0x00000000
    });
    logger.log('Sorting entities images');
    // sort the images by y, then by x
    ["low", "mid", "high"].forEach(layer => {
      this.renderLayers[layer].sort((a, b) => {
        if (a[2] > b[2]) {
          return 1;
        }
        if (a[2] < b[2]) {
          return -1;
        }
        if (a[1] > b[1]) {
          return 1;
        }
        if (a[1] < b[1]) {
          return -1;
        }
        return 0;
      });
    });
    logger.log('Rendering shadow images');
    for (let i = 0; i < this.renderLayers.shadows.length; i++) {
      const graphic = this.renderLayers.shadows[i];
      graphic[3].blendMode = BlendMode.DARKEN;
      shadows.composite(graphic[0], graphic[1] + 128, graphic[2] + 128, graphic[3]);
    }
    logger.log('Rendering entity images');
    const layers = ["low", "mid", "high"];
    for(let l = 0; l < layers.length; l++) {
      for (let i = 0; i < this.renderLayers[layers[l]].length; i++) {
        const graphic = this.renderLayers[layers[l]][i];
        img.composite(graphic[0], graphic[1] + 128, graphic[2] + 128, graphic[3]);
      }
    }

    logger.log('Rendering debug');
    this.renderDebug(img);
    logger.log('Final compose');
    shadows.composite(img, 0, 0, {
      mode: BlendMode.SCREEN,
      opacitySource: 1,
      opacityDest: 0.5
    }); // shadow becomes 50% transparent, and is drawn over with entities, so now "shadows" contains the final image
    logger.log('Writing image');
    shadows.write("test.png");
    logger.log('Image written to "test.png"');
  }
  renderDebug(img) {
    for (let i = 0; i < this.bpData.blueprint.entities.length; i++) {
      const element = this.bpData.blueprint.entities[i];
      const x = (element.position.x - this.minX + 2) * 64 + 128;
      const y = (element.position.y - this.minY + 2) * 64 + 128;
      this.renderDebugElement(img, element, x, y);
    }
  }
  renderDebugElement(img, element, x, y) {
    let factorioElement = null;
    // get the factorio element if it exists
    factorioElement = this.factorio.entities[element.name];
    if(!factorioElement) {
      return;
    }
    const bounds = Entities.entity.getBounds(factorioElement);

    // draw the by drawing lines around the bounds
    img.scan(x + bounds.x1, y + bounds.y1, bounds.x2 - bounds.x1, 1, (x, y, idx) => {
      img.setPixelColor(0xff0000ff, x, y);
    });
    img.scan(x + bounds.x1, y + bounds.y1, 1, bounds.y2 - bounds.y1, (x, y, idx) => {
      img.setPixelColor(0xff0000ff, x, y);
    });
    img.scan(x + bounds.x1, y + bounds.y2, bounds.x2 - bounds.x1, 1, (x, y, idx) => {
      img.setPixelColor(0xff0000ff, x, y);
    });
    img.scan(x + bounds.x2, y + bounds.y1, 1, bounds.y2 - bounds.y1, (x, y, idx) => {
      img.setPixelColor(0xff0000ff, x, y);
    });
    try {
      img.print({
        text: (element.direction || 0) + " - " + element.entity_number,
        x: x - 32,
        y: y - 6,
        maxWidth: 64,
        font: this.font
      });
    } catch (error) {
      console.error("error", error);
    }
  }
}
export default BlueprintManager;