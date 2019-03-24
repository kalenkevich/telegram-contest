import { throttle } from '../utils';
import { THROTTLE_TIME_FOR_WINDOW_RESIZE } from '../contansts';
import ChartLegend from '../legend/Legend';
import CheckboxPanel from '../panel/CheckboxPanel';
import Component from '../base/Component';
import Chart from './Chart';

export default class ChartWidget extends Component {
    init() {
        const { options, data } = this.props;
        this.state = { originalOptions: options };

        this.onWindowResize = throttle(this.onWindowResize.bind(this), THROTTLE_TIME_FOR_WINDOW_RESIZE);

        window.addEventListener('resize', this.onWindowResize);

        this.setupComponents(ChartWidget.getOptions(options, options), data);
    }

    onWindowResize() {
        this.clear();
        this.setupComponents(ChartWidget.getOptions(this.props.options, this.state.originalOptions), this.props.data);

        this.render();
    }

    destroy() {
        window.removeEventListener('resize', this.onWindowResize);
    }

    setupComponents(options, data) {
        this.title = document.createElement('h2');
        this.chartElement = ChartWidget.getNewCanvas({
            ...options.chart,
            pixelRatio: options.pixelRatio,
        });
        this.legendElement = ChartWidget.getNewCanvas({
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

    static getOptions(options, originalOptions) {
        const currentOptions = JSON.parse(JSON.stringify(options));
        const windowDimension = ChartWidget.getWindowDimension();

        if (currentOptions.chart.width > windowDimension.width - 25) {
            currentOptions.chart.width = windowDimension.width - 25;
        } else if (currentOptions.chart.width < originalOptions.chart.width) {
            currentOptions.chart.width = originalOptions.chart.width;
        }

        if (currentOptions.legend.width > windowDimension.width - 25) {
            currentOptions.legend.width = windowDimension.width - 25;
        } else if (currentOptions.legend.width < originalOptions.legend.width) {
            currentOptions.legend.width = originalOptions.legend.width;
        }
        currentOptions.pixelRatio = window.devicePixelRatio;

        return currentOptions;
    }

    static getWindowDimension() {
        const width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        const height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        return {
            width,
            height,
        };
    }

    static getNewCanvas(options) {
        const canvas = document.createElement('canvas');

        canvas.width = options.width * options.pixelRatio;
        canvas.height = options.height * options.pixelRatio;
        canvas.style.width = `${options.width}px`;
        canvas.style.height = `${options.height}px`;
        canvas.getContext('2d').mozImageSmoothingEnabled = false;
        canvas.getContext('2d').imageSmoothingEnabled = false;
        canvas.style.display = 'block';

        return canvas;
    }

    onOptionsChanged(newOptions) {
        this.state.originalOptions = newOptions;
        this.props.options = newOptions;
        this.props.options = ChartWidget.getOptions(this.props.options, this.state.originalOptions);

        this.chart.onOptionsChanged(this.props.options);
        this.legend.onOptionsChanged(this.props.options);
        this.buttonsPanel.onOptionsChanged(this.props.options);

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
