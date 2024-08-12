import { Injectable, Logger } from "@nestjs/common";
import { Task, TaskProcessingPayload } from "../../../task-processing-queue/task-processing.types";

import { By, Key, WebDriver, WebElement } from 'selenium-webdriver';
import { ConfigService } from "src/modules/config/config.service";
import { UserService } from "src/modules/user/user.service";
import { SeleniumService } from "src/modules/selenium/selenium.service";
import { TelegramService } from "src/modules/telegram-config/telegram.service";
import { User } from "src/entities/user.entity";
import { QuestionService } from "src/modules/question/question.service";
import { ExecutionContext } from "./execution-context";
import { StepExecutionError, TaskExecution } from "./task-execution";
import { TaskService } from "src/modules/task/task.service";
import { ExecutionCommandService } from "src/modules/execution-command/execution-command.service";
import { ExecutionScenarioService } from "src/modules/execution-scenario/execution-scenario.service";
import { UserWithMetaFields } from "src/modules/user/user.types";
import { ScenarioTreeExecution } from "./scenario-tree-execution.task";


@Injectable()
export class DynamicTask implements Task {
	private logger = new Logger(DynamicTask.name)
	constructor(
		private readonly configService: ConfigService,
		private readonly userService: UserService,
		private readonly seleniumService: SeleniumService,
		private readonly telegramService: TelegramService,
		private readonly questionService: QuestionService,
		private readonly taskService: TaskService,
		private readonly executionScenarioService: ExecutionScenarioService,
		private readonly executionCommandService: ExecutionCommandService,
	) {}
  async run(task: TaskProcessingPayload): Promise<void> {
	const user = task.user
	const metaFields = task.metaFields

	await this.seleniumService.execute(async (driver) => this.runInSelenium(driver, user, metaFields, task))

	await this.telegramService.sendMessage(user.telegramId, 'Finished with login to Seg Social!')
  }

  async runInSelenium(driver: WebDriver, user: User, metaFields: Record<string, any>, task: TaskProcessingPayload): Promise<void> {
	const scenarioTasks = await this.executionScenarioService.getExecutionMapTreeByTaskSystemName(task.type)
	const commands = await this.executionCommandService.getExecutionCommandsByTaskSystemName(task.type)

	const executionContext = new ExecutionContext(
		{
			driver,
			selenium: {
				"By": By,
				"Key": Key,
			},
			node: {
				"Boolean": Boolean,
			},
			custom: {
				"Not": (value: any) => !value,
			},
			questionService: this.questionService,
			user: user,
		}
	)

	const logger = new Logger(`[${task.taskUid}]`)

	const executionTask = new ScenarioTreeExecution({
		executionContext,
		scenarioTasks,
		commands,
		logger,
	})

	try {
		await executionTask.executeTask()
	} catch (e) {
		throw e
	}
  }
}
