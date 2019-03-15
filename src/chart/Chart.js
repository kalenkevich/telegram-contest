import ChartGrid from './CharGrid';
import ChartGraphic from './ChartGraphic';
import ChartPopover from './ChartPopover';
import CanvasComponent from '../base/CanvasComponent';
import { getLineSets, getAxes } from '../utils';

/**
 * Class which manage graphic and axis
 */
export default class Chart extends CanvasComponent {
    init() {
        this.data = this.props.data;

        const { pixelRatio } = this.props.options;
        const lineSets = this.getLineSets();
        const axes = this.getAxes();

        this.chartGrid = new ChartGrid(this.element, {
            axes,
            options: this.props.options,
        });
        this.chartGraphic = new ChartGraphic(this.element, {
            lineSets,
            lineWidth: 2.5 * pixelRatio,
            options: this.props.options,
            animation: false,
        });
        this.chartPopover = new ChartPopover(this.element, {
            lineSets,
            options: this.props.options,
            lineWidth: pixelRatio,
        });

        this.appendChild(this.chartGrid);
        this.appendChild(this.chartGraphic);
        this.appendChild(this.chartPopover);
    }

    onDataChanged(data) {
        this.data = data;

        const lineSets = this.getLineSets();
        const axes = this.getAxes();

        this.chartGrid.onAxesChanged(axes);
        this.chartGraphic.onLineSetsChanged(lineSets);
        this.chartPopover.onLineSetsChanged(lineSets);
    }

    getAxes() {
        return getAxes(this.data, this.element.width, this.element.height, this.props.options);
    }

    getLineSets() {
        return getLineSets(this.data, this.element.width, this.element.height, this.props.options);
    }
}
