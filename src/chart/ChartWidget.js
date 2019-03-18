import ChartLegend from '../legend/Legend';
import CheckboxPanel from '../panel/CheckboxPanel';
import Component from '../base/Component';
import Chart from './Chart';

/**
 * Class which manage all elements for
 */
export default class ChartWidget extends Component {
    constructor(element, data, options) {
        super(element, { data, options });
    }

    getNewCanvas(options) {
        const canvas = document.createElement('canvas');

        canvas.id = options.id;
        canvas.width = options.width * options.pixelRatio;
        canvas.height = options.height * options.pixelRatio;
        canvas.style.width = `${options.width}px`;
        canvas.style.height = `${options.height}px`;
        canvas.getContext('2d').mozImageSmoothingEnabled = false;
        canvas.getContext('2d').imageSmoothingEnabled = false;
        canvas.style.display = 'block';

        return canvas;
    }

    init() {
        const { options, data } = this.props;

        this.title = document.createElement('h2');
        this.chartElement = this.getNewCanvas({
            id: 'chart',
            ...options.chart,
            pixelRatio: options.pixelRatio,
        });
        this.legendElement = this.getNewCanvas({
            id: 'legend',
            ...options.legend,
            pixelRatio: options.pixelRatio,
        });
        this.legendElement.style.marginTop = '40px';

        this.buttonsPanelElement = document.createElement('div');
        this.buttonsPanelElement.style.display = 'flex';
        this.buttonsPanelElement.style.marginTop = '20px';

        this.element.appendChild(this.title);
        this.element.appendChild(this.chartElement);
        this.element.appendChild(this.legendElement);
        this.element.appendChild(this.buttonsPanelElement);

        this.chart = new Chart(this.chartElement, {
            data,
            options,
        });
        this.legend = new ChartLegend(this.legendElement, {
            data,
            options,
            onDataChange: (data) => {
                this.chart.onDataChanged(data);
            }
        });
        this.buttonsPanel = new CheckboxPanel(this.buttonsPanelElement, {
            data,
            options,
            onDataChange: (data) => {
                this.legend.onDataChanged(data);
            }
        });
    }

    onOptionsChanged(newOptions) {
        this.props.options = newOptions;

        this.chart.onOptionsChanged(newOptions);
        this.legend.onOptionsChanged(newOptions);
        this.buttonsPanel.onOptionsChanged(newOptions);

        this.render();
    }

    render() {
        const { options } = this.props;

        this.title.innerText = options.title.value;
        this.title.style.fontFamily = 'Arial';
        this.title.style.color = options.title.color;

        this.chartElement.style.border = `1px solid ${options.primaryChartColor}`;
        this.legendElement.style.border = `1px solid ${options.primaryChartColor}`;

        this.chart.render();
        this.legend.render();
        this.buttonsPanel.render();
    }
}
