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
            options: this.props.options,
            animation: false,
            lineWidth: 1.5 * this.props.options.pixelRatio,
        });

        this.appendChild(this.backgroundChart);
        this.appendChild(this.activeArea);
    }

    onDataChanged(data) {
        this.activeArea.onDataChanged(data);
        this.backgroundChart.onDataChanged(data);
    }
}
