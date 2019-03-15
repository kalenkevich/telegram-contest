import CanvasComponent from '../base/CanvasComponent';
import ChartLegendActiveArea from './LegendActiveArea';
import ChartGraphic from '../chart/ChartGraphic';
import { getLineSets } from '../utils';

/**
 * Class which manage legend of the Chart
 */
export default class ChartLegend extends CanvasComponent {
    init() {
        this.data = this.props.data;

        const lineSets = this.getLineSets();

        this.activeArea = new ChartLegendActiveArea(this.element, {
            ...this.props,
        });
        this.backgroundChart = new ChartGraphic(this.element, {
            lineSets,
            lineWidth: 1.5 * this.props.options.pixelRatio,
            options: this.props.options,
            animation: false,
        });

        this.appendChild(this.backgroundChart);
        this.appendChild(this.activeArea);
    }

    onDataChanged(data) {
        this.data = data;

        const lineSets = this.getLineSets();

        this.activeArea.onDataChanged(data);
        this.backgroundChart.onLineSetsChanged(lineSets);
    }

    getLineSets() {
        return getLineSets(this.data, this.element.width, this.element.height, this.props.options);
    }
}
