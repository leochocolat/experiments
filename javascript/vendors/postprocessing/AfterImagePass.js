import {
	LinearFilter,
	MeshBasicMaterial,
	NearestFilter,
	RGBAFormat,
	ShaderMaterial,
	UniformsUtils,
	WebGLRenderTarget
} from 'three';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
import { AfterimageShader } from './AfterImageShader';

class AfterimagePass extends Pass {

	constructor( damp = 0.96, factor = 0.1 ) {
		super();


		if ( AfterimageShader === undefined ) console.error( 'THREE.AfterimagePass relies on AfterimageShader' );

		this.shader = AfterimageShader;

		this.uniforms = UniformsUtils.clone( this.shader.uniforms );

        this._damp = damp;
        this._factor = factor;

		this.uniforms[ 'damp' ].value = this._damp;
		this.uniforms[ 'factor' ].value = this._factor;

		this.textureComp = new WebGLRenderTarget( window.innerWidth, window.innerHeight, {

			minFilter: LinearFilter,
			magFilter: NearestFilter,
			format: RGBAFormat

		} );

		this.textureOld = new WebGLRenderTarget( window.innerWidth, window.innerHeight, {

			minFilter: LinearFilter,
			magFilter: NearestFilter,
			format: RGBAFormat

		} );

		this.shaderMaterial = new ShaderMaterial( {

			uniforms: this.uniforms,
			vertexShader: this.shader.vertexShader,
			fragmentShader: this.shader.fragmentShader

		} );

		this.compFsQuad = new FullScreenQuad( this.shaderMaterial );

		const material = new MeshBasicMaterial();
		this.copyFsQuad = new FullScreenQuad( material );

	}

    get damp() {
        return this._damp;
    }

    set damp(value) {
        this._damp = value;
        this.uniforms[ 'damp' ].value = this._damp;
    }

    get factor() {
        return this._factor;
    }

    set factor(value) {
        this._factor = value;
        this.uniforms[ 'factor' ].value = this._factor;
    }

	render( renderer, writeBuffer, readBuffer/*, deltaTime, maskActive*/ ) {

		this.uniforms[ 'tOld' ].value = this.textureOld.texture;
		this.uniforms[ 'tNew' ].value = readBuffer.texture;

		renderer.setRenderTarget( this.textureComp );
		this.compFsQuad.render( renderer );

		this.copyFsQuad.material.map = this.textureComp.texture;

		if ( this.renderToScreen ) {

			renderer.setRenderTarget( null );
			this.copyFsQuad.render( renderer );

		} else {

			renderer.setRenderTarget( writeBuffer );

			if ( this.clear ) renderer.clear();

			this.copyFsQuad.render( renderer );

		}

		// Swap buffers.
		const temp = this.textureOld;
		this.textureOld = this.textureComp;
		this.textureComp = temp;
		// Now textureOld contains the latest image, ready for the next frame.

	}

	setSize( width, height ) {

		this.textureComp.setSize( width, height );
		this.textureOld.setSize( width, height );

	}

}

export { AfterimagePass };
