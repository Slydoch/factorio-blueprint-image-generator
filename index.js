import BlueprintManager from "./blueprint-manager.js";
import datas from "./decompressedData.json" with { type: "json" };
import factorio from "./factorio/data/data.json" with { type: "json" };
let bp = datas;
if(datas.blueprint_book) {
  bp = datas.blueprint_book.blueprints[0];
} // TODO handle blueprint books
let blueprintManager = new BlueprintManager(bp, factorio, (bpM) => {
  bpM.prepare();
  bpM.draw();
});