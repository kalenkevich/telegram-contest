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

        this.renderWithoutAnimation();
    }

    renderWithoutAnimation() {
        this.context.lineWidth = this.props.lineWidth;

        (this.lineSets || []).forEach((linesData) => {
            const linesSet = new Path2D();
            this.context.strokeStyle = linesData.color;

            (linesData.lines || []).forEach(line => {
                const path = new Path2D();

                path.moveTo(line.x1, line.y1);
                path.lineTo(line.x2, line.y2);
                linesSet.addPath(path);
            });

            this.context.stroke(linesSet);
        });
    }
}
