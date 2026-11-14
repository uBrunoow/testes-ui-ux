import {Composition} from 'remotion';
import {DemoReal, DURATION, FPS} from './DemoReal';

export const Root: React.FC = () => (
  <Composition id="DemoStorybook" component={DemoReal} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
);
