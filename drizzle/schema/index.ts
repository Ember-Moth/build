import { projects } from './projects';
import { secrets } from './secrets';
import { tasks } from './tasks';
import { workflows } from './workflows';

export const schema = {
  workflows,
  projects,
  secrets,
  tasks,
};

export * from './projects';
export * from './secrets';
export * from './tasks';
export * from './workflows';
