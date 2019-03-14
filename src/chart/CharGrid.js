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

        //this.renderXAxis();
        this.renderYAxis();
    }

    getFormattedDate(date) {
        const formatter = new Intl.DateTimeFormat('ru-RU');

        return formatter.format(new Date(date));
    }

    //TODO this mrthod make render very slow
    renderXAxis() {
        const {
            primaryChartColor,
            pixelRatio,
            axisScale,
            axisFontSize,
        } = this.props.options;
        const stepWidth = this.element.width / axisScale;

        for (let i = 0; i < axisScale; i++) {
            this.context.fillStyle = primaryChartColor;
            this.context.font = `${axisFontSize * pixelRatio}px Arial`;
            const formattedDate = this.getFormattedDate(new Date());
            const x = stepWidth * i + 10;
            const y = this.element.height - 10;

            this.context.fillText(formattedDate, x, y);
        }
    }

    renderYAxis() {
        const {
            primaryChartColor,
            pixelRatio,
            xAxisType,
            axisScale,
            axisFontSize,
        } = this.props.options;
        const maxValue = getMaxValueFromColumns(this.data, xAxisType);
        const stepHeight = this.element.height / axisScale;
        const stepValue = maxValue / axisScale;

        for (let i = 0; i < axisScale; i++ ) {
            const path = new Path2D();

            this.context.fillStyle = primaryChartColor;
            this.context.strokeStyle = primaryChartColor;
            this.context.font = `${axisFontSize * pixelRatio}px Arial`;
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
