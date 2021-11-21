// Utils
import ResourceLoader from 'resource-loader';
import ComponentFactory from './ComponentFactory';

// Loaders
import ThreeGLTFDracoLoader from 'loaders/three-gltf-draco-loader';
import ThreeTextureLoader from 'loaders/three-texture-loader';

// Resources
import resources from './resources';

ResourceLoader.registerLoader(ThreeTextureLoader, 'texture');
ResourceLoader.registerLoader(ThreeGLTFDracoLoader, 'gltf', {
    dracoDecoderPath: './libs/draco/',
});


class App {
    constructor() {
        this._setupResources();
    }

    _setupResources() {
        this._resourceLoader = new ResourceLoader();
        this._resourceLoader.add({ resources });
        this._resourceLoader.preload();
        this._resourceLoader.addEventListener('complete', (response) => {
            this._start();
        });
    }

    _start() {
        ComponentFactory.start();
    }
}

export default App;