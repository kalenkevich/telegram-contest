import Component from './Component';

export default class CanvasComponent extends Component {
    get context() {
        return this.element.getContext("2d");
    }

    clear(animation) {
        this.context.clearRect(0, 0, this.element.width, this.element.height);
    }
}
