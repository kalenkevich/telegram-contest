const primaryChartColor = '#AAAAAA';
const chartWidth = 600;
const chartHeight = 500;
const previewWidth = 600;
const previewHeight = 100;
const previewActiveAreaDefaultWidth = previewWidth / 4;

const throttle = function(func, ms) {
    let isThrottled = false,
        savedArgs,
        savedThis;

    function wrapper() {

        if (isThrottled) { // (2)
            savedArgs = arguments;
            savedThis = this;
            return;
        }

        func.apply(this, arguments); // (1)

        isThrottled = true;

        setTimeout(function() {
            isThrottled = false; // (3)
            if (savedArgs) {
                wrapper.apply(savedThis, savedArgs);
                savedArgs = savedThis = null;
            }
        }, ms);
    }

    return wrapper;
};

class PreviewActiveArea {
    constructor(element, data) {
        this.element = element;
        this.context = element.getContext('2d');
        this.data = data;
        this.activeArea = {
            dim: {
                width: previewActiveAreaDefaultWidth,
                height: previewHeight,
            },
            pos: {
                x: previewWidth - previewActiveAreaDefaultWidth * 2,
                y: 0,
            },
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

    onMouseMove(event) {
        this.context.rect(
            this.activeArea.pos.x,
            this.activeArea.pos.y,
            this.activeArea.dim.width,
            this.activeArea.dim.height,
        );
        if (this.context.isPointInPath(event.layerX, event.layerY)) {
            this.element.style.cursor = 'pointer';
        } else if (this.element.style.cursor === 'pointer') {
            this.element.style.cursor = 'default';
        }
    }

    onMouseDown(event) {
        const grabOffset = {
            x: event.pageX - this.offset.left - this.activeArea.pos.x,
            y: event.pageY - this.offset.top - this.activeArea.pos.y
        };

        if (   grabOffset.x >= 0
            && grabOffset.x <= this.activeArea.dim.width
            && grabOffset.y >= 0
            && grabOffset.x <= this.activeArea.dim.height
        ) {
            const onMouseMove = (event) => {
                this.activeArea.pos.x = event.pageX - this.offset.left - grabOffset.x;

                if (this.activeArea.pos.x < 0) {
                    this.activeArea.pos.x = 0;
                }

                if (this.activeArea.pos.x + this.activeArea.dim.width > this.element.width) {
                    this.activeArea.pos.x = this.element.width - this.activeArea.dim.width;
                }
            };
            this.element.addEventListener("mousemove", onMouseMove);
            this.element.addEventListener("mouseup", () => this.element.removeEventListener('mousemove', onMouseMove));
        }
    }

    render() {
        this.context.strokeRect(
            this.activeArea.pos.x,
            this.activeArea.pos.y,
            this.activeArea.dim.width,
            this.activeArea.dim.height,
        );
    }
}

class ChartPreview {
    constructor(element, data) {
        this.data = data;
        this.element = element;
        this.context = element.getContext("2d");
        this.activeArea = new PreviewActiveArea(element, data);
    }

    render() {
        this.context.clearRect(0, 0, this.element.width, this.element.height);

        this.renderBackground(this.data);
        this.activeArea.render();
    }

    renderBackground(data) {
        const line = new Path2D();

        line.moveTo(0, previewHeight / 2);
        line.lineTo(this.element.width, previewHeight / 2);

        this.context.stroke(line);
    }
}

class ChartWidget {
    constructor(id, data) {
        this.chartContainer = document.getElementById(id);
        this.data = data;
    }

    init() {
        this.createElements();
    }

    createElements() {
        const title = document.createElement('h2');
        title.innerText = 'Followers';

        const chart = document.createElement('canvas');
        chart.id = 'chart';
        chart.width = chartWidth;
        chart.height = chartHeight;
        chart.style.border = `1px solid ${primaryChartColor}`;

        const preview = document.createElement('canvas');
        preview.id = 'preview';
        preview.width = previewWidth;
        preview.height = previewHeight;
        preview.style.border = `1px solid ${primaryChartColor}`;

        this.chartContainer.appendChild(title);
        this.chartContainer.appendChild(chart);
        this.chartContainer.appendChild(preview);

        this.chart = chart.getContext("2d");
        this.preview = new ChartPreview(preview, this.data);
    }

    show() {
        this.init();

        setInterval(() => {
            // throttle(window.requestAnimationFrame(() => this.preview.render()), 20);
            this.preview.render();
        }, 25);
    }
}


window.onload = async function () {
    const data = await fetch('chart_data.json').then(data => data.json());
    const chart = new ChartWidget("chart", data[0]);

    chart.show();
};
