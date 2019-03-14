import { pixelRatio } from '../contansts';
import CanvasComponent from '../base/CanvasComponent';
import ChartLegendActiveArea from './LegendActiveArea';
import ChartGraphic from '../chart/ChartGraphic';

/**
 * Class which manage legend of the Chart
 */
export default class ChartLegend extends CanvasComponent {
    init() {
        this.activeArea = new ChartLegendActiveArea(this.element, this.props);
        this.backgroundChart = new ChartGraphic(this.element, {
            data: this.props.data,
            lineWidth: 1.5 * pixelRatio,
        });

        this.appendChild(this.activeArea);
        this.appendChild(this.backgroundChart);
    }

    onDataChanged(data) {
        this.activeArea.onDataChanged(data);
        this.backgroundChart.onDataChanged(data);
    }

    renderOverlay() {
        const fillStyle = this.context.fillStyle;

        this.context.fillStyle = "rgba(245, 249, 252, 0.7)";
        this.context.fillRect(
            0,
            0,
            this.activeArea.pos.x * pixelRatio,
            this.element.height,
        );
        this.context.fillRect(
            (this.activeArea.pos.x + this.activeArea.dim.width) * pixelRatio,
            0,
            this.element.width,
            this.element.height,
        );

        this.context.fillStyle = fillStyle;
    }

    render() {
        this.clear();

        super.render();

        this.renderOverlay();
    }
}
