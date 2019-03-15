import ChartGrid from './CharGrid';
import ChartGraphic from './ChartGraphic';
import ChartPopover from './ChartPopover';
import CanvasComponent from '../base/CanvasComponent';

/**
 * Class which manage graphic and axis
 */
export default class Chart extends CanvasComponent {
    init() {
        const { pixelRatio } = this.props.options;

        this.chartGrid = new ChartGrid(this.element, {
            data: this.props.data,
            options: this.props.options,
        });
        this.chartGraphic = new ChartGraphic(this.element, {
            data: this.props.data,
            options: this.props.options,
            animation: false,
            lineWidth: 2.5 * pixelRatio,
        });

        this.chartPopover = new ChartPopover(this.element, {
            data: this.props.data,
            options: this.props.options,
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
}
