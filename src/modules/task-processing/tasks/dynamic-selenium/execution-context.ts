import { WebDriver, WebElement } from "selenium-webdriver"

import getByPath from 'lodash/get'
import setByPath from 'lodash/set'

export interface ExecutionContextStoreArgs extends Record<string, any> {
	driver: WebDriver
	userInputData?: Record<string, any>
}

interface ExecutionContextStore extends ExecutionContextStoreArgs {}

export class ExecutionContext {
	public store: ExecutionContextStore

	constructor(initialState: ExecutionContextStoreArgs) {
		this.store = {
			...initialState,
			store: this.store,
			executionContext: this,
		}
	}

	get<T = any>(key: string): T {
		return getByPath(this.store, key, null)
	}

	set(key: string, value: any): void {
		setByPath(this.store, key, value)
	}
}
