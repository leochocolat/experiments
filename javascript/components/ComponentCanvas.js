import WebGLApplication from "../webgl";

class ComponentCanvas {
    constructor(options) {
        this.el = options.el;
        this.sceneName = this.el.dataset.scene;

        this.webGLApplication = new WebGLApplication({ canvas: this.el, sceneName: this.sceneName });
    }
}

export default ComponentCanvas;