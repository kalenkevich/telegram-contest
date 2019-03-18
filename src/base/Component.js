/**
 * Base component which is element of the components tree,
 * where can be access to parents and children
 */
export default class Component {
    constructor(element, props = {}) {
        this.element = element;
        this.props = props;
        this.children = [];
        this.parent = null;
        this.init();
    }

    appendChild(child) {
        this.children.push(child);

        child.parent = this;
    }

    init() {}

    clear() {
        this.element.innerHTML = '';
    }

    render() {
        this.children.forEach(child => child.render());
    }

    onOptionsChanged(newOptions) {
        this.props.options = newOptions;

        this.children.forEach(child => child.onOptionsChanged(newOptions));

        if (!this.parent) {
            this.rerender();
        }
    }

    //Todo do it more effective, now for every child it will render from root parent
    rerender() {
        let currentParent = this.parent;

        if (!currentParent) {
            this.render();

            return;
        }

        let nextParent = this.parent.parent;

        while (nextParent !== null) {
            currentParent = nextParent;
            nextParent = currentParent.parent;
        }

        currentParent.clear();
        currentParent.render();
    }
}
