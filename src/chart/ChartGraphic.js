import { getScale } from '../utils';
import CanvasComponent from '../base/CanvasComponent';

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
        const { xAxisType, canvasPaddingChart } = this.props.options;
        const { scaleX, scaleY } = getScale(this.data, this.element.width, this.element.height, xAxisType);

        (this.data.columns || []).forEach((column, index) => {
            const [name, ...values] = this.data.columns[index];

            if (this.data.types[name] === xAxisType) {
                return;
            }

            const strokeStyle = this.context.strokeStyle;
            this.context.strokeStyle = this.data.colors[name];

            for (let i = 0; i < values.length;) {
                const path = new Path2D();
                const lineWidth = this.context.lineWidth;

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
}
