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
        width: 1680,
        height: 400,
        popupColor: '#FFFFFF'
    },
    legend: {
        width: 1680,
        height: 50,
        activeArea: {
            defaultWidth: 1680 / 4,
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
        ...dayModeOptions.popupColor,
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

window.onload = function () {
    const chart = new ChartWidget(document.getElementById('chart-widget'), { data: Data[0], options: dayModeOptions });
    const switchModeButton = new SwitchModeButton(document.getElementById('switch-mode-button'), {
        isDayMode: true,
        onSwitchMode: (isDayMode) => {
            if (isDayMode) {
                chart.onOptionsChanged(dayModeOptions);
            } else {
                chart.onOptionsChanged(nightModeOptions);
            }
        },
    });

    chart.render();
    switchModeButton.render();
};
