//
// For guidance on how to create routes see:
// https://prototype-kit.prototype.gov.uk/docs/routes
//
const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const config = require('govuk-prototype-kit/lib/config').getConfig()





router.use('/', (req, res, next) => {
	// If the prototype is running locally…
	if (req.get('host').includes('localhost')) {
		// Add a local variable, used to toggle hosted page link in footer
		res.locals.local = true

		// Add a current URL variable, used for the hosted page link in footer
		res.locals.currentURL = req.url
	}

	next()
})


// Import routes from different prototype folders
router.use("/:prototype/v:version", (req, res, next) => {
	// Save the current prototype path for use later
	res.locals.currentPrototype = '/'+req.params.prototype+'/v'+req.params.version

	// If there's a routes file import it
	try {
		return require(`./views/${req.params.prototype}/v${req.params.version}/_routes`)(req, res, next)
	} catch (e) { next() }
})