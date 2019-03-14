import Component from './Component';

/**
 * Class for canvas component
 */
export default class CanvasComponent extends Component {
    get context() {
        return this.element.getContext("2d");
    }

    clear() {
        this.context.clearRect(0, 0, this.element.width, this.element.height);
    }
}
