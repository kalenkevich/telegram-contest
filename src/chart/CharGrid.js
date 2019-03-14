import { getMaxValueFromColumns } from '../utils';
import CanvasComponent from '../base/CanvasComponent';

/**
 * Class for grid for chart
 */
export default class ChartGrid extends CanvasComponent {
    init() {
        this.data = this.props.data;
    }

    onDataChanged(data) {
        this.data = data;
    }

    render() {
        super.render();

        const { primaryChartColor, pixelRatio, xAxisType } = this.props.options;
        const maxValue = getMaxValueFromColumns(this.data, xAxisType);
        const stepHeight = this.element.height / 6;
        const stepValue = maxValue / 6;

        for (let i = 0; i < 6; i++ ) {
            const path = new Path2D();

            this.context.fillStyle = primaryChartColor;
            this.context.strokeStyle = primaryChartColor;
            this.context.font = `${14 * pixelRatio}px Arial`;
            this.context.lineWidth = pixelRatio;

            path.moveTo(0, stepHeight * i);
            path.lineTo(this.element.width, stepHeight * i);

            path.moveTo(0, stepHeight * i);
            path.lineTo(this.element.width, stepHeight * i);

            this.context.fillText(Math.floor(maxValue - stepValue * i || 0), 10, stepHeight * i - 10);
            this.context.stroke(path);
        }
    }
}
