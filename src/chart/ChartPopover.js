import Component from '../base/Component';
import CanvasComponent from '../base/CanvasComponent';
import { getFormattedDate, throttle, getNearestValueIndexes } from '../utils';
import { THROTTLE_TIME_FOR_MOUSE_MOVE } from '../contansts';

export const popupStyle = (color) => `position: absolute;border-radius: 3px;display: flex;flex-direction: column;font-family: 'Arial';padding: 15px;background-color: ${color};box-shadow: 0px 1px 1px 0px rgba(0,0,0,0.3);padding: 5px;min-width: 80px;`;
export const valuesWrapperElement = 'display: flex;justify-content: space-between;margin-top: 10px;';
export const lineStyle = 'display: flex;flex-direction: column;margin-right: 20px;';

export class Popup extends Component {
    init() {
        const { chart } = this.props.options;
        this.state = {
            isVisible: false,
            data: null,
            position: { x: 0, y: 0 },
        };
        this.dateElement = document.createElement('span');
        this.dateElement.style = 'font-size: 16px;';
        this.valuesWrapperElement = document.createElement('div');
        this.element.style = popupStyle(chart.popupColor);
        this.valuesWrapperElement.style = valuesWrapperElement;
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
            this.dateElement.innerText = data.date;
            this.dateElement.style.color = textColor;
            this.valuesWrapperElement.innerText = '';

            (data.lines || []).forEach((line) => {
                const lineContainer = document.createElement('div');
                lineContainer.style = lineStyle;
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

            const elementWidth = this.element.offsetWidth;
            const delta = position.x + elementWidth > chartElement.offsetWidth ? elementWidth - 10 : 10;
            this.element.style.left = `${position.x - delta}px`;
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
        this.appendChild(this.popup);
    }

    destroy() {
        this.element.removeEventListener("mousemove", this.onMouseMove);
        this.element.removeEventListener("mouseleave", this.onMouseLeave);
    }

    onLineSetsChanged(lineSets) {
        this.lineSets = lineSets;

        this.rerender();
    }

    onOptionsChanged(newOptions) {
        super.onOptionsChanged(newOptions);

        this.popup.onOptionsChanged(newOptions);
    }

    static getMouseAlignmentData(offset, dim, pageX, pageY, options) {
        const { legendActiveAreaStretchBorderWidth } = options;
        const grabOffset = {
            x: pageX - offset.left,
            y: pageY - offset.top,
        };

        const isChartArea = grabOffset.x >= legendActiveAreaStretchBorderWidth
            && grabOffset.x <= dim.width - legendActiveAreaStretchBorderWidth
            && grabOffset.y >= 0
            && grabOffset.y <= dim.height;

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
        const { grabOffset } = ChartPopover.getMouseAlignmentData(this.offset, this.dim, event.pageX, event.pageY, this.props.options);

        this.pos.x = grabOffset.x;
        this.pos.y = grabOffset.y;
        this.popup.onVisibilityStateChanged(true);

        this.rerender();
    }

    render() {
        super.render();

        const nearestValues = getNearestValueIndexes(this.pos.x, this.lineSets, this.props.options).map(({ index }) => index);

        if (this.pos.x) {
            ChartPopover.renderCursorLine(this.pos, this.dim, this.context, this.props);
            ChartPopover.renderActiveValues(this.lineSets, nearestValues, this.context, this.props);
        }

        this.renderValuesPopup(nearestValues);
    }

    static renderCursorLine(pos, dim, context, props) {
        const { pixelRatio, primaryChartColor } = props.options;
        const path = new Path2D();

        context.strokeStyle = primaryChartColor;
        context.lineWidth = props.lineWidth * props.options.pixelRatio;

        path.moveTo(pos.x * pixelRatio, 0);
        path.lineTo(pos.x * pixelRatio, dim.height);

        context.stroke(path);
    }

    static renderActiveValues(lineSets, nearestValues, context, props) {
        const { chart: { popupColor } } = props.options;

        (nearestValues || []).forEach((valueIndex, lineSetIndex) => {
            if (valueIndex !== -1) {
                const lineSet = lineSets[lineSetIndex];
                const line = lineSet.lines[valueIndex];

                context.strokeStyle = lineSet.color;
                context.fillStyle = popupColor;
                context.lineWidth = props.lineWidth * props.options.pixelRatio;
                context.beginPath();
                context.arc(line.x1, line.y1, 10, 0, 2 * Math.PI);
                context.fill();
                context.stroke();
            }
        });
    }

    renderValuesPopup(nearestValues) {
        const { axis: { xAxisType } } = this.props.options;
        const xAxisLines = (this.lineSets || []).find(({ name }) => name === xAxisType);
        const date = getFormattedDate(xAxisLines.lines[nearestValues[1]], { weekday: 'short' });
        const newData = (nearestValues || []).reduce((data, valueIndex, lineSetIndex) => {
            if (valueIndex !== -1) {
                const lineSet = this.lineSets[lineSetIndex];
                const name = lineSet.title;
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
}
