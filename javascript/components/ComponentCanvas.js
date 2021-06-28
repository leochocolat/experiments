import WebGLApplication from "../webgl";

class ComponentCanvas {
    constructor(options) {
        this.el = options.el;

        this.webGLApplication = new WebGLApplication({ canvas: this.el });
    }
}

export default ComponentCanvas;