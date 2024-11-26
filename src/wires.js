import { Jimp } from "jimp";

class Wires {
    constructor(bpManager, wires) {
        this.wires = wires;
        this.bpManager = bpManager;
        this.wiresSprites = new Array(6);
        this.wiresSprites[1] = this.bpManager.factorio.utilitySprites.red_wire;
        this.wiresSprites[2] = this.bpManager.factorio.utilitySprites.green_wire;
        this.wiresSprites[5] = this.bpManager.factorio.utilitySprites.copper_wire;
    }
    async preloadImages() {
        for (let i = 0; i < this.wiresSprites.length; i++) {
            if (this.wiresSprites[i] != undefined) {
              this.wiresSprites[i].jimpImage = await Jimp.read('./factorio/data/' + this.wiresSprites[i].filename.replace(/__/g, "/"));
            }
        }
    }
    prepare() {

    }
}

export default Wires;