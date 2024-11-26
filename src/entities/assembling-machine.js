import Entity from "./entity.js";

class AssemblingMachine extends Entity {
  constructor() {
    super();
  }
  getGraphics(factorioElement, element) {
    switch(element.name) {
      case "crusher":
      case "chemical-plant":
        switch(element.direction) {
          case 4:
            return factorioElement.graphics_set.animation.east.layers;
          case 8:
            return factorioElement.graphics_set.animation.south.layers;
          case 12:
            return factorioElement.graphics_set.animation.west.layers;
          default:
            return factorioElement.graphics_set.animation.north.layers;
        }
        case "electromagnetic-plant":
          return factorioElement.graphics_set.idle_animation.layers; // TODO: add building, this is just the base
        default:
          return factorioElement.graphics_set.animation.layers;
    }
  }
  getGraphicsForPreloadForElectromagneticPlant(factorioElement, element) {
    const graphics = [];
    const visualizations = factorioElement.graphics_set.working_visualisations;
    const states = factorioElement.graphics_set.states;
    const statesDict = {};
    visualizations.forEach((visualization) => {
      const v_states = visualization.draw_in_states;
      if(!v_states) return;
      v_states.forEach((v_state) => {
        const state = states.find((s) => s.name === v_state);
        const stateId = states.indexOf(state);
        states[stateId].visualizations = states[stateId].visualizations || [];
        states[stateId].visualizations.push(visualization);
      });
    });
    states.forEach((state) => {
      statesDict[state.name] = state;
    });
    for(let i = 0; i < statesDict["cool-down"].visualizations.length; i++) { // cool-down state seams to be the most fitting idle state
      graphics.push(...statesDict["cool-down"].visualizations[i].animation.layers);
    }
    graphics.push(...factorioElement.graphics_set.idle_animation.layers); // base of the building
    return graphics;
  }
  getGraphicsForPreload(factorioElement, element) {
    switch(element.name) {
      case "crusher":
      case "chemical-plant":
        return [
          ...factorioElement.graphics_set.animation.north.layers,
          ...factorioElement.graphics_set.animation.east.layers,
          ...factorioElement.graphics_set.animation.south.layers,
          ...factorioElement.graphics_set.animation.west.layers
        ];
      case "electromagnetic-plant":
        return this.getGraphicsForPreloadForElectromagneticPlant(factorioElement, element);
      default:
        return factorioElement.graphics_set.animation.layers;
    }
  }
}

export default AssemblingMachine;