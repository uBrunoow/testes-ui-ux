import {Composition} from 'remotion';
import {DemoStorybook, DURATION, FPS} from './DemoStorybook';

export const Root: React.FC = () => (
  <Composition
    id="DemoStorybook"
    component={DemoStorybook}
    durationInFrames={DURATION}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
