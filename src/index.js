import data from '../resourses/chart_data.json';
import Chart from './chart/Chart';
import ChartLegend from './legend/Legend';
import ButtonsPanel from './panel/ButtonsPanel';
import Component from './base/Component';

export const options = {
    pixelRatio: window.devicePixelRatio || 1,
    chartWidth: 800,
    chartHeight: 500,
    legendWidth: 800,
    legendHeight: 50,
    legendActiveAreaDefaultWidth: 800 / 4,
    legendActiveAreaStretchBorderWidth: 5,
    primaryChartColor: '#AAAAAA',
    xAxisType: 'x',
    canvasPaddingChart: 10,
    axisScale: 6,
    axisFontSize: 14,
};

/**
 * Class which manage all elements for
 */
export default class ChartWidget extends Component {
    getNewCanvas(options) {
        const canvas = document.createElement('canvas');

        canvas.id = options.id;
        canvas.width = options.width * options.pixelRatio;
        canvas.height = options.height * options.pixelRatio;
        canvas.style.width = `${options.width}px`;
        canvas.style.height = `${options.height}px`;
        canvas.getContext('2d').mozImageSmoothingEnabled = false;
        canvas.getContext('2d').imageSmoothingEnabled = false;
        canvas.style.border = `1px solid ${options.primaryChartColor}`;
        canvas.style.display = 'block';

        return canvas;
    }

    init() {
        this.title = document.createElement('h2');
        this.title.innerText = 'Followers';
        this.title.style.fontFamily = 'Arial';

        this.chart = this.getNewCanvas({
            id: 'chart',
            width: options.chartWidth,
            height: options.chartHeight,
            pixelRatio: options.pixelRatio,
            primaryChartColor: options.primaryChartColor,
        });
        this.legend = this.getNewCanvas({
            id: 'legend',
            width: options.legendWidth,
            height: options.legendHeight,
            pixelRatio: options.pixelRatio,
            primaryChartColor: options.primaryChartColor,
        });
        this.legend.style.marginTop = '40px';

        this.buttonsPanel = document.createElement('div');
        this.buttonsPanel.style.display = 'flex';

        this.element.appendChild(this.title);
        this.element.appendChild(this.chart);
        this.element.appendChild(this.legend);
        this.element.appendChild(this.buttonsPanel);

        this.chart = new Chart(this.chart, {
            data: this.props.data,
            options: this.props.options,
        });
        this.legend = new ChartLegend(this.legend, {
            data: this.props.data,
            options: this.props.options,
            onDataChange: (data) => {
                this.chart.onDataChanged(data);
            }
        });
        this.buttonsPanel = new ButtonsPanel(this.buttonsPanel, {
            data: this.props.data,
            options: this.props.options,
            onDataChange: (data) => {
                this.legend.onDataChanged(data);
            }
        });
    }

    render() {
        this.chart.render();
        this.legend.render();
        this.buttonsPanel.render();
    }
}

window.onload = function () {
    const chart = new ChartWidget(document.getElementById("chart"), {
        data: data[0],
        options,
    });

    chart.render();
};
