import CanvasComponent from '../base/CanvasComponent';
import { getFormattedDate, throttle } from '../utils';
import { THROTTLE_TIME_FOR_MOUSE_MOVE } from '../contansts';

export default class ChartPopover extends CanvasComponent {
    init() {
        this.lineSets = this.props.lineSets;
        this.pos = {
            x: null,
            y: null,
        };
        this.offset = {
            left: this.element.offsetLeft,
            top: this.element.offsetTop,
            width: this.element.offsetWidth,
            height: this.element.offsetHeight,
        };
        this.dim = {
            width: this.element.width,
            height: this.element.height,
        };

        this.onMouseMove = throttle(this.onMouseMove.bind(this), THROTTLE_TIME_FOR_MOUSE_MOVE);
        this.element.addEventListener("mousemove", this.onMouseMove);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.element.addEventListener("mouseleave", this.onMouseLeave);
    }

    onLineSetsChanged(lineSets) {
        this.lineSets = lineSets;

        this.rerender();
    }

    getMouseAlignmentData(pageX, pageY) {
        const { legendActiveAreaStretchBorderWidth } = this.props.options;
        const grabOffset = {
            x: pageX - this.offset.left,
            y: pageY - this.offset.top,
        };

        const isChartArea = grabOffset.x >= legendActiveAreaStretchBorderWidth
            && grabOffset.x <= this.dim.width - legendActiveAreaStretchBorderWidth
            && grabOffset.y >= 0
            && grabOffset.y <= this.dim.height;

        return {
            grabOffset,
            isChartArea,
        };
    }

    onMouseLeave() {
        this.pos.x = null;
        this.pos.y = null;

        this.rerender();
    }

    onMouseMove(event) {
        const { grabOffset } = this.getMouseAlignmentData(event.pageX, event.pageY);

        this.pos.x = grabOffset.x;
        this.pos.y = grabOffset.y;

        this.rerender();
    }

    render() {
        super.render();

        if (this.pos.x) {
            const nearestValues = this.getNearestValueIndexes();

            this.renderCursorLine();
            this.renderActiveValues(nearestValues);
            this.renderValuesPopup(nearestValues);
        }
    }

    renderCursorLine() {
        const { pixelRatio, primaryChartColor } = this.props.options;
        const path = new Path2D();

        this.context.strokeStyle = primaryChartColor;

        path.moveTo(this.pos.x * pixelRatio, 0);
        path.lineTo(this.pos.x * pixelRatio, this.dim.height);

        this.context.stroke(path);
    }

    renderActiveValues(nearestValues) {
        (nearestValues || []).forEach((valueIndex, lineSetIndex) => {
            if (valueIndex !== -1) {
                const lineSet = this.lineSets[lineSetIndex];
                const line = lineSet.lines[valueIndex];

                this.context.strokeStyle = lineSet.color;
                this.context.lineWidth = this.props.lineWidth * 2.5;
                this.context.beginPath();
                this.context.arc(line.x1, line.y1, 10, 0, 2 * Math.PI);
                this.context.stroke();
            }
        });
    }

    renderValuesPopup(nearestValues) {
        const { pixelRatio, axisFontSize, primaryChartColor , xAxisType } = this.props.options;

        this.context.fillStyle = primaryChartColor;
        this.context.strokeStyle = primaryChartColor;
        this.context.font = `${axisFontSize * pixelRatio}px Arial`;
        this.context.lineWidth = pixelRatio;
        this.context.rect(this.pos.x * pixelRatio + 20, 40, 250, (this.lineSets.length - 1) * 70);
        this.context.stroke();

        const xAxisLines = (this.lineSets || []).find(({ name }) => name === xAxisType);
        const date = getFormattedDate(xAxisLines.lines[nearestValues[1]]);
        this.context.fillText(`${date}`, this.pos.x * pixelRatio + 45, 80);

        (nearestValues || []).forEach((valueIndex, lineSetIndex) => {
            if (valueIndex !== -1) {
                const lineSet = this.lineSets[lineSetIndex];
                const name = lineSet.name;
                const value = lineSet.lines[valueIndex].value;

                this.context.fillText(`${name}: ${value}`, this.pos.x * pixelRatio + 45, 80 + lineSetIndex * 40);
            }
        });
    }

    getNearestValueIndexes() {
        const { pixelRatio } = this.props.options;

        return (this.lineSets || []).reduce((nearestValueIndexes, lineSet) => {
            const { index } = (lineSet.lines || []).reduce((result, line, index) => {
                const distance = Math.abs(this.pos.x * pixelRatio - line.x1);

                if (result.minDistance > distance) {
                    return {
                        index,
                        minDistance: distance,
                    }
                }

                return result;
            }, { index: -1, minDistance: 100000000 });

            nearestValueIndexes.push(index);

            return nearestValueIndexes;
        }, []);
    }
}
