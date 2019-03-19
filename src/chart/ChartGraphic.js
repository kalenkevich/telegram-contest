import { animate, hexToRgb } from '../utils';
import CanvasComponent from '../base/CanvasComponent';
import AnimationEffects from '../animation/Effects';

export default class ChartGraphic extends CanvasComponent {
    init() {
        const { lineSets } = this.props;

        this.state = { lineSets };
        this.prevState = { lineSets };
    }

    get canAnimate() {
        return this.prevState.lineSets !== this.state.lineSets;
    }

    onLineSetsChanged(lineSets) {
        this.state.lineSets = lineSets;

        this.rerender();
    }

    render() {
        super.render();

        if (this.state.isAnimationInProgress) {
            return;
        }

        const { animationType = 'none' } = this.props;
        const withAnimation = this.canAnimate && animationType !== 'none';

        false ? this.renderWithAnimation() : this.renderWithoutAnimation();
    }

    renderWithoutAnimation() {
        const { lineWidth, options: { axis: { xAxisType }, pixelRatio } } = this.props;
        const { lineSets } = this.state;

        this.context.lineWidth = lineWidth * pixelRatio;

        for (let j = 0; j < lineSets[0].lines.length; j++) {
            for (let i = 0; i < lineSets.length; i++) {
                if (lineSets[i].name !== xAxisType) {
                    const line = lineSets[i].lines[j];
                    const path = new Path2D();

                    this.context.strokeStyle = lineSets[i].color;

                    path.moveTo(line.x1, line.y1);
                    path.lineTo(line.x2, line.y2);

                    this.context.stroke(path);
                }
            }
        }
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
            timing: (timeFraction) => {
                const { lineSets: currentLinesSet } = this.state;
                const { lineSets: oldLinesSet } = this.state;
                const progress = AnimationEffects[animationType](timeFraction);
                const oldLinesState = [];
                const newLinesState = [];

                for (let j = 0; j < currentLinesSet[0].lines.length; j++) {
                    for (let i = 0; i < currentLinesSet.length; i++) {
                        if (currentLinesSet[i].name !== xAxisType) {
                            newLinesState.push({
                                line: currentLinesSet[i].lines[j],
                                color: currentLinesSet[i].color,
                            });
                        }
                    }
                }

                for (let j = 0; j < oldLinesSet[0].lines.length; j++) {
                    for (let i = 0; i < oldLinesSet.length; i++) {
                        if (oldLinesSet[i].name !== xAxisType) {
                            newLinesState.push({
                                line: oldLinesSet[i].lines[j],
                                color: oldLinesSet[i].color,
                            });
                        }
                    }
                }

                this.rerender();

                return {
                    oldLinesState,
                    newLinesState,
                    progress,
                };
            },
            draw: ({ newLinesState, oldLinesState, progress }) => {
                this.context.lineWidth = lineWidth * pixelRatio;

                (oldLinesState || []).forEach((lineState) => {
                    const { line, color } = lineState;
                    const rgbColor = hexToRgb(color);
                    const path = new Path2D();

                    path.moveTo(line.x1, line.y1);
                    path.lineTo(line.x2, line.y2);

                    this.context.strokeStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${(1 - progress).toFixed(2)})`;
                    this.context.stroke(path);
                });

                (newLinesState || []).forEach((lineState) => {
                    const { line, color } = lineState;
                    const rgbColor = hexToRgb(color);
                    const path = new Path2D();

                    path.moveTo(line.x1, line.y1);
                    path.lineTo(line.x2, line.y2);

                    this.context.strokeStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${(progress).toFixed(2)})`;
                    this.context.stroke(path);
                });
            },
        });
    }
}
