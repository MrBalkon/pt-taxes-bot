import { Injectable } from "@nestjs/common";
import { TaskField } from "src/entities/task-field.entity";
import { TaskOutputField } from "src/entities/task-fields-output.entity";
import { DataSource, EntityManager, Repository } from "typeorm";

@Injectable()
export class TaskFieldRepository extends Repository<TaskField> {
    constructor(
		private dataSource: DataSource
	)
    {
        super(TaskField, dataSource.createEntityManager());
    }

	async getOutputFieldsByTaskId(taskId: number, manager: EntityManager = this.manager) {
		return manager.getRepository(TaskOutputField)
			.createQueryBuilder('tof')
			.where('tof.task_id = :taskId', { taskId })
			.getMany();
	}
}