const primaryChartColor = '#AAAAAA';
const chartWidth = 600;
const chartHeight = 500;
const previewWidth = 600;
const previewHeight = 100;
const previewActiveAreaDefaultWidth = previewWidth / 4;

class PreviewActiveArea {
    constructor(element, data) {
        this.element = element;
        this.context = element.getContext('2d');
        this.data = data;
        this.dim = {
            width: previewActiveAreaDefaultWidth,
            height: previewHeight,
        };
        this.pos = {
            x: previewWidth - previewActiveAreaDefaultWidth * 2,
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

    onMouseMove(event) {
        this.context.rect(
            this.pos.x,
            this.pos.y,
            this.dim.width,
            this.dim.height,
        );
        if (this.context.isPointInPath(event.layerX, event.layerY)) {
            this.element.style.cursor = 'pointer';
        } else if (this.element.style.cursor === 'pointer') {
            this.element.style.cursor = 'default';
        }
    }

    onMouseDown(event) {
        const grabOffset = {
            x: event.pageX - this.offset.left - this.pos.x,
            y: event.pageY - this.offset.top - this.pos.y
        };

        if (   grabOffset.x >= 0
            && grabOffset.x <= this.dim.width
            && grabOffset.y >= 0
            && grabOffset.x <= this.dim.height
        ) {
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

        this.renderBackground();
        this.renderActiveArea();
        this.renderOverlay();
    }

    renderBackground() {
        const line = new Path2D();

        line.moveTo(0, previewHeight / 2);
        line.lineTo(this.element.width, previewHeight / 2);

        this.context.stroke(line);
    }

    renderActiveArea() {
        this.activeArea.render();
    }

    renderOverlay() {
        const fillStyle = this.context.fillStyle;

        this.context.fillStyle = "rgba(245, 249, 252, 0.9)";
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
            //TODO here should be another mechanism of rendering!!!
            this.preview.render();
        }, 25);
    }
}


window.onload = async function () {
    const data = await fetch('chart_data.json').then(data => data.json());
    const chart = new ChartWidget("chart", data[0]);

    chart.show();
};
