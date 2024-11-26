

class Preprocessor {

  static _Element(element) {
    element = Preprocessor._Element_p_logistic_container(element);
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
}

export default Preprocessor;