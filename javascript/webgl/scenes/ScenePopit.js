// Vendors
import ResourceLoader from 'resource-loader';
import { Mesh, MeshBasicMaterial, MeshNormalMaterial, PerspectiveCamera, PlaneGeometry, Scene, ShaderMaterial, TextureLoader, Vector2 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Shaders
import fragment from '../shaders/popit/fragment.glsl';
import vertex from '../shaders/popit/vertex.glsl';

class ScenePopit extends Scene {
    constructor(options = {}) {
        super();

        this._width = options.width;
        this._height = options.height;
        this._debugger = options.debugger;
        this._renderer = options.renderer;

        this._camera = this._createCamera();
        this._controls = this._createControls();
        this._material = this._createMaterial();
        this._logo = this._createLogo();

        this._debugFolder = this._createDebugFolder();
    }

    /**
     * Public
     */
    get camera() {
        return this._camera;
    }

    update(time, delta, fps) {
        this._material.uniforms.u_time.value = time;
    }

    resize(width, height) {
        this._width = width;
        this._height = height;

        this._camera.aspect = this._width / this._height;
        this._camera.updateProjectionMatrix();
    }

    /**
     * Private
     */
    _createCamera() {
        const camera = new PerspectiveCamera(75, this._width / this._height, 0.1, 1000);
        camera.position.z = 1.5;
        return camera;
    }

    _createControls() {
        const controls = new OrbitControls(this._camera, this._renderer.domElement);

        return controls;
    }

    _createMaterial() {
        const material = new ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            uniforms: {
                u_time: { value: 0 },
                u_angle: { value: 0 },
            },
        });

        return material;
    }

    _createLogo() {
        const logo = ResourceLoader.get('popit').scene;
        
        logo.traverse((child) => {
            if (child.isMesh) child.material = this._material;
        });

        logo.position.y = -0.25;

        this.add(logo);

        return logo;
    }

    /**
     * Debug
     */
    _createDebugFolder() {
        if (!this._debugger) return;

        this._debugger.addInput(this._material.uniforms.u_angle, 'value', { min: 0, max: 100 });
    }
}

export default ScenePopit;