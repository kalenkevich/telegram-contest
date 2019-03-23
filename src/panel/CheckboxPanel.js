import Component from '../base/Component';

export const checkboxStyles = 'opacity: 0;height: 0;width: 0;cursor: pointer;';
export const checkmarkStyles = (color1, color2) => `position: relative;height: 25px;width: 25px;border-radius: 50%;border: 2px solid ${color1};background-color: ${color2};`;
export const labelStyles = (primaryChartColor, textColor) => `user-select: none;margin-right: 10px;min-width: 70px;height: 22px;display: flex;flex-direction: row-reverse;align-items: center;justify-content: space-between;border: 1px solid ${primaryChartColor};border-radius: 50px;padding: 7px;font-family: 'Arial';font-size: 18px;cursor: pointer;color: ${textColor}`;
export default class CheckboxPanel extends Component {
    render() {
        const { axis: { xAxisType }, primaryChartColor, panel: { textColor } } = this.props.options;
        let data = this.props.data;

        this.element.innerText = '';
        (this.props.data.columns || []).reduce((checkboxes, column) => {
            const [name,] = column;
            const color = this.props.data.colors[name];

            if (name !== xAxisType) {
                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                const checkmark = document.createElement('span');
                const id = `checkbox-${name}`;
                let isChecked = true;

                checkbox.type = 'checkbox';
                checkbox.checked = isChecked;
                checkbox.style = checkboxStyles;
                checkmark.className = 'checkmark';
                checkmark.style = checkmarkStyles(color, color);

                label.id = id;
                label.innerText = this.props.data.names[name];
                label.style = labelStyles(primaryChartColor, textColor);
                label.appendChild(checkbox);
                label.appendChild(checkmark);

                const onClick = (event) => {
                    if (event.target.checked) {
                        const column = (this.props.data.columns || []).find(column => column[0] === name);

                        data.columns.push(column);

                        this.props.onDataChange(data);

                        checkmark.style = checkmarkStyles(color, color);
                    } else {
                        data = {
                            ...data,
                            columns: (data.columns || []).filter(column => column[0] !== name),
                        };

                        this.props.onDataChange(data);

                        checkmark.style = checkmarkStyles(color, 'transparent');
                    }
                };

                checkbox.addEventListener('click', onClick);

                checkboxes.push(label);
            }

            return checkboxes;
        }, []).forEach(checkbox => this.element.appendChild(checkbox));
    }
}
