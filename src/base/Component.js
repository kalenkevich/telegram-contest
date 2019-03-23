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

    destroy() {}

    clear() {
        this.children.forEach(child => child.destroy());
        this.removeChildren();
    }

    removeChildren() {
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
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

    rerender() {
        let currentParent = this.parent;

        if (!currentParent) {
            this.clear();
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
