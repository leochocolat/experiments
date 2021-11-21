// Vendors
import ResourceLoader from 'resource-loader';
import { Mesh, MeshBasicMaterial, MeshStandardMaterial, MeshNormalMaterial, PerspectiveCamera, PlaneGeometry, Scene, ShaderMaterial, TextureLoader, Vector2, DirectionalLight, Color, BoxGeometry, WebGLRenderTarget, DoubleSide } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Shaders
import vertex from '../shaders/evidence/vertex.glsl';
import fragment from '../shaders/evidence/fragment.glsl';

const RENDER_TARGET_RATIO = 0.5;
const SIZE = 1;

class SceneEvidence extends Scene {
    constructor(options = {}) {
        super();

        this._width = options.width;
        this._height = options.height;
        this._debugger = options.debugger;
        this._renderer = options.renderer;

        this._renderTarget = this._createRenderTarget();
        this._camera = this._createCamera();
        this._controls = this._createControls();
        this._material = this._createMaterial();
        this._model = this._createModel();
        this._light = this._createLight();
        this._backgroundCube = this._createBackgroundCube();

        this._debugFolder = this._createDebugFolder();
    }

    /**
     * Public
     */
    get camera() {
        return this._camera;
    }

    render() {
        this._model.visible = false;

        this._renderer.setRenderTarget(this._renderTarget);
        this._renderer.render(this, this._camera);
        this._renderer.setRenderTarget(null);

        this._model.visible = true;

        this._renderer.render(this, this._camera);
    }

    update(time, delta, fps) {
        this._backgroundCube.rotation.x = time;
        this._backgroundCube.rotation.y = time;
    }

    resize(width, height) {
        this._width = width;
        this._height = height;

        this._camera.aspect = this._width / this._height;
        this._camera.updateProjectionMatrix();

        this._renderTarget.setSize(this._width * RENDER_TARGET_RATIO, this._height * RENDER_TARGET_RATIO);

        this._material.uniforms.resolution.value.set(this._width, this._height);
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
        const normalMap = ResourceLoader.get('normal-map');
        const displacementMap = ResourceLoader.get('vertex-displacement-texture');

        const material = new ShaderMaterial({
            transparent: true,
            vertexShader: vertex,
            fragmentShader: fragment,
            side: DoubleSide,
            // wireframe: true,
            uniforms: {
                normalMap: { value: normalMap },
                displacementMap: { value: displacementMap },
                fboMap: { value: this._renderTarget.texture },
                resolution: { value: new Vector2(this._width, this._height) },
                size: { value: new Vector2(SIZE, SIZE) },
            }
        });

        return material;
    }

    _createModel() {
        // const geometry = new BoxGeometry(SIZE, SIZE, 0.01, 20, 20);
        const geometry = new PlaneGeometry(SIZE, SIZE, 100, 100);

        const mesh = new Mesh(geometry, this._material);
        this.add(mesh);

        return mesh;
    }

    _createLight() {
        const directionalLight = new DirectionalLight(0xffffff, 1);
        directionalLight.position.z = 10;
        // this.add(directionalLight);
        return directionalLight;
    }

    _createBackgroundCube() {
        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshNormalMaterial();
        const mesh = new Mesh(geometry, material);
        mesh.position.z = -5;
        this.add(mesh);
        return mesh;
    }

    _createRenderTarget() {
        const renderTarget = new WebGLRenderTarget(this._width * RENDER_TARGET_RATIO, this._height * RENDER_TARGET_RATIO);
        return renderTarget;
    }

    /**
     * Debug
     */
    _createDebugFolder() {
        if (!this._debugger) return;
    }
}

export default SceneEvidence;