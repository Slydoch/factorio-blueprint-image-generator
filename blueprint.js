import { Jimp, loadFont, BlendMode } from "jimp";
import { SANS_12_BLACK } from "jimp/fonts";
import Preprocessor from "./src/preprocessor.js";
import Entities from "./src/entities/entities.js";

const Types = Object.keys(Entities);

class Blueprint {
  constructor(data, factorio, cb) {
    this.data = data;
    this.preprocessData();
    this.factorio = factorio;
    this.minX = 1.797693134862315E+308;
    this.minY = 1.797693134862315E+308;
    this.maxX = -1.797693134862315E+308;
    this.maxY = -1.797693134862315E+308;
    this.size = { x: 0, y: 0 };
    this.img = [];
    this.font = null;
    this.undoneElements = [];
    this.graphics_sets = {};
    this.pipes = this.listPipes(this.data, this.factorio);
    this.pipes = Entities.pipe.setPipesNeighbours(this.pipes);
    this.pipes = Entities.pipe.calculateSpriteNameForPipes(this.pipes);
    Entities["transport-belt"].listBelts(this.data.blueprint.entities, this.factorio.entities);
    loadFont(SANS_12_BLACK).then(font => {
      this.font = font;
      return this.preloadImages();
    }).then(() => {
      this.init();
      cb(this);
    });
  }
  preprocessData() {
    for (let i = 0; i < this.data.blueprint.entities.length; i++) {
      this.data.blueprint.entities[i] = Preprocessor._Element(this.data.blueprint.entities[i]);
    }
  }
  init() {
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
    for (let i = 0; i < this.data.blueprint.entities.length; i++) {
      if (loadedElements.includes(this.data.blueprint.entities[i].name)) {
        continue;
      }
      loadedElements.push(this.data.blueprint.entities[i].name);
      const element = this.data.blueprint.entities[i];
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
        }
        
        for (let j = 0; j < graphics.length; j++) {
          const graphic = graphics[j];

          graphic.filename = graphic.filename.replace(/__/g, "");
          const graphicPosition = (graphic.x || graphic.y) ? `.${graphic.x || 0}.${graphic.y || 0}` : "";
          if (this.graphics_sets[`${element.name}.${graphic.filename}${graphicPosition}`]) {
            continue;
          }
          
          this.graphics_sets[`${element.name}.${graphic.filename}${graphicPosition}`] = (await Jimp.read(`./factorio/data/${graphic.filename}`)).crop(
            {
              x: graphic.x || 0,
              y: graphic.y || 0,
              w: graphic.width || graphic.size,
              h: graphic.height || graphic.size
            }
          );
        }
      }
    }
  }
  calculateMinAndMax() {
    for (let i = 0; i < this.data.blueprint.entities.length; i++) {
      const element = this.data.blueprint.entities[i];
      this.minX = Math.min(this.minX, element.position.x);
      this.minY = Math.min(this.minY, element.position.y);
      this.maxX = Math.max(this.maxX, element.position.x);
      this.maxY = Math.max(this.maxY, element.position.y);
    }
  }
  calculateSize() {
    this.calculateMinAndMax();
    this.size.x = (this.maxX - this.minX + 1 + 4) * 64;
    this.size.y = (this.maxY - this.minY + 1 + 4) * 64;
  }

  prepare() {
    for (let i = 0; i < this.data.blueprint.entities.length; i++) {
      const element = this.data.blueprint.entities[i];
      const factorioElement = this.factorio.entities[element.name];
      const x = (element.position.x - this.minX + 2) * 64;
      const y = (element.position.y - this.minY + 2) * 64;
      if (Types.includes(factorioElement.type)) {
        Entities[factorioElement.type].render(element, factorioElement, x, y, this.img, this);
        Entities[factorioElement.type].subRender(element, factorioElement, x, y, this.img, this);
      }
      else {
        this.undoneElements.push(element.name);
        //this.renderDefault(element, x, y);
      }
      //this.renderDebugElement(element, x, y);
    }
    // remove undone elements duplicates
    this.undoneElements = [...new Set(this.undoneElements)];
    console.log('undones', this.undoneElements);
  }

  draw() {
    // create a new image with the calculated size
    const img = new Jimp({
      width: this.size.x,
      height: this.size.y,
      color: 0x00000000
    });
    // sort the images by opacity first, then by y, then by x
    this.img.sort((a, b) => {
      if (a[3].opacitySource > b[3].opacitySource) {
        return 1;
      }
      if (a[3].opacitySource < b[3].opacitySource) {
        return -1;
      }
      if (a[2] > b[2]) {
        return 1;
      }
      if (a[2] < b[2]) {
        return -1;
      }
      if (a[1] < b[1]) {
        return 1;
      }
      if (a[1] > b[1]) {
        return -1;
      }
      return 0;
    });
    for (let i = 0; i < this.img.length; i++) {
      const graphic = this.img[i];
      graphic[3].blendMode = BlendMode.DARKEN;
      img.composite(graphic[0], graphic[1], graphic[2], graphic[3]);
    }
    this.renderDebug(img);
    img.write("test.png");
  }
  renderDebug(img) {
    for (let i = 0; i < this.data.blueprint.entities.length; i++) {
      const element = this.data.blueprint.entities[i];
      const x = (element.position.x - this.minX + 2) * 64;
      const y = (element.position.y - this.minY + 2) * 64;
      this.renderDebugElement(img, element, x, y);
    }
  }
  renderDebugElement(img, element, x, y) {
    let factorioElement = null;
    // get the factorio element if it exists
    factorioElement = this.factorio.entities[element.name];
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
        text: factorioElement.type,
        x: x,
        y: y,
        font: this.font
      });
    } catch (error) {
      console.error("error", error);
    }
  }
}
export default Blueprint;