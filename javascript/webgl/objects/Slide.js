// Vendors
import { Mesh, Object3D, PlaneGeometry, ShaderMaterial, Vector2, TextureLoader } from 'three';

// Shaders
import fragment from '../shaders/slider/fragment.glsl';
import vertex from '../shaders/slider/vertex.glsl';

class Slide extends Object3D {
    constructor(options) {
        super();

        this._viewport = options.viewport;

        this._width = options.width;
        this._height = options.height;

        this._image = options.image;

        this._imageScale = options.imageScale;

        this._initialPosition = options.initialPosition;

        this._textureWidth = 0;
        this._textureHeight = 0;

        this._bindAll();

        this._texture = this._createTexture();
        this._material = this._createMaterial();
        this._plane = this._createPlane();
    }

    /**
     * Public
     */
    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    get imageScale() {
        return this._imageScale;
    }

    set imageScale(value) {
        this._imageScale = value;
        this._material.uniforms.u_scale.value = value;
    }

    /**
     * Private
     */
    _createTexture() {
        const texture = new TextureLoader().load(this._image, this._loadTextureHandler);
        return texture;
    }

    _createMaterial() {
        const material = new ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            uniforms: {
                u_time: { value: 0 },
                u_screen_resolution: { value: new Vector2(this._viewport.width, this._viewport.height) },
                u_resolution: { value: new Vector2(this._width, this._height) },
                u_texture: { value: this._texture },
                u_aspect_ratio: { value: new Vector2(this._textureWidth, this._textureHeight) },
                // Fade
                u_alpha: { value: 1 },
                // Level
                u_level_min: { value: 0 },
                u_level_max: { value: 1 },
                u_level: { value: 0.5 },
                // Sat / Bright / Contrast
                u_saturation: { value: 0.4 },
                u_brightness: { value: 1.1 },
                u_contrast: { value: 1 },
                // Progress
                u_uv_offset_x: { value: 0 },
                // Scale
                u_scale: { value: this._imageScale },
            },
        });
        
        return material;
    }

    _createPlane() {
        const geometry = new PlaneGeometry(1, 1, 1);
        const mesh = new Mesh(geometry, this._material);
        mesh.scale.set(this._width, this._height, 1);
        mesh.position.x = this._initialPosition;

        this.add(mesh);

        return mesh;
    }

    _bindAll() {
        this._loadTextureHandler = this._loadTextureHandler.bind(this);
    }

    _loadTextureHandler() {
        this._textureWidth = this._texture.image.width;
        this._textureHeight = this._texture.image.height;
        this._material?.uniforms.u_aspect_ratio.value.set(this._textureWidth, this._textureHeight);
    }
}

export default Slide;