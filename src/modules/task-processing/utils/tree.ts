export interface FieldTree {
	[fieldId: number]: number[]
}

// NOT WORKING AS EXPECTED
export const treeSearchDeprecated = (tree: FieldTree) => {
	const tasks = Object.keys(tree).map(Number)
	const tasksToExecuteCountMap = new Map<number, number>()

	Object.values(tree).flat().forEach(task => {
		tasksToExecuteCountMap.set(task, 0)
	})

	const visited = new Set<number>()
	const candidatesSet = new Set<number>()

	for (const task of tasks) {
		// if (visited.has(task)) {
		// 	continue
		// }

		const queue = [task]
		visited.add(task)

		while (queue.length) {
			const currentTask = queue.shift()
			const children = tree[currentTask]

			if (!children.length) {
				if (tasksToExecuteCountMap.has(currentTask)) {
					candidatesSet.add(currentTask)
					const exustingItem = tasksToExecuteCountMap.get(currentTask)
					tasksToExecuteCountMap.set(currentTask, exustingItem + 1)
				}

				continue
			}

			for (const child of children) {
				if (!visited.has(child)) {
					queue.push(child)
					visited.add(child)
				}
			}
		}
	}

	console.log('tasksToExecuteCountMap', tasksToExecuteCountMap)

	return Array.from(candidatesSet)
}

export const treeSearch = (tree: FieldTree): number[] => {
	const tasks = Object.keys(tree).map(Number)
	const tasksToExecuteCountMap = new Map<number, number>()

	Object.values(tree).flat().forEach(task => {
		tasksToExecuteCountMap.set(task, 0)
	})

	const visited = new Set<number>()
	const candidatesSet = new Set<number>()

	for (const task of tasks) {
		if (visited.has(task)) {
			continue
		}

		const queue = [task]
		visited.add(task)

		while (queue.length) {
			const currentTask = queue.shift()
			const children = tree[currentTask]

			if (!children.length) {
				if (tasksToExecuteCountMap.has(currentTask)) {
					candidatesSet.add(currentTask)
					const exustingItem = tasksToExecuteCountMap.get(currentTask)
					tasksToExecuteCountMap.set(currentTask, exustingItem + 1)
				}

				continue
			}

			for (const child of children) {
				if (!visited.has(child)) {
					queue.push(child)
					visited.add(child)
				}
			}
		}
	}

	const result = Array.from(candidatesSet).sort((a, b) => {
		const aCount = tasksToExecuteCountMap.get(a) || 0
		const bCount = tasksToExecuteCountMap.get(b) || 0

		return bCount - aCount
	})

	return result
}