import { Injectable } from "@nestjs/common";
import { DateTime } from "luxon";
import { TaskShedule, TaskSheduleType } from "src/entities/task-schedule.entity";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class TaskSheduleRepository extends Repository<TaskShedule> {
    constructor(
		private dataSource: DataSource
	)
    {
        super(TaskShedule, dataSource.createEntityManager());
    }

	async getRecurringTaskShedules() {
		return this.getTasksByType(TaskSheduleType.RECURRING);
	}

	async getOneShotTaskShedules() {
		return this.getTasksByType(TaskSheduleType.ONE_SHOT);
	}

	async getTasksByType(type: TaskSheduleType) {
		return this.createQueryBuilder('taskShedule')
		  .where('taskShedule.type = :type', { type })
		  .andWhere('taskShedule.isActive = true')
		  .leftJoinAndSelect('taskShedule.task', 'task')
		  .getMany();
	}

	async createTaskShedule(data: Partial<TaskShedule>) {
		return this.save(data);
	}

	async deleteOneShotTasksByIds(ids: number[]) {
		await this.createQueryBuilder()
		  .delete()
		  .from(TaskShedule)
		  .where("id IN (:...ids) AND type = 'one_shot'", { ids })
		  .execute();
	}

	async getOneShotTaskByTaskAndUserId(taskId: number, userId: number, date: DateTime) {
		return this.createQueryBuilder('ts')
		  .where('ts.type = :type', { type: TaskSheduleType.ONE_SHOT })
		  .andWhere("COALESCE(ts.task_payload::jsonb->>'userId', NULL)::int = :userId", { userId })
		  .andWhere('ts.taskId = :taskId', { taskId })
		  .andWhere('ts.isActive = true')
		  .andWhere('ts.oneShotDate > :date', { date: date.toJSDate() })
		  .getMany();
	}
}