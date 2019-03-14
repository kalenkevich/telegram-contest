import { pixelRatio } from '../contansts';
import ChartGrid from './CharGrid';
import ChartGraphic from './ChartGraphic';
import ChartPopover from './ChartPopover';
import CanvasComponent from '../base/CanvasComponent';

/**
 * Class which manage graphic and axis
 */
export default class Chart extends CanvasComponent {
    init() {
        this.chartGrid = new ChartGrid(this.element, {
            data: this.props.data,
        });
        this.chartGraphic = new ChartGraphic(this.element, {
            data: this.props.data,
            lineWidth: 2.5 * pixelRatio,
        });

        this.chartPopover = new ChartPopover(this.element, {
            data: this.props.data,
            lineWidth: pixelRatio,
        });

        this.appendChild(this.chartGrid);
        this.appendChild(this.chartGraphic);
        this.appendChild(this.chartPopover);
    }

    onDataChanged(data) {
        this.chartGrid.onDataChanged(data);
        this.chartGraphic.onDataChanged(data);
        this.chartPopover.onDataChanged(data);
    }

    render() {
        this.clear();

        super.render();
    }
}
