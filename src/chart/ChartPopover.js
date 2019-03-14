import CanvasComponent from '../base/CanvasComponent';

export default class ChartPopover extends CanvasComponent {
    init() {
        this.data = this.props.data;
        this.pos = {
            x: null,
            y: null,
        };
        this.offset = {
            left: this.element.offsetLeft,
            top: this.element.offsetTop,
            width: this.element.offsetWidth,
            height: this.element.offsetHeight,
        };
        this.dim = {
            width: this.element.width,
            height: this.element.height,
        };

        this.onMouseMove = this.onMouseMove.bind(this);
        this.element.addEventListener("mousemove", this.onMouseMove);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.element.addEventListener("mouseleave", this.onMouseLeave);
    }

    onDataChanged(data) {
        this.data = data;
    }

    getMouseAlignmentData(pageX, pageY) {
        const { legendActiveAreaStretchBorderWidth } = this.props.options;
        const grabOffset = {
            x: pageX - this.offset.left,
            y: pageY - this.offset.top,
        };

        const isChartArea = grabOffset.x >= legendActiveAreaStretchBorderWidth
            && grabOffset.x <= this.dim.width - legendActiveAreaStretchBorderWidth
            && grabOffset.y >= 0
            && grabOffset.y <= this.dim.height;

        return {
            grabOffset,
            isChartArea,
        };
    }

    onMouseLeave() {
        this.pos.x = null;
        this.pos.y = null;

        this.rerender();
    }

    onMouseMove(event) {
        const { grabOffset } = this.getMouseAlignmentData(event.pageX, event.pageY);

        this.pos.x = grabOffset.x;
        this.pos.y = grabOffset.y;

        this.rerender();
    }

    render() {
        super.render();

        const { pixelRatio } = this.props.options;

        if (this.pos.x) {
            const path = new Path2D();

            path.moveTo(this.pos.x * pixelRatio, 0);
            path.lineTo(this.pos.x * pixelRatio, this.dim.height);

            this.context.stroke(path);
        }
    }
}
