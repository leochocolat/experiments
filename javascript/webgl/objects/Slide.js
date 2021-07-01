// Vendors
import { Mesh, Object3D, PlaneGeometry, ShaderMaterial, Vector2, TextureLoader } from 'three';

// Shaders
import fragment from '../shaders/slider/fragment.glsl';
import vertex from '../shaders/slider/vertex.glsl';

class Slide extends Object3D {
    constructor(options) {
        super();

        this._index = options.index;

        this._viewport = options.viewport;

        this._width = options.width;
        this._height = options.height;

        this._image = options.image;

        this._settings = options.settings;

        this._initialPosition = new Vector2(options.initialPosition, 0);

        this._textureWidth = 0;
        this._textureHeight = 0;

        this._mousePosition = new Vector2(0, 0);
        this._normalizedMousePosition = new Vector2(0, 0);

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

    get settings() {
        return this._settings;
    }

    set settings(value) {
        this._settings = value;

        // Parallax
        this._material.uniforms.u_scale.value = this._settings.parallax.scale;
        
        // Filters
        this._material.uniforms.u_alpha_factor.value = this._settings.filters.alphaFactor;
        this._material.uniforms.u_level_factor.value = this._settings.filters.levelFactor;
        this._material.uniforms.u_saturation_factor.value = this._settings.filters.saturationFactor;
        this._material.uniforms.u_brightness_factor.value = this._settings.filters.brightnessFactor;
        this._material.uniforms.u_contrast_factor.value = this._settings.filters.contrastFactor;

        // Mouse
        this._material.uniforms.u_mouse_scale.value = this._settings.mouseScale;
    }

    get mousePosition() {
        return this._mousePosition;
    }

    set mousePosition(value) {
        this._mousePosition.x = value.x;
        this._mousePosition.y = value.y;
    }

    get normalizedMousePosition() {
        return this._normalizedMousePosition;
    }

    set normalizedMousePosition(value) {
        this._normalizedMousePosition.x = value.x;
        this._normalizedMousePosition.y = value.y;
    }

    update() {
        this._material.uniforms.u_center.value.x = this.position.x + this._initialPosition.x;
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
                // Level
                u_level_min: { value: 0 },
                u_level_max: { value: 1 },
                u_level_factor: { value: this._settings.filters.levelFactor },
                // Sat / Bright / Contrast
                u_saturation_factor: { value: this._settings.filters.saturationFactor },
                u_brightness_factor: { value: this._settings.filters.brightnessFactor },
                u_contrast_factor: { value: this._settings.filters.contrastFactor },
                u_alpha_factor: { value: this._settings.filters.alphaFactor },
                // Scale
                u_scale: { value: this._settings.parallax.scale },
                // Mouse
                // u_mouse_position: { value: this._mousePosition }
                u_mouse_position: { value: this._normalizedMousePosition },
                u_mouse_scale: { value: this._settings.mouseScale },
                u_center: { value: new Vector2(this._initialPosition.x, this._initialPosition.y) }
            },
        });
        
        return material;
    }

    _createPlane() {
        const geometry = new PlaneGeometry(1, 1, 1);
        const mesh = new Mesh(geometry, this._material);
        mesh.scale.set(this._width, this._height, 1);
        mesh.position.x = this._initialPosition.x;

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