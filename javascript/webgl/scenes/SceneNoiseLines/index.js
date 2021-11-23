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

// Shaders postprocessing
import whiteNoiseVertex from './shaders/postprocessing/whiteNoise/vertex.glsl';
import whiteNoiseFragment from './shaders/postprocessing/whiteNoise/fragment.glsl';

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
        const scaledTime = time * this._settings.speed;
        this._material.uniforms.time.value = scaledTime;
        this._passes.whiteNoisePass.uniforms.time.value = scaledTime;
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
        passes.bloomPass = this._createBloomPass(debugFolder);
        passes.afterImagePass = this._createAfterImagePass(debugFolder);
        passes.whiteNoisePass = this._createWhiteNoisePass(debugFolder);

        return passes;
    }

    _createRenderPass() {
        const renderPass = new RenderPass(this, this._camera);
        this._composer.addPass(renderPass);
        return renderPass;
    }

    _createBloomPass(debugFolder) {
        const pass = new UnrealBloomPass(new Vector2(), 0.5, 0.53, 0);
        // pass.enabled = true;
        pass.enabled = false;
        this._composer.addPass(pass);

        const bloom = debugFolder.addFolder({ title: 'Bloom' });
        bloom.addInput(pass, 'enabled');
        bloom.addInput(pass, 'strength', { min: 0, max: 3 });
        bloom.addInput(pass, 'radius', { min: 0, max: 1 });
        bloom.addInput(pass, 'threshold', { min: 0, max: 1 });

        return pass;
    }

    _createAfterImagePass(debugFolder) {
        const pass = new AfterimagePass(0.95, 0.1);
        // pass.enabled = true;
        pass.enabled = false;
        this._composer.addPass(pass);

        const afterImage = debugFolder.addFolder({ title: 'After Image' });
        afterImage.addInput(pass, 'enabled');
        afterImage.addInput(pass, 'damp', { min: 0, max: 1 });
        afterImage.addInput(pass, 'factor', { min: 0, max: 1 });

        return pass;
    }

    _createWhiteNoisePass(debugFolder) {
        const pass = new ShaderPass({
            uniforms: {
                time: { value: 0 },
                tDiffuse: { value: null },
                resolution: { value: new Vector2(this._width, this._height) },
                intensiy: { value: 0.15 },
            },
            vertexShader: whiteNoiseVertex,
            fragmentShader: whiteNoiseFragment,
        });
        pass.enabled = true;
        // pass.enabled = false;
        this._composer.addPass(pass);

        const whiteNoise = debugFolder.addFolder({ title: 'White Noise' });
        whiteNoise.addInput(pass, 'enabled');
        whiteNoise.addInput(pass.uniforms.intensiy, 'value', { label: 'Intensity', min: 0, max: 1 });

        return pass;
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
                time: { value: 0 },
                // Colors
                color1: { value: new Color(this._settings.colors.color1) },
                color2: { value: new Color(this._settings.colors.color2) },
                color3: { value: new Color(this._settings.colors.color3) },
                // Pattern
                patternScale: { value: 40.0 },
                // Noises
                simplexScale: { value: 2.0 },
                whiteNoiseScale: { value: 20.0 },
                // Displacement
                displacementAmplitude: { value: 0.1 },
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

        const global = this._debugger.addFolder({ title: 'Global' });
        global.addInput(this._settings, 'speed', { label: 'Speed', min: 0, max: 2 });

        const colors = this._debugger.addFolder({ title: 'Colors' });
        colors.addInput(this._settings.colors, 'color1', { label: 'Color 1' }).on('change', this._settingsChangedHandler);
        colors.addInput(this._settings.colors, 'color2', { label: 'Color 2' }).on('change', this._settingsChangedHandler);
        colors.addInput(this._settings.colors, 'color3', { label: 'Color 3' }).on('change', this._settingsChangedHandler);

        const pattern = this._debugger.addFolder({ title: 'Pattern' });
        pattern.addInput(this._material.uniforms.patternScale, 'value', { label: 'Scale', min: 0, max: 100 });

        const noise = this._debugger.addFolder({ title: 'Noise' });
        noise.addInput(this._material.uniforms.simplexScale, 'value', { label: 'Simplex Scale', min: 0, max: 10 });
        noise.addInput(this._material.uniforms.whiteNoiseScale, 'value', { label: 'White Noise Scale', min: 0, max: 1000 });

        const displacement = this._debugger.addFolder({ title: 'Displacement' });
        displacement.addInput(this._material.uniforms.displacementAmplitude, 'value', { label: 'Amplitude', min: 0, max: 10 });

        this._debugger.addButton({ title: 'Export' }).on('click', this._export);
    }

    /**
     * Events
     */
    _bindAll() {
        this._settingsChangedHandler = this._settingsChangedHandler.bind(this);
        this._export = this._export.bind(this);
    }

    _settingsChangedHandler() {
        this._material.uniforms.color1.value.set(this._settings.colors.color1);
        this._material.uniforms.color2.value.set(this._settings.colors.color2);
        this._material.uniforms.color3.value.set(this._settings.colors.color3);
    }
}

export default SceneNoiseLines;