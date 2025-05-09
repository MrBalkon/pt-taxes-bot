import { Task } from 'src/entities/task.entity';
import { User } from 'src/entities/user.entity';

export interface UserUpdate {
  metadata: Record<string, any>;
}

export interface UserWithMetaFields extends User {
  metaFields: Record<string, any>;
  tasksMap?: Record<string, Task>;
}

export interface UserWithAccesses extends User {
  acessedTasks: Task[];
}
