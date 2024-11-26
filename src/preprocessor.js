

class Preprocessor {

  static _Element(element, bpManager) {
    element = Preprocessor._Element_p_logistic_container(element);
    Preprocessor._Element_underground_belt_to_belt(element, bpManager);
    return element;
  }

  static _Element_p_logistic_container(element) {
    
    if(element.name == "logistic-chest-active-provider") {
      element.name = "active-provider-chest";
    } else if(element.name == "logistic-chest-passive-provider") {
      element.name = "passive-provider-chest";
    } else if(element.name == "logistic-chest-storage") {
      element.name = "storage-chest";
    } else if(element.name == "logistic-chest-buffer") {
      element.name = "buffer-chest";
    } else if(element.name == "logistic-chest-requester") {
      element.name = "requester-chest";
    }
    return element;
  }
  static _Element_underground_belt_to_belt(element, bpManager) {
    const entity = bpManager.factorio.entities[element.name];
    if(entity && entity.type == "underground-belt") {
      const beltname = element.name.replace("underground-belt", "transport-belt");

      bpManager.addedElement.push({
        type: "transport-belt",
        name: beltname,
        position: {
          x: element.position.x,
          y: element.position.y
        },
        forceStraight: true,
        drawIn: element.type == "input",
        drawOut: element.type == "output",
        direction: element.direction,
      });
    }
  }
}

export default Preprocessor;