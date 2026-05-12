const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Setup the prototype
router.get('*', function(req, res, next){
  // Change the service name for this whole feature
  res.locals['serviceName'] = 'Record reprocessed or exported packaging waste'

  res.locals.currentPage = res.locals.currentPrototype+req.path

  // Find the current org
  let orgToFind = req.session.data['current-org'] || 0
  let orgs = req.session.data['orgs']
  let current = orgs.filter(org => org.id === orgToFind)
  // Pass it through to each page as local data
  res.locals.org = current[0]
  // Store it for use in later routes
  req.org = current

  next()
})


router.get('/material/*', function(req, res, next){
  // If current IDs exists render the data else redirect to home
  if (req.session.data['current-site'] && req.session.data['current-material']) {
    // Find the current site
    let siteToFind = parseInt(req.session.data['current-site'])
    let sites = req.org[0][`${req.session.data['current-site-type']}-sites`]
    let currentSite = sites.filter(site => site.id === siteToFind)
    // Pass it through to each page as local data
    res.locals.site = currentSite[0]
    // Store it for use in later routes
    req.site = currentSite

    // Find the current material
    let materialToFind = parseInt(req.session.data['current-material'])
    let materials = currentSite[0].materials
    let currentMaterial = materials.filter(material => material.id === materialToFind)
    // Pass it through to each page as local data
    res.locals.material = currentMaterial[0]
    // Store it for use in later routes
    req.material = currentMaterial

    next()
  } else {
    res.redirect(res.locals.currentPrototype+'/')
  }
})






// Add your routes above the module.exports line
module.exports = router