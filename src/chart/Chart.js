import ChartGrid from './CharGrid';
import ChartGraphic from './ChartGraphic';
import ChartPopover from './ChartPopover';
import CanvasComponent from '../base/CanvasComponent';
import { getLineSets, getAxes } from '../utils';

export default class Chart extends CanvasComponent {
    init() {
        this.data = this.props.data;

        const lineSets = getLineSets(this.data, this.element.width, this.element.height, this.props.options);
        const axes = getAxes(this.data, this.element.width, this.element.height, this.props.options, lineSets);

        this.chartGrid = new ChartGrid(this.element, {
            axes,
            options: this.props.options,
            animationType: 'easeInOutQuad',
            animationDuration: 500,
        });
        this.chartGraphic = new ChartGraphic(this.element, {
            lineSets,
            lineWidth: 2.5,
            animationType: 'easeInOutQuad',
            animationDuration: 500,
            options: this.props.options,
        });
        this.chartPopover = new ChartPopover(this.element, {
            lineSets,
            options: this.props.options,
            lineWidth: 2.5,
        });

        this.appendChild(this.chartGrid);
        this.appendChild(this.chartGraphic);
        this.appendChild(this.chartPopover);
    }

    onDataChanged(event) {
        const lineSets = getLineSets(event.data, this.element.width, this.element.height, this.props.options);
        const axes = getAxes(event.data, this.element.width, this.element.height, this.props.options, lineSets);

        this.data = event.data;
        this.chartGrid.onAxesChanged(axes);
        this.chartGraphic.onLineSetsChanged(lineSets, event);
        this.chartPopover.onLineSetsChanged(lineSets, event);
    }
}
