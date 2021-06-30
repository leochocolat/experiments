/**
 * SCSS
 */
import './scss/app.scss';

/**
 * JAVASCRIPT
 */
import gsap from 'gsap';
import InertiaPlugin from './javascript/vendors/gsap/InertiaPlugin';
import App from './javascript/App';

gsap.registerPlugin(InertiaPlugin);

new App();