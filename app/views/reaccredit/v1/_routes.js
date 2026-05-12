const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Setup the prototype
router.get('*', (req, res, next) => {
  // Change the service name for this whole feature
  res.locals['serviceName'] = 'Record reprocessed or exported packaging waste'

  // Save the current page as a local var
  res.locals['currentPage'] = res.locals.currentPrototype+req.path

  let accountVersion = '/account/v1/'
  res.locals['accountVersion'] = accountVersion

  // Add main nav items
  res.locals['serviceNav'] = [
    {
      name: 'Home',
      link: accountVersion
    },
    {
      name: 'Manage account',
      link: '#0'
    },
    {
      name: 'Sign out',
      link: '#0'
    }
  ]

  if (!req.session.data['current-site-type']) {
    req.session.data['current-site-type'] = 'reprocessing'
  }

  next()
})

// Search for and render the current org/site/material
router.all('*', (req, res, next) => {
  // Find the current org
  let orgToFind = req.session.data['current-org'] || 0
  let orgs = req.session.data['orgs']
  let currentOrg = orgs.filter(org => org.id === orgToFind)
  // Pass it through to each page as local data
  res.locals.org = currentOrg[0]
  // Store it for use in later routes
  req.org = currentOrg

  // Find the current site
  let siteToFind = parseInt(req.session.data['current-site'] || '0')
  let sites = currentOrg[0][`${req.session.data['current-site-type']}-sites`]
  let currentSite = sites.filter(site => site.id === siteToFind)
  // Pass it through to each page as local data
  res.locals.site = currentSite[0]
  // Store it for use in later routes
  req.site = currentSite

  // Find the current material
  let materialToFind = parseInt(req.session.data['current-material'] || '0')
  let materials = currentSite[0].materials
  let currentMaterial = materials.filter(material => material.id === materialToFind)
  // Pass it through to each page as local data
  res.locals.material = currentMaterial[0]
  // Store it for use in later routes
  req.material = currentMaterial

  next()
})

router.get('/apply', (req, res) => {
  if (!req.material[0].application) {
    req.material[0].application = []

    if (req.session.data['current-site-type'] == 'reprocessing') {
      pErn = 'PRN'
    } else {
      pErn = 'PERN'
    }

    let setupApplication = [
      {
        name: pErn+' tonnage',
        link: 'tonnage',
        status: 'Incomplete'
      },
      {
        name: 'Authority to issue '+pErn+'s',
        link: 'authority',
        status: 'Incomplete'
      },
      {
        name: 'Business plan',
        link: 'business-plan',
        status: 'Incomplete'
      },
      {
        name: 'Sampling and inspection plan',
        link: 'si-plan',
        status: 'Incomplete'
      }
    ]

    req.material[0].application = setupApplication
  }

  res.redirect('apply/task-list')
})






// Add your routes above the module.exports line
module.exports = router