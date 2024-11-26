import Entity from "./entity.js";
import Pipe from "./pipe.js";
import AssemblingMachine from "./assembling-machine.js";
import Lab from "./lab.js";
import Container from "./container.js";
import StorageTank from "./storage-tank.js";
import TransportBelt from "./transport-belt.js";
import Generator from "./generator.js";
import PipeToGround from "./pipe-to-ground.js";
import UndergroundBelt from "./underground-belt.js";


export default {
  entity: new Entity(),
  pipe: new Pipe(),
  "assembling-machine": new AssemblingMachine(),
  lab: new Lab(),
  container: new Container(),
  "storage-tank": new StorageTank(),
  "transport-belt": new TransportBelt(),
  generator: new Generator(),
  "pipe-to-ground": new PipeToGround(),
  "underground-belt": new UndergroundBelt()
};