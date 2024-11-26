import Blueprint from "./blueprint.js";
import datas from "./decompressedData.json" with { type: "json" };
import factorio from "./factorio/data/data.json" with { type: "json" };
console.log(factorio.entities["chemical-plant"]);