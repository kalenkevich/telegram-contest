const primaryChartColor = '#AAAAAA';
const chartWidth = 600;
const chartHeight = 500;
const legendWidth = 600;
const legendHeight = 100;
const legendActiveAreaDefaultWidth = legendWidth / 4;
const legendActiveAreaStretchBorderWidth = 5;
const X_AXIS_TYPE = 'x';
const THROTTLE_TIME_FOR_RENDER = 30;

class Utils {
    static getMaxValueFromArray(array) {
        return (array || []).reduce((maxVal, value) => maxVal > value ? maxVal : value);
    }

    static throttle(func, ms) {
        let isThrottled = false;
        let savedArgs;
        let savedThis;

        function wrapper() {
            if (isThrottled) {
                savedArgs = arguments;
                savedThis = this;
                return;
            }

            func.apply(this, arguments);

            isThrottled = true;

            setTimeout(() => {
                isThrottled = false;

                if (savedArgs) {
                    wrapper.apply(savedThis, savedArgs);
                    savedArgs = savedThis = null;
                }
            }, ms);
        }

        return wrapper;
    }

    static isLineIntersectRectangle(x1, y1, x2, y2, minX, minY, maxX, maxY) {
        if ((x1 <= minX && x2 <= minX) || (y1 <= minY && y2 <= minY) || (x1 >= maxX && x2 >= maxX) || (y1 >= maxY && y2 >= maxY))
        return false;

        let m = (y2 - y1) / (x2 - x1);

        let y = m * (minX - x1) + y1;
        if (y > minY && y < maxY) return true;

        y = m * (maxX - x1) + y1;
        if (y > minY && y < maxY) return true;

        let x = (minY - y1) / m + x1;
        if (x > minX && x < maxX) return true;

        x = (maxY - y1) / m + x1;

        return x > minX && x < maxX;
    }

    static getMaxValueFromColumns(data) {
        return (data.columns || []).reduce((maxValue, column) => {
            const [name, ...values] = column;

            if (data.types[name] === X_AXIS_TYPE) {
                return;
            }

            const currentMaxValue = Utils.getMaxValueFromArray(values);

            return maxValue > currentMaxValue ? maxValue : currentMaxValue;
        }, 0);
    }

    static getScale(data, elementWidth, elementHeight) {
        const [, ...otherColumn] = (data.columns || []).find(column => data.types[column[0]] !== X_AXIS_TYPE);

        return {
            scaleX: elementWidth / otherColumn.length,
            scaleY: elementHeight / this.getMaxValueFromColumns(data),
        };
    }
}

/**
 * Base component which is element of the components tree,
 * where can be access to parents and children
 */
class Component {
    constructor(element, props = {}) {
        this.element = element;
        this.context = element.getContext("2d");
        this.props = props;
        this.children = [];
        this.parent = null;
        this.render = Utils.throttle(this.render.bind(this), THROTTLE_TIME_FOR_RENDER);
        this.init();
    }

    appendChild(child) {
        this.children.push(child);
        child.parent = this;
    }

    init() {}

    render() {
        this.children.forEach(child => child.render());
    }

    clear() {
        this.context.clearRect(0, 0, this.element.width, this.element.height);
    }

    //Todo do it more effective, now for every child it will render from root parent
    rerender() {
        let currentParent = this.parent;

        if (!currentParent) {
            return this.render();
        }

        let nextParent = this.parent.parent;

        while (nextParent !== null) {
            currentParent = nextParent;
            nextParent = currentParent.parent;
        }

        currentParent.render();
    }
}

/**
 * Class for showing graphics itself (lines)
 */
class ChartGraphic extends Component {
    init() {
        this.data = this.props.data;
    }

    onDataChanged(data) {
        this.data = data;

        this.rerender();
    }

    render() {
        this.clear();

        super.render();

        const { scaleX, scaleY } = Utils.getScale(this.data, this.element.width, this.element.height);

        (this.data.columns || []).forEach((column, index) => {
            const [name, ...values] = this.data.columns[index];

            if (this.data.types[name] === X_AXIS_TYPE) {
                return;
            }

            const strokeStyle = this.context.strokeStyle;
            this.context.strokeStyle = this.data.colors[name];

            for (let i = 0; i < values.length;) {
                const path = new Path2D();

                path.moveTo(i * scaleX, values[i] * scaleY);
                i++;
                path.lineTo(i * scaleX, values[i] * scaleY);

                this.context.stroke(path);
            }

            this.context.strokeStyle = strokeStyle;
        });
    }
}

/**
 * Class which manage graphic and axis
 */
class Chart extends Component {
    init() {
        this.chartGraphic = new ChartGraphic(this.element, {
            data: this.props.data,
        });

        this.appendChild(this.chartGraphic);
    }

    onDataChanged(data) {
        this.chartGraphic.onDataChanged(data);
    }
}

/**
 * Class which manage active view of legend of the Chart
 */
class ChartLegendActiveArea extends Component {
    init() {
        this.dim = {
            width: legendActiveAreaDefaultWidth,
            height: legendHeight,
        };
        this.pos = {
            x: legendWidth - legendActiveAreaDefaultWidth * 2,
            y: 0,
        };
        this.offset = {
            left: this.element.offsetLeft,
            top: this.element.offsetTop,
            width: this.element.offsetWidth,
            height: this.element.offsetHeight,
        };

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.element.addEventListener("mousedown", this.onMouseDown);
        this.element.addEventListener("mousemove", this.onMouseMove);

        this.onActiveDataChange();
    }

    getMouseAlignmentData(pageX, pageY) {
        const grabOffset = {
            x: pageX - this.offset.left - this.pos.x,
            y: pageY - this.offset.top - this.pos.y,
        };

        const isLeftBorder = grabOffset.x >= 0
            && grabOffset.x <= legendActiveAreaStretchBorderWidth
            && grabOffset.y >= 0
            && grabOffset.y <= this.dim.height;

        const isRightBorder = grabOffset.x <= this.dim.width
            && this.dim.width - grabOffset.x <= legendActiveAreaStretchBorderWidth
            && grabOffset.y >= 0
            && grabOffset.y <= this.dim.height;

        const isPreviewArea = grabOffset.x >= legendActiveAreaStretchBorderWidth
            && grabOffset.x <= this.dim.width - legendActiveAreaStretchBorderWidth
            && grabOffset.y >= 0
            && grabOffset.y <= this.dim.height;

        return {
            grabOffset,
            isLeftBorder,
            isRightBorder,
            isPreviewArea,
        };
    }

    onMouseMove(event) {
        const {
            isLeftBorder,
            isRightBorder,
            isPreviewArea,
        } = this.getMouseAlignmentData(event.pageX, event.pageY);

        if (isPreviewArea) {
            this.element.style.cursor = 'pointer';
        } else if (isLeftBorder || isRightBorder) {
            this.element.style.cursor = 'ew-resize';
        } else {
            this.element.style.cursor = 'default';
        }
    }

    onMouseDown(event) {
        const {
            grabOffset,
            isLeftBorder,
            isRightBorder,
            isPreviewArea,
        } = this.getMouseAlignmentData(event.pageX, event.pageY);

        if (isLeftBorder) {
            const onMouseMove = (event) => {
                let newPosX = event.pageX - this.offset.left - grabOffset.x;

                if (newPosX < 0) {
                    newPosX = 0;
                }

                if (newPosX > this.pos.x + this.dim.width - legendActiveAreaStretchBorderWidth * 3) {
                    newPosX = this.dim.width + this.pos.x - legendActiveAreaStretchBorderWidth * 3;
                }

                if (newPosX + this.dim.width > this.element.width) {
                    newPosX = this.element.width - this.dim.width;
                }

                this.dim.width += this.pos.x - newPosX;
                this.pos.x = newPosX;
                this.onActiveDataChange();
            };

            this.element.addEventListener("mousemove", onMouseMove);
            this.element.addEventListener("mouseup", () => this.element.removeEventListener('mousemove', onMouseMove));
        } else if (isRightBorder) {
            const onMouseMove = (event) => {
                let newPosX = event.pageX - this.offset.left;

                if (newPosX < this.pos.x + legendActiveAreaStretchBorderWidth * 3) {
                    newPosX = this.pos.x + legendActiveAreaStretchBorderWidth * 3;
                }

                if (newPosX > this.element.width) {
                    newPosX = this.element.width;
                }

                this.dim.width = newPosX - this.pos.x;
                this.onActiveDataChange();
            };

            this.element.addEventListener("mousemove", onMouseMove);
            this.element.addEventListener("mouseup", () => this.element.removeEventListener('mousemove', onMouseMove));
        } else if (isPreviewArea) {
            const onMouseMove = (event) => {
                this.pos.x = event.pageX - this.offset.left - grabOffset.x;

                if (this.pos.x < 0) {
                    this.pos.x = 0;
                }

                if (this.pos.x + this.dim.width > this.element.width) {
                    this.pos.x = this.element.width - this.dim.width;
                }
                this.onActiveDataChange();
            };
            this.element.addEventListener("mousemove", onMouseMove);
            this.element.addEventListener("mouseup", () => this.element.removeEventListener('mousemove', onMouseMove));
        }
    }

    getActiveColumns(data, position, dimension) {
        const newColumns = [];
        const { scaleX, scaleY } = Utils.getScale(data, this.element.width, this.element.height);

        (data.columns || []).forEach((column, index) => {
            const name = column[0];

            if (name === X_AXIS_TYPE) {
                newColumns.push(column);

                return;
            }

            newColumns.push([name]);

            for (let i = 1; i < column.length;) {
                const isLineIntersectRectangle = Utils.isLineIntersectRectangle(
                    i * scaleX,
                    column[i] * scaleY,
                    ++i * scaleX,
                    column[i] * scaleY,
                    position.x,
                    position.y,
                    position.x + dimension.width,
                    position.y + dimension.height,
                );

                if (isLineIntersectRectangle) {
                    newColumns[index].push(column[i]);
                }
            }
        });

        return newColumns;
    }

    onActiveDataChange() {
        this.rerender();
        const activeData = {
            ...this.props.data,
            columns: this.getActiveColumns(this.props.data, this.pos, this.dim),
        };


        this.props.onActiveDataChange(activeData);
    }

    render() {
        super.render();

        this.context.strokeRect(
            this.pos.x,
            this.pos.y,
            this.dim.width,
            this.dim.height,
        );

        const fillStyle = this.context.fillStyle;
        this.context.fillRect(
            this.pos.x,
            this.pos.y,
            legendActiveAreaStretchBorderWidth,
            this.dim.height,
        );
        this.context.fillRect(
            this.pos.x + this.dim.width - legendActiveAreaStretchBorderWidth,
            this.pos.y,
            legendActiveAreaStretchBorderWidth,
            this.dim.height,
        );
        this.context.fillStyle = fillStyle;
    }
}

/**
 * Class which manage legend of the Chart
 */
class ChartLegend extends Component {
    init() {
        this.activeArea = new ChartLegendActiveArea(this.element, this.props);
        this.backgroundChart = new ChartGraphic(this.element, { data: this.props.data });

        this.appendChild(this.activeArea);
        this.appendChild(this.backgroundChart);
    }

    renderOverlay() {
        const fillStyle = this.context.fillStyle;

        this.context.fillStyle = "rgba(245, 249, 252, 0.7)";
        this.context.fillRect(
            0,
            0,
            this.activeArea.pos.x,
            this.element.height,
        );
        this.context.fillRect(
            this.activeArea.pos.x + this.activeArea.dim.width,
            0,
            this.element.width,
            this.element.height,
        );

        this.context.fillStyle = fillStyle;
    }

    render() {
        this.clear();

        super.render();

        this.renderOverlay();
    }
}

/**
 * Class which manage canvas elements
 */
class ChartWidget {
    constructor(id, data) {
        this.chartContainer = document.getElementById(id);

        this.title = document.createElement('h2');
        this.title.innerText = 'Followers';

        this.chart = document.createElement('canvas');
        this.chart.id = 'chart';
        this.chart.width = chartWidth;
        this.chart.height = chartHeight;
        this.chart.style.border = `1px solid ${primaryChartColor}`;
        this.chart.style.display = 'block';

        this.legend = document.createElement('canvas');
        this.legend.id = 'legend';
        this.legend.width = legendWidth;
        this.legend.height = legendHeight;
        this.legend.style.border = `1px solid ${primaryChartColor}`;
        this.legend.style.display = 'block';

        this.chartContainer.appendChild(this.title);
        this.chartContainer.appendChild(this.chart);
        this.chartContainer.appendChild(this.legend);

        this.chart = new Chart(this.chart, { data });
        this.legend = new ChartLegend(this.legend, {
            data,
            onActiveDataChange: (data) => this.chart.onDataChanged(data),
        });
    }

    show() {
        this.chart.render();
        this.legend.render();
    }
}

window.onload = async function () {
    const data = await fetch('chart_data.json').then(data => data.json());
    const chart = new ChartWidget("chart", data[0]);

    chart.show();
};
