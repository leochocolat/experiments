// Vendors
import ResourceLoader from 'resource-loader';
import { BoxGeometry, Color, DoubleSide, Mesh, MeshBasicMaterial, MeshNormalMaterial, PerspectiveCamera, PlaneGeometry, Scene, ShaderMaterial, TextureLoader, Vector2 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from '../../../vendors/postprocessing/UnrealBloomPass';
import { AfterimagePass } from '../../../vendors/postprocessing/AfterimagePass.js';

// Shaders
import vertex from './shaders/vertex.glsl';
import fragment from './shaders/fragment.glsl';

const PERSPECTIVE = 800;

class SceneNoiseLines extends Scene {
    constructor(options = {}) {
        super();

        this._name = 'Noise Lines';
        this._width = options.width;
        this._height = options.height;
        this._debugger = options.debugger;
        this._renderer = options.renderer;

        this._settings = {
            colors: {
                color1: '#ff6f6f',
                color2: '#7f7fff',
                color3: '#7dff7d',
            },
            speed: 0.15,
        }

        this._bindAll();

        this._camera = this._createCamera();
        this._composer = this._createComposer();
        this._passes = this._createPasses();
        this._controls = this._createControls();
        this._material = this._createMaterial();
        this._plane = this._createPlane();

        this._debugFolder = this._createDebugFolder();
    }

    /**
     * Public
     */
    get camera() {
        return this._camera;
    }

    render() {
        this._composer.render();
        // this._renderer.render(this, this._camera);
    }

    update(time, delta, fps) {
        
    }

    resize(width, height) {
        this._width = width;
        this._height = height;

        this._plane.scale.set(this._width, this._height);
        this._material.uniforms.resolution.value.set(this._width, this._height);

        this._camera.aspect = this._width / this._height;
        this._camera.fov = (180 * (2 * Math.atan(this._height / 2 / PERSPECTIVE))) / Math.PI;
        this._camera.updateProjectionMatrix();
    }

    /**
     * Private
     */
    _createComposer() {
        const composer = new EffectComposer(this._renderer);
        return composer;
    }

    _createPasses() {
        const debugFolder = this._debugger.addFolder({ title: 'Postprocessing' });

        const passes = {};
        passes.renderPass = this._createRenderPass();

        return passes;
    }

    _createRenderPass() {
        const renderPass = new RenderPass(this, this._camera);
        this._composer.addPass(renderPass);
        return renderPass;
    }

    _createCamera() {
        const aspect = this._width / this._height;
        const fov = (180 * (2 * Math.atan(this._height / 2 / PERSPECTIVE))) / Math.PI;
        const camera = new PerspectiveCamera(fov, aspect, 0.1, 10000);
        camera.position.z = PERSPECTIVE;
        return camera;
    }

    _createMaterial() {
        const material = new ShaderMaterial({
            side: DoubleSide,
            vertexShader: vertex,
            fragmentShader: fragment,
            uniforms: {
                // Base
                resolution: { value: new Vector2(this._width, this._height) },
                // ID
                id: { value: 1 },
                // Scale
                whiteNoiseScale: { value: 150 }
            }
        });

        return material;
    }

    _createPlane() {
        const geometry = new PlaneGeometry(1, 1, 1);
        const mesh = new Mesh(geometry, this._material);
        mesh.scale.set(this._width, this._height);
        this.add(mesh);
        return mesh;
    }

    _createControls() {
        const controls = new OrbitControls(this._camera, this._renderer.domElement);
        return controls;
    }

    _export() {
        const downloadButton = document.createElement('a');
        downloadButton.download = `${this._name}.png`;
        downloadButton.href = this._renderer.domElement.toDataURL('image/png');
        downloadButton.click();
    }

    /**
     * Debug
     */
    _createDebugFolder() {
        if (!this._debugger) return;

        const noise = this._debugger.addFolder({ title: 'Noise' });
        noise.addInput(this._plane.material.uniforms.id, 'value', { label: 'id', min: 1, max: 1000, step: 1 });
        noise.addInput(this._plane.material.uniforms.whiteNoiseScale, 'value', { label: 'whiteNoiseScale', min: 0, max: 1000 });

        this._debugger.addButton({ title: 'Export' }).on('click', this._export);
    }

    /**
     * Events
     */
    _bindAll() {
        this._export = this._export.bind(this);
    }
}

export default SceneNoiseLines;