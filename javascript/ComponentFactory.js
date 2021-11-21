const COMPONENTS = {
  'canvas': () => import('./components/ComponentCanvas.js'),
  'canvas2d': () => import('./components/ComponentCanvas2d.js'),
};

class ComponentFactory {
    constructor() {
        this._selector = 'data-component';
        this._components = [];
    }

    start() {
        this._elements = document.querySelectorAll(`[${this._selector}]`);

        for (let i = 0, limit = this._elements.length; i < limit; i++) {
            const element = this._elements[i];
            const componentName = element.getAttribute(this._selector);
            if (COMPONENTS[componentName]) {
                COMPONENTS[componentName]().then(value => {
                    let component = new value.default({ el: element });
                    this._components.push(component);
                });
            } else {
                console.log(`Component: '${componentName}' not found`);
            }
        }
    }
}

export default new ComponentFactory();