import ChartGrid from './CharGrid';
import ChartGraphic from './ChartGraphic';
import ChartPopover from './ChartPopover';
import CanvasComponent from '../base/CanvasComponent';
import { getLineSets, getAxes } from '../utils';

export default class Chart extends CanvasComponent {
    init() {
        this.data = this.props.data;

        const lineSets = this.getLineSets();
        const axes = this.getAxes();

        this.chartGrid = new ChartGrid(this.element, {
            axes,
            options: this.props.options,
            animationType: 'easeInQuad',
            animationDuration: 800,
        });
        this.chartGraphic = new ChartGraphic(this.element, {
            lineSets,
            lineWidth: 2.5,
            animationType: 'easeInQuad',
            animationDuration: 350,
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
