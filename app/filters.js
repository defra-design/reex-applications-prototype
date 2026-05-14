const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter
const dateFilter = require('nunjucks-date-filter')

addFilter('date', dateFilter)
dateFilter.setDefaultFormat('D MMMM YYYY')

addFilter('push', (array, item) => {
	array.push(item)
	return array
})

addFilter('cleanArray', (array) => {
	return array.filter(item => {
		return (item && (item !==""))
	})
})