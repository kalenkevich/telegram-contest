import data from '../resourses/chart_data.json';
import {
    pixelRatio,
    chartWidth,
    chartHeight,
    primaryChartColor,
    legendWidth,
    legendHeight,
} from './contansts';
import Chart from './chart/Chart';
import ChartLegend from './legend/Legend';
import ButtonsPanel from './panel/ButtonsPanel';

/**
 * Class which manage canvas elements
 */
class ChartWidget {
    constructor(id, data) {
        this.chartContainer = document.getElementById(id);

        this.title = document.createElement('h2');
        this.title.innerText = 'Followers';
        this.title.style.fontFamily = 'Arial';

        this.chart = document.createElement('canvas');
        this.chart.id = 'chart';
        this.chart.width = chartWidth * pixelRatio;
        this.chart.height = chartHeight * pixelRatio;
        this.chart.style.width = `${chartWidth}px`;
        this.chart.style.height = `${chartHeight}px`;
        this.chart.getContext('2d').mozImageSmoothingEnabled = false;
        this.chart.getContext('2d').imageSmoothingEnabled = false;
        this.chart.style.border = `1px solid ${primaryChartColor}`;
        this.chart.style.display = 'block';

        this.legend = document.createElement('canvas');
        this.legend.id = 'legend';
        this.legend.width = legendWidth * pixelRatio;
        this.legend.height = legendHeight * pixelRatio;
        this.legend.style.width = `${legendWidth}px`;
        this.legend.style.height = `${legendHeight}px`;
        this.legend.getContext('2d').mozImageSmoothingEnabled = false;
        this.legend.getContext('2d').imageSmoothingEnabled = false;
        this.legend.style.border = `1px solid ${primaryChartColor}`;
        this.legend.style.display = 'block';
        this.legend.style.marginTop = '40px';

        this.buttonsPanel = document.createElement('div');
        this.buttonsPanel.style.display = 'flex';

        this.chartContainer.appendChild(this.title);
        this.chartContainer.appendChild(this.chart);
        this.chartContainer.appendChild(this.legend);
        this.chartContainer.appendChild(this.buttonsPanel);

        this.chart = new Chart(this.chart, { data });
        this.legend = new ChartLegend(this.legend, {
            data,
            onDataChange: (data) => {
                this.chart.onDataChanged(data);
            }
        });
        this.buttonsPanel = new ButtonsPanel(this.buttonsPanel, {
            data,
            onDataChange: (data) => {
                this.legend.onDataChanged(data);
            }
        });
    }

    show() {
        this.chart.render();
        this.legend.render();
        this.buttonsPanel.render();
    }
}

window.onload = function () {
    const chart = new ChartWidget("chart", data[0]);

    chart.show();
};
