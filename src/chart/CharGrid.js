import CanvasComponent from '../base/CanvasComponent';

/**
 * Class for grid for chart
 */
export default class ChartGrid extends CanvasComponent {
    init() {
        this.axes = this.props.axes;
    }

    onAxesChanged(axes) {
        this.axes = axes;
    }

    render() {
        super.render();

        this.renderXAxis(this.axes.x);
        this.renderYAxis(this.axes.y);
    }

    renderXAxis(xAxis) {
        const {
            primaryChartColor,
            pixelRatio,
            axisFontSize,
        } = this.props.options;

        this.context.fillStyle = primaryChartColor;
        this.context.strokeStyle = primaryChartColor;
        this.context.font = `${axisFontSize * pixelRatio}px Arial`;
        this.context.lineWidth = pixelRatio;

        (xAxis.scales || []).forEach((scale) => {
            const path = new Path2D();

            path.moveTo(0, scale.y);
            path.lineTo(this.element.width, scale.y);

            this.context.fillText(scale.value, scale.x, scale.y - 10);
            this.context.stroke(path);
        });
    }

    renderYAxis(yAxis) {
        const {
            primaryChartColor,
            pixelRatio,
            axisFontSize,
        } = this.props.options;

        this.context.fillStyle = primaryChartColor;
        this.context.strokeStyle = primaryChartColor;
        this.context.font = `${axisFontSize * pixelRatio}px Arial`;
        this.context.lineWidth = pixelRatio;

        (yAxis.scales || []).forEach((scale) => {
            const path = new Path2D();

            path.moveTo(0, scale.y);
            path.lineTo(this.element.width, scale.y);

            this.context.fillText(scale.value, scale.x + 10, scale.y - 10);
            this.context.stroke(path);
        });
    }
}
