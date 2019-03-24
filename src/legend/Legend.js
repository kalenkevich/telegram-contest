import CanvasComponent from '../base/CanvasComponent';
import ChartLegendActiveArea from './LegendActiveArea';
import ChartGraphic from '../chart/ChartGraphic';
import { getLineSets } from '../utils';

export default class ChartLegend extends CanvasComponent {
    init() {
        this.data = this.props.data;

        const lineSets = getLineSets(this.data, this.element.width, this.element.height, this.props.options);

        this.activeArea = new ChartLegendActiveArea(this.element, {
            ...this.props,
        });
        this.backgroundChart = new ChartGraphic(this.element, {
            lineSets,
            lineWidth: 1.5,
            animationType: 'none',
            options: this.props.options,
        });

        this.appendChild(this.backgroundChart);
        this.appendChild(this.activeArea);
    }

    onDataChanged(event) {
        const lineSets = getLineSets(event.data, this.element.width, this.element.height, this.props.options);

        this.data = event.data;
        this.activeArea.onDataChanged(event);
        this.backgroundChart.onLineSetsChanged(lineSets, event);
    }
}
