import _ from 'lodash'
import fse from 'fs-extra'
import nanoid from 'nanoid'

const push = async (path, data) => {
	const processedData = {
		_id: nanoid(),
		_timestamp: new Date().toISOString(),
		...data,
	}
	return await fse.appendFile(path, '\n' + JSON.stringify(processedData))
}

const fetchList = async (path) => {
	try {
		const rawLogs = await fse.readFile(path, 'utf-8')
		return rawLogs
			.trim()
			.split('\n')
			.map((data) => JSON.parse(data))
	} catch (error) {
		return undefined
	}
}

const removeItem = async (path, id) => {
	const list = await fetchList(path)

	const newList = list.filter((obj) => obj._id !== id)

	const processedStr = newList.map((data) => JSON.stringify(data)).join('\n')

	await fse.writeFile(path, processedStr)

	return newList
}

const removeList = async (path) => {
	try {
		await fse.unlink(path)
	} catch (error) {
		return undefined
	}
}

export const jldb = {
	push,
	fetchList,
	removeItem,
	removeList,
}
