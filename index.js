const primaryChartColor = '#AAAAAA';
const chartWidth = 600;
const chartHeight = 500;
const legendWidth = 600;
const legendHeight = 100;
const legendActiveAreaDefaultWidth = legendWidth / 4;
const legendActiveAreaStretchBorderWidth = 5;

class Utils {
    static getMaxValueFromArray(array) {
        return (array || []).reduce((maxVal, value) => maxVal > value ? maxVal : value);
    }
}

/**
 * Class for showing graphics itself (lines)
 */
class ChartGraphic {
    constructor(element, data) {
        this.data = data;
        this.element = element;
        this.context = element.getContext("2d");
    }

    getMaxValueFromColumns(columns) {
        return (columns || []).reduce((maxValue, column) => {
            const [name, ...values] = column;

            if (this.data.types[name] === "x") {
                return;
            }

            const currentMaxValue = Utils.getMaxValueFromArray(values);

            return maxValue > currentMaxValue ? maxValue : currentMaxValue;
        }, 0);
    }

    render() {
        const [, ...xAxis] = (this.data.columns || []).find(column => this.data.types[column[0]] === "x");
        const scaleX = this.element.width / xAxis.length;
        const scaleY = this.element.height / this.getMaxValueFromColumns(this.data.columns);

        (this.data.columns || []).forEach((column, index) => {
            const [name, ...values] = this.data.columns[index];

            if (this.data.types[name] === "x") {
                return;
            }

            const strokeStyle = this.context.strokeStyle;
            this.context.strokeStyle = this.data.colors[name];

            for (let index = 0; index < values.length;) {
                const path = new Path2D();
                path.moveTo(index * scaleX, values[index] * scaleY);
                index++;
                path.lineTo(index * scaleX, values[index] * scaleY);

                this.context.stroke(path);
            }

            this.context.strokeStyle = strokeStyle;
        });
    }
}

/**
 * Class which manage graphic and axis
 */
class Chart {
    constructor(element, data) {
        this.data = data;
        this.context = element.getContext("2d");
        this.chartGraphic = new ChartGraphic(element, data);
    }

    render(activeArea) {
        this.chartGraphic.render();
    }
}

/**
 * Class which manage active view of legend of the Chart
 */
class ChartLegendActiveArea {
    constructor(element) {
        this.element = element;
        this.context = element.getContext('2d');
        this.dim = {
            width: legendActiveAreaDefaultWidth,
            height: legendHeight,
        };
        this.pos = {
            x: legendWidth - legendActiveAreaDefaultWidth * 2,
            y: 0,
        };
        this.offset = {
            left: element.offsetLeft,
            top: element.offsetTop,
            width: element.offsetWidth,
            height: element.offsetHeight,
        };

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.element.addEventListener("mousedown", this.onMouseDown);
        this.element.addEventListener("mousemove", this.onMouseMove);
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
            };

            this.element.addEventListener("mousemove", onMouseMove);
            this.element.addEventListener("mouseup", () => this.element.removeEventListener('mousemove', onMouseMove));

            return;
        }

        if (isRightBorder) {
            const onMouseMove = (event) => {
                let newPosX = event.pageX - this.offset.left;

                if (newPosX < this.pos.x + legendActiveAreaStretchBorderWidth * 3) {
                    newPosX = this.pos.x + legendActiveAreaStretchBorderWidth * 3;
                }

                if (newPosX > this.element.width) {
                    newPosX = this.element.width;
                }

                this.dim.width = newPosX - this.pos.x;
            };

            this.element.addEventListener("mousemove", onMouseMove);
            this.element.addEventListener("mouseup", () => this.element.removeEventListener('mousemove', onMouseMove));

            return;
        }

        if (isPreviewArea) {
            const onMouseMove = (event) => {
                this.pos.x = event.pageX - this.offset.left - grabOffset.x;

                if (this.pos.x < 0) {
                    this.pos.x = 0;
                }

                if (this.pos.x + this.dim.width > this.element.width) {
                    this.pos.x = this.element.width - this.dim.width;
                }
            };
            this.element.addEventListener("mousemove", onMouseMove);
            this.element.addEventListener("mouseup", () => this.element.removeEventListener('mousemove', onMouseMove));
        }
    }

    render() {
        this.context.strokeRect(
            this.pos.x,
            this.pos.y,
            this.dim.width,
            this.dim.height,
        );
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
    }
}

/**
 * Class which manage legend of the Chart
 */
class ChartLegend {
    constructor(element, data) {
        this.element = element;
        this.context = element.getContext("2d");
        this.activeArea = new ChartLegendActiveArea(element);
        this.backgroundChart = new ChartGraphic(element, data);
    }

    render() {
        this.context.clearRect(0, 0, this.element.width, this.element.height);

        this.backgroundChart.render();
        this.activeArea.render();
        this.renderOverlay();
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
}


/**
 * Class which manage canvas elements
 */
class ChartWidget {
    constructor(id, data) {
        this.chartContainer = document.getElementById(id);
        this.data = data;

        this.title = document.createElement('h2');
        this.title.innerText = 'Followers';

        this.chart = document.createElement('canvas');
        this.chart.id = 'chart';
        this.chart.width = chartWidth;
        this.chart.height = chartHeight;
        this.chart.style.border = `1px solid ${primaryChartColor}`;

        this.legend = document.createElement('canvas');
        this.legend.id = 'legend';
        this.legend.width = legendWidth;
        this.legend.height = legendHeight;
        this.legend.style.border = `1px solid ${primaryChartColor}`;

        this.chartContainer.appendChild(this.title);
        this.chartContainer.appendChild(this.chart);
        this.chartContainer.appendChild(this.legend);

        this.chart = new Chart(this.chart, this.data);
        this.legend = new ChartLegend(this.legend, this.data);
    }

    show() {
        setInterval(() => {
            //TODO here should be another mechanism of rendering!!!
            this.legend.render();
            this.chart.render(this.legend.activeArea);
        }, 25);
    }
}


window.onload = async function () {
    const data = await fetch('chart_data.json').then(data => data.json());
    const chart = new ChartWidget("chart", data[0]);

    chart.show();
};
