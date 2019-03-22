import Data from '../resources/chart_data.json';
import ChartWidget from './chart/ChartWidget';
import SwitchModeButton from './switch-mode/SwitchModeButton';

const dayModeOptions = {
    pixelRatio: window.devicePixelRatio || 1,
    title: {
        value: 'Followers',
        color: '#000000'
    },
    chart: {
        width: window.innerWidth,
        height: 400,
        popupColor: '#FFFFFF'
    },
    legend: {
        width: window.innerWidth,
        height: 50,
        activeArea: {
            defaultWidth: window.innerWidth / 4,
            stretchBorderWidth: 5,
        },
        overlayColor: '#EDF0F2',
    },
    panel: {
        textColor: '#000000'
    },
    axis: {
        xAxisType: 'x',
        scale: 6,
        fontSize: 14,
    },
    primaryChartColor: '#EDF0F2',
    textColor: '#AAAAAA',
};

const nightModeOptions = {
    ...dayModeOptions,
    title: {
        ...dayModeOptions.title,
        color: '#EDF0F2'
    },
    chart: {
        ...dayModeOptions.chart,
        popupColor: '#263240'
    },
    legend: {
        ...dayModeOptions.legend,
        overlayColor: '#212B37',
    },
    panel: {
        textColor: '#EDF0F2'
    },
    primaryChartColor: '#3E4A58',
    textColor: '#EDF0F2',
};

const createChartWidget = function (index, data, options) {
    const element = document.createElement('div');
    element.id = `chart-widget-${index}`;
    document.body.appendChild(element);

    return new ChartWidget(element, { data, options });
};

window.onload = function () {
    const charts = (Data || []).map((data, index) => createChartWidget(index, data, dayModeOptions));

    const switchModeElement = document.createElement('div');
    switchModeElement.id = 'switch-mode-button';
    document.body.appendChild(switchModeElement);

    const switchModeButton = new SwitchModeButton(switchModeElement, {
        isDayMode: true,
        onSwitchMode: (isDayMode) => {
            if (isDayMode) {
                (charts || []).forEach(chart => chart.onOptionsChanged(dayModeOptions));
            } else {
                (charts || []).forEach(chart => chart.onOptionsChanged(nightModeOptions));
            }
        },
    });

    (charts || []).forEach(chart => chart.render());
    switchModeButton.render();
};
