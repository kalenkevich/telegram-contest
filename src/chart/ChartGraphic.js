import { animate, hexToRgb } from '../utils';
import CanvasComponent from '../base/CanvasComponent';
import AnimationEffects from '../animation/Effects';
import DataChangeEvent from '../base/DataChangeEvent';

export default class ChartGraphic extends CanvasComponent {
    init() {
        const { lineSets } = this.props;

        this.state = { lineSets, lastChangeEvent: null };
        this.prevState = { lineSets };
    }

    get canAnimate() {
        return this.prevState.lineSets !== this.state.lineSets;
    }

    onLineSetsChanged(lineSets, event) {
        this.state.lineSets = lineSets;
        this.state.lastChangeEvent = event;

        this.rerender();
    }

    render() {
        super.render();

        if (this.state.isAnimationInProgress) {
            return;
        }

        const { animationType = 'none' } = this.props;
        const withAnimation = this.canAnimate && animationType !== 'none';

        withAnimation ? this.renderWithAnimation() : ChartGraphic.renderWithoutAnimation(this.state.lineSets, this.context, this.props);
    }

    renderWithAnimation() {
        const {
            lineWidth,
            options: { axis: { xAxisType }, pixelRatio },
            animationType,
            animationDuration,
        } = this.props;

        animate({
            onAnimationStarted: () => this.state.isAnimationInProgress = true,
            onAnimationFinished: () => {
                this.state.isAnimationInProgress = false;
                this.prevState.lineSets = this.state.lineSets;
            },
            duration: animationDuration,
            timing: (timeFraction) => AnimationEffects[animationType](timeFraction),
            draw: (progress) => {
                const { lineSets: currentLinesSet, lastChangeEvent } = this.state;
                const { lineSets: oldLinesSet } = this.prevState;
                this.context.lineWidth = lineWidth * pixelRatio;

                ChartGraphic.getLineSetNames(oldLinesSet, currentLinesSet).forEach((setName) => {
                    if (setName === xAxisType) {
                        return;
                    }

                    const {
                        prevSet,
                        currSet,
                        appeared,
                        disappeared,
                        changed,
                    } = ChartGraphic.getLineSetChangeState(setName, oldLinesSet, currentLinesSet, lastChangeEvent.type);

                    if (appeared) {
                        const { color } = currSet;

                        (currSet.lines || []).forEach((line) => {
                            const rgbColor = hexToRgb(color);
                            const path = new Path2D();
                            const deltaY1 = line.y1 + this.element.height;
                            const deltaY2 = line.y2 + this.element.height;

                            path.moveTo(line.x1, line.y1 - ((1 - progress) * deltaY1));
                            path.lineTo(line.x2, line.y2 - ((1 - progress) * deltaY2));

                            this.context.strokeStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${(progress).toFixed(2)})`;
                            this.context.stroke(path);
                        });

                        return;
                    }

                    if (disappeared) {
                        const { color } = prevSet;

                        (prevSet.lines || []).forEach((line) => {
                            const rgbColor = hexToRgb(color);
                            const path = new Path2D();
                            const deltaY1 = line.y1 + this.element.height;
                            const deltaY2 = line.y2 + this.element.height;

                            path.moveTo(line.x1, line.y1 - (progress) * deltaY1);
                            path.lineTo(line.x2, line.y2 - (progress) * deltaY2);

                            this.context.strokeStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${(1 - progress).toFixed(2)})`;
                            this.context.stroke(path);
                        });

                        return;
                    }

                    if (changed) {
                        this.context.strokeStyle = currSet.color;

                        (currSet.lines || []).forEach((line) => {
                            const path = new Path2D();

                            path.moveTo(line.x1, line.y1);
                            path.lineTo(line.x2, line.y2);

                            this.context.stroke(path);
                        });

                        return;
                    }

                    (currSet.lines || []).forEach((line, index) => {
                        const rgbColor = hexToRgb(currSet.color);
                        const path = new Path2D();

                        if (prevSet.lines[index]) {
                            const oldLine = prevSet.lines[index];

                            const prevLinePath = new Path2D();
                            prevLinePath.moveTo(oldLine.x1, oldLine.y1);
                            prevLinePath.lineTo(oldLine.x2, oldLine.y2);
                            this.context.strokeStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${(1 - progress).toFixed(2)})`;
                            this.context.stroke(prevLinePath);

                            const deltaY1 = line.y1 - oldLine.y1;
                            const deltaY2 = line.y2 - oldLine.y2;

                            path.moveTo(line.x1, line.y1 - ((1 - progress) * deltaY1));
                            path.lineTo(line.x2, line.y2 - ((1 - progress) * deltaY2));

                            this.context.strokeStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${(progress).toFixed(2)})`;
                            this.context.stroke(path);
                        } else {
                            path.moveTo(line.x1, line.y1);
                            path.lineTo(line.x2, line.y2);
                        }

                        this.context.strokeStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${(progress).toFixed(2)})`;
                        this.context.stroke(path);
                    });
                });
            },
        });
    }

    static getLineSetNames(prevState, currState) {
        const prevStateMap = (prevState || []).reduce((map, { name }) => ({ ...map, [name]: true }), {});
        const resultMap = (currState || []).reduce((map, { name }) => ({ ...map, [name]: true }), prevStateMap);

        return Object.keys(resultMap);
    }

    static getLineSetChangeState(setName, prevState, currState, eventType) {
        const { APPEARED, DISAPPEARED, SHIFTED, STRETCHED } = DataChangeEvent.EventTypes;
        const prevSet = (prevState || []).find(({ name }) => name === setName);
        const currSet = (currState || []).find(({ name }) => name === setName);

        return {
            appeared: !prevSet && !!currSet && eventType === APPEARED,
            disappeared: prevSet && !currSet && eventType === DISAPPEARED,
            changed: [SHIFTED, STRETCHED].includes(eventType),
            prevSet,
            currSet,
        };
    }

    static renderWithoutAnimation(lineSets, context, props) {
        const { lineWidth, options: { axis: { xAxisType }, pixelRatio } } = props;

        context.lineWidth = lineWidth * pixelRatio;

        for (let j = 0; j < lineSets[0].lines.length; j++) {
            for (let i = 0; i < lineSets.length; i++) {
                if (lineSets[i].name !== xAxisType) {
                    const line = lineSets[i].lines[j];
                    const path = new Path2D();

                    context.strokeStyle = lineSets[i].color;

                    path.moveTo(line.x1, line.y1);
                    path.lineTo(line.x2, line.y2);

                    context.stroke(path);
                }
            }
        }
    }
}
