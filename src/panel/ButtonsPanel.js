import Component from '../base/Component';

/**
 * Class which manage buttons with lines of the Chart
 */
export default class ButtonsPanel extends Component {
    init() {
        let data = this.props.data;
        const { xAxisType } = this.props.options;

        (this.props.data.columns || []).reduce((checkboxes, column) => {
            const [name,] = column;

            if (name !== xAxisType) {
                const checkbox = document.createElement('input');
                const label = document.createElement('label');
                const wrapper = document.createElement('div');

                checkbox.id = `checkbox-${name}`;
                checkbox.type = 'checkbox';
                checkbox.checked = true;

                label.for = checkbox.id;
                label.innerText = this.props.data.names[name];

                wrapper.style.marginRight = '10px';
                wrapper.appendChild(checkbox);
                wrapper.appendChild(label);

                checkbox.onclick = () => {
                    if (checkbox.checked) {
                        const column = (this.props.data.columns || []).find(column => column[0] === name);

                        data.columns.push(column);

                        this.props.onDataChange(data);
                    } else {
                        data = {
                            ...data,
                            columns: (data.columns || []).filter(column => column[0] !== name),
                        };

                        this.props.onDataChange(data);
                    }
                };

                checkboxes.push(wrapper);
            }

            return checkboxes;
        }, []).forEach(checkbox => {
            this.element.appendChild(checkbox);
        });
    }
}
