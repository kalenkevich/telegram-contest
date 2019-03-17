import CanvasComponent from '../base/CanvasComponent';

/**
 * Class for showing graphics itself (lines)
 */
export default class ChartGraphic extends CanvasComponent {
    init() {
        this.lineSets = this.props.lineSets;
    }

    onLineSetsChanged(lineSets) {
        this.lineSets = lineSets;

        this.rerender();
    }

    render() {
        super.render();

        const { lineWidth, options: { xAxisType }, animationType } = this.props;
        this.context.lineWidth = lineWidth;

        for (let j = 0; j < this.lineSets[0].lines.length; j++) {
            for (let i = 0; i < this.lineSets.length; i++) {
                if (this.lineSets[i].name !== xAxisType) {

                    const line = this.lineSets[i].lines[j];

                    line.render(this.context, 'none', this.lineSets[i].color);
                }
            }
        }
    }
}
