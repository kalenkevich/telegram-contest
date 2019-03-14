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
    init() {
        this.title = document.createElement('h2');
        this.title.innerText = 'Followers';
        this.title.style.fontFamily = 'Arial';

        this.chart = document.createElement('canvas');
        this.chart.id = 'chart';
        this.chart.width = options.chartWidth * options.pixelRatio;
        this.chart.height = options.chartHeight * options.pixelRatio;
        this.chart.style.width = `${options.chartWidth}px`;
        this.chart.style.height = `${options.chartHeight}px`;
        this.chart.getContext('2d').mozImageSmoothingEnabled = false;
        this.chart.getContext('2d').imageSmoothingEnabled = false;
        this.chart.style.border = `1px solid ${options.primaryChartColor}`;
        this.chart.style.display = 'block';

        this.legend = document.createElement('canvas');
        this.legend.id = 'legend';
        this.legend.width = options.legendWidth * options.pixelRatio;
        this.legend.height = options.legendHeight * options.pixelRatio;
        this.legend.style.width = `${options.legendWidth}px`;
        this.legend.style.height = `${options.legendHeight}px`;
        this.legend.getContext('2d').mozImageSmoothingEnabled = false;
        this.legend.getContext('2d').imageSmoothingEnabled = false;
        this.legend.style.border = `1px solid ${options.primaryChartColor}`;
        this.legend.style.display = 'block';
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
