import _ from 'lodash'
import fse from 'fs-extra'
import { nanoid } from 'nanoid'

///////////////////////////////////////////////////////////////////////////////
// HELPERS
///////////////////////////////////////////////////////////////////////////////

const formatDateToSqlDatetime = (inputDate) => {
  const date = inputDate ? new Date(inputDate) : new Date()
	const dateWithOffest = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
	return dateWithOffest
		.toISOString()
		.slice(0, 19)
		.replace('T', ' ')
}

///////////////////////////////////////////////////////////////////////////////
// METHODS
///////////////////////////////////////////////////////////////////////////////

const push = async (path, data) => {
	const processedData = {
		_id: nanoid(),
		_timestamp: formatDateToSqlDatetime(),
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

const updateItem = async (path, newData) => {
	const list = await fetchList(path)

	if (!newData._id) {
		throw new Error(`New document must have the "_id" field!`)
	}

	const newList = list.map((obj) => {
		if (obj._id === newData._id) {
			return { 
				_id: obj._id,  
				_timestamp: obj._timestamp,
				...newData,
			}
		} else {
			return obj
		}
	})

	const processedStr = newList.map((data) => JSON.stringify(data)).join('\n')

	await fse.writeFile(path, processedStr)

	return newList
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
	updateItem,
	removeItem,
	removeList,
}
