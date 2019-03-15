import { getScale } from '../utils';
import CanvasComponent from '../base/CanvasComponent';

class RenderFactory {
    static addToQueue(renderFunction, args, ms) {
        setTimeout(() => window.requestAnimationFrame(() => renderFunction(...args)), ms);
    }
}

class Line {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
}

/**
 * Class for showing graphics itself (lines)
 */
export default class ChartGraphic extends CanvasComponent {
    init() {
        this.data = this.props.data;
    }

    onDataChanged(data) {
        this.data = data;

        this.rerender();
    }

    render() {
        super.render();
        const { animation } = this.props;

        animation ? this.renderWithAnimation() : this.renderWithoutAnimation();
    }

    renderWithoutAnimation() {
        const { xAxisType, canvasPaddingChart, lineWidth } = this.props.options;
        const { scaleX, scaleY } = getScale(this.data, this.element.width, this.element.height, xAxisType);

        (this.data.columns || []).forEach((column, index) => {
            const [name, ...values] = this.data.columns[index];

            if (this.data.types[name] === xAxisType) {
                return;
            }

            const strokeStyle = this.context.strokeStyle;
            this.context.strokeStyle = this.data.colors[name];
            this.context.lineWidth = this.props.lineWidth;

            for (let i = 0; i < values.length;) {
                const path = new Path2D();

                path.moveTo(
                    i * scaleX,
                    this.element.height - values[i] * scaleY + canvasPaddingChart,
                );
                i++;

                path.lineTo(
                    i * scaleX,
                    this.element.height - values[i] * scaleY + canvasPaddingChart
                );

                this.context.lineWidth = this.props.lineWidth;
                this.context.stroke(path);
                this.context.lineWidth = lineWidth;
            }

            this.context.strokeStyle = strokeStyle;
        });
    }

    renderWithAnimation() {
        const { xAxisType } = this.props.options;
        const { scaleX, scaleY } = getScale(this.data, this.element.width, this.element.height, xAxisType);

        (this.data.columns || []).forEach((column, index) => {
            const [name, ...values] = this.data.columns[index];

            if (this.data.types[name] === xAxisType) {
                return;
            }

            const strokeStyle = this.context.strokeStyle;
            this.context.lineWidth = this.props.lineWidth;

            for (let i = 0; i < values.length;) {

                const x1 = i;
                const y1 = values[i];
                ++i;
                const x2 = i;
                const y2 = values[i];
                const line = this.getLine(x1, y1, x2, y2, scaleX, scaleY);

                this.renderLine(line, i, this.data.colors[name]);
            }

            this.context.strokeStyle = strokeStyle;
        });
    }

    getLine(x1, y1, x2, y2, scaleX, scaleY) {
        return new Line(
            x1 * scaleX,
            this.element.height - y1 * scaleY,
            x2 * scaleX,
            this.element.height - y2 * scaleY,
        );
    }

    renderLine(line, lineIndex, color) {
        const deltaX = (line.x2 - line.x1) / 10;
        const deltaY = (line.y2 - line.y1) / 10;
        const maxX = line.x1 > line.x2 ? line.x1 : line.x2;
        let currentX = line.x1 > line.x2 ? line.x2 : line.x1;
        let currentY = line.y1;
        let index = 0;

        while (currentX < maxX) {
            RenderFactory.addToQueue((x1, y1, x2, y2, color) => {
                const path = new Path2D();

                path.moveTo(x1, y1);
                path.lineTo(x2, y2);

                this.context.strokeStyle = color;
                this.context.stroke(path);
            }, [currentX, currentY, currentX + deltaX, currentY+ deltaY, color], lineIndex );

            currentX += deltaX;
            currentY += deltaY;
            index++;
        }
    }
}
