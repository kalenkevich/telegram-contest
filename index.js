const primaryChartColor = '#AAAAAA';
const chartWidth = 600;
const chartHeight = 500;
const previewWidth = 600;
const previewHeight = 200;
const previewActiveAreaDefaultWidth = previewWidth / 4;

class ChartGraphic {
    constructor(element, data) {
        this.data = data;
        this.context = element.getContext("2d");
    }

    render() {
        const lineIndex = 1;
        const [name2, ...values2] = this.data.columns[lineIndex];

        const strokeStyle = this.context.strokeStyle;
        this.context.strokeStyle = this.data.colors[name2];

        for (let index = 0; index < values2.length; index) {
            const path = new Path2D();
            path.moveTo(index * 5, values2[index]);
            path.lineTo(++index * 5, values2[index]);

            this.context.stroke(path);
        }

        this.context.strokeStyle = strokeStyle;
    }
}

class Chart {
    constructor(element, data) {
        this.data = data;
        this.context = element.getContext("2d");
        this.chartGraphic = new ChartGraphic(element, data);
    }

    render() {
        this.chartGraphic.render();
    }
}

class PreviewActiveArea {
    constructor(element) {
        this.element = element;
        this.context = element.getContext('2d');
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
        if (this.context.isPointInPath(event.pageX - this.offset.left, event.pageY - this.offset.top)) {
            this.element.style.cursor = 'pointer';
        } else {
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
        this.element = element;
        this.context = element.getContext("2d");
        this.activeArea = new PreviewActiveArea(element);
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

        this.preview = document.createElement('canvas');
        this.preview.id = 'preview';
        this.preview.width = previewWidth;
        this.preview.height = previewHeight;
        this.preview.style.border = `1px solid ${primaryChartColor}`;

        this.chartContainer.appendChild(this.title);
        this.chartContainer.appendChild(this.chart);
        this.chartContainer.appendChild(this.preview);

        this.chart = new Chart(this.chart, this.data);
        this.preview = new ChartPreview(this.preview, this.data);
    }
    show() {
        setInterval(() => {
            //TODO here should be another mechanism of rendering!!!
            this.preview.render();
            this.chart.render();
        }, 25);
    }
}


window.onload = async function () {
    const data = await fetch('chart_data.json').then(data => data.json());
    const chart = new ChartWidget("chart", data[0]);

    chart.show();
};
