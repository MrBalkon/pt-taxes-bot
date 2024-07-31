import { Injectable } from "@nestjs/common";
import { User } from "src/entities/user.entity";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class UserRepository extends Repository<User> {
    constructor(
		private dataSource: DataSource
	)
    {
        super(User, dataSource.createEntityManager());
    }

	async getUsersByTaskId(taskId: number) {
		return this.createQueryBuilder('user')
		  .select('user.id')
		  .leftJoin('user.featureAccesses', 'featureAccesses')
		  .leftJoin('featureAccesses.feature', 'feature')
		  .leftJoin('feature.featureTasks', 'featureTasks')
		  .innerJoin('featureTasks.task', 'task')
		  .where('task.id = :taskId', { taskId })
		  .getMany();
	}

	async getUserIdsByTaskId(taskId: number) {
		const users = await this.getUsersByTaskId(taskId);
		return users.map(user => user.id);
	}
}