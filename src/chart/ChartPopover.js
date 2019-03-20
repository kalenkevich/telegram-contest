import Component from '../base/Component';
import CanvasComponent from '../base/CanvasComponent';
import { getFormattedDate, throttle } from '../utils';
import { THROTTLE_TIME_FOR_MOUSE_MOVE } from '../contansts';

export class Popup extends Component {
    init() {
        const { chart } = this.props.options;
        this.state = {
            isVisible: false,
            data: null,
            position: { x: 0, y: 0 },
        };
        this.dateElement = document.createElement('span');
        this.dateElement.style = `
            font-size: 16px;
        `;
        this.valuesWrapperElement = document.createElement('div');
        this.element.style = `
            position: absolute;
            border-radius: 3px;
            display: flex;
            flex-direction: column;
            font-family: 'Arial';
            padding: 15px;
            background-color: ${chart.popupColor};
            box-shadow: 0px 1px 1px 0px rgba(0,0,0,0.3);
            padding: 5px;
            min-width: 80px;
        `;
        this.valuesWrapperElement.style = `
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
        `;
        this.element.appendChild(this.dateElement);
        this.element.appendChild(this.valuesWrapperElement);
    }

    onVisibilityStateChanged(isVisible) {
        this.state.isVisible = isVisible;
    }

    onDataChanged(newData) {
        this.state.data = newData;
    }

    onPositionChanged(newPosition) {
        this.state.position = newPosition;
    }

    render() {
        const { chartElement, options: { chart, textColor } } = this.props;
        const { isVisible, data, position } = this.state;

        this.element.style.backgroundColor = chart.popupColor;

        if (isVisible && data) {
            this.element.style.visibility = 'visible';
            this.element.style.top = `${chartElement.offsetTop - chartElement.clientHeight + 400}px`;
            this.element.style.left = `${position.x - 10}px`;
            this.dateElement.innerText = data.date;
            this.dateElement.style.color = textColor;
            this.valuesWrapperElement.innerText = '';

            (data.lines || []).forEach((line) => {
                const lineContainer = document.createElement('div');
                lineContainer.style = `
                    display: flex;
                    flex-direction: column;
                    margin-right: 20px;
                `;
                const valueSpan = document.createElement('span');
                valueSpan.innerText = line.value;
                valueSpan.style.fontSize = '20px';

                const nameSpan = document.createElement('span');
                nameSpan.innerText = line.name;

                lineContainer.style.color = line.color;
                lineContainer.appendChild(valueSpan);
                lineContainer.appendChild(nameSpan);

                this.valuesWrapperElement.appendChild(lineContainer);
            });
        } else {
            this.element.style.visibility = 'hidden';
        }
    }
}

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

        this.element.style.position = 'relative';
        this.onMouseMove = throttle(this.onMouseMove.bind(this), THROTTLE_TIME_FOR_MOUSE_MOVE);
        this.element.addEventListener("mousemove", this.onMouseMove);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.element.addEventListener("mouseleave", this.onMouseLeave);
        this.popup = new Popup(document.createElement('div'), {
            ...this.props,
            chartElement: this.element,
        });
        this.element.after(this.popup.element);
    }

    onLineSetsChanged(lineSets) {
        this.lineSets = lineSets;

        this.rerender();
    }

    onOptionsChanged(newOptions) {
        super.onOptionsChanged(newOptions);

        this.popup.onOptionsChanged(newOptions);
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
        this.popup.onVisibilityStateChanged(false);

        this.rerender();
    }

    onMouseMove(event) {
        const { grabOffset } = this.getMouseAlignmentData(event.pageX, event.pageY);

        this.pos.x = grabOffset.x;
        this.pos.y = grabOffset.y;
        this.popup.onVisibilityStateChanged(true);

        this.rerender();
    }

    render() {
        super.render();

        const nearestValues = this.getNearestValueIndexes();

        if (this.pos.x) {
            this.renderCursorLine();
            this.renderActiveValues(nearestValues);
        }

        this.renderValuesPopup(nearestValues);
    }

    renderCursorLine() {
        const { pixelRatio, primaryChartColor } = this.props.options;
        const path = new Path2D();

        this.context.strokeStyle = primaryChartColor;
        this.context.lineWidth = this.props.lineWidth * this.props.options.pixelRatio;

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
                this.context.lineWidth = this.props.lineWidth * this.props.options.pixelRatio;
                this.context.beginPath();
                this.context.arc(line.x1, line.y1, 10, 0, 2 * Math.PI);
                this.context.stroke();
            }
        });
    }

    renderValuesPopup(nearestValues) {
        const { axis: { xAxisType } } = this.props.options;
        const xAxisLines = (this.lineSets || []).find(({ name }) => name === xAxisType);
        const date = getFormattedDate(xAxisLines.lines[nearestValues[1]]);
        const newData = (nearestValues || []).reduce((data, valueIndex, lineSetIndex) => {
            if (valueIndex !== -1) {
                const lineSet = this.lineSets[lineSetIndex];
                const name = lineSet.nameValue;
                const color = lineSet.color;
                const value = lineSet.lines[valueIndex].value;

                data.lines.push({
                    value,
                    name,
                    color,
                });
            }

            return data;
        }, { lines: [], date });
        this.popup.onDataChanged(newData);
        this.popup.onPositionChanged({
            x: this.pos.x,
            y: this.pos.y,
        });
        this.popup.render();
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
