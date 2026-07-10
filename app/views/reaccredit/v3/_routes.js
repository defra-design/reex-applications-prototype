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
      link: '#0'
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
    req.session.data['current-site-type'] = 'exporting'
  }

  next()
})

// Search for and render the current org/site/material
router.all('*', (req, res, next) => {
  // Find the current org
  let orgToFind = req.session.data['current-org'] || '123002'
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

// Function to calculate fee
const feeCalc = function (req, res) {
  var newFee = 546

  let sites = req.session.data['overseas-sites'] || ''
  if (sites.length) {
    for (site in sites) {
      newFee = newFee+328
    }
  }

  res.locals.fee = newFee
}

router.get('/task-list', (req, res, next) => {
  // Calculate the fee
  feeCalc(req, res)

  // Delete the change flag
  delete req.session.data['change']

  next()
})

// Pre-select the current tonnage on the change page
router.get('/tonnage', (req, res, next) => {
  res.locals.answer = req.session.data['tonnage'] || req.material[0].tonnage
  next()
})

router.post('/tonnage', (req, res) => {
  res.redirect('task-list')
})

router.post('/overseas-sites', (req, res) => {
  res.redirect('task-list')
})


// Function to clear new site data
const clearSiteData = function (req) {
  delete req.session.data['address']
  delete req.session.data['country']
  delete req.session.data['lat-long']
  delete req.session.data['organisation']
  delete req.session.data['name']
  delete req.session.data['email']
  delete req.session.data['phone']
}

router.post('/add-site/cancel', (req, res) => {
  clearSiteData(req)
  res.redirect('../manage-sites')
})

router.post('/add-site/address', (req, res) => {
  res.redirect('organisation')
})

router.post('/add-site/organisation', (req, res) => {
  if (!req.session.data['organisation'].length) {
    req.session.data['organisation'] = 'Example Orgnisation'
  }
  res.redirect('contact')
})

router.post('/add-site/address', (req, res) => {
  res.redirect('contact')
})

router.post('/add-site/contact', (req, res) => {
  res.redirect('check-answers')
})

router.post('/add-site/check-answers', (req, res) => {
  var sites = req.org[0]['overseas-sites']

  // Setup the object with the answers given by the user
  const newSite = Object.assign({
    address: req.session.data['address'] || 'Example address',
    country: req.session.data['country'] || 'Country',
    latLong: req.session.data['lat-long'] || '51.50346364705508, -0.12759261661237808',
    organisation: req.session.data['organisation'] || 'Example Orgnisation',
    name: req.session.data['name'] || 'Joe Bloggs',
    email: req.session.data['email'] || 'joe@email.com',
    phone: req.session.data['phone'] || '01632 960 001'
  })

  // Pass the above object into the sites and clear temp site data
  sites.push(newSite)
  clearSiteData(req)

  // Enable the notification banner
  req.session.data['site-added'] = true

  res.redirect('../manage-sites')
})

router.get('/manage-sites', (req, res, next) => {
  // Clear notification banner
  delete req.session.data['site-added']
  next()
})


// Pass the uploaded sampling and inspection plan through to the page
router.get('/si-plan', (req, res, next) => {
  res.locals.answer = req.session.data['si-plan']
  next()
})

// Delete the uploaded sampling and inspection plan
router.get('/si-plan/delete-upload', (req, res) => {
  delete req.session.data['si-plan']
  res.redirect('../si-plan')
})

router.post('/si-plan', (req, res) => {
  // If no file was chosen, use an example filename
  if (!req.session.data['si-plan']) {
    req.session.data['si-plan'] = 'si-plan.pdf'
  }

  // Reprocessing sites have no overseas sites, and changing skips straight back
  if (req.session.data['change'] || req.session.data['current-site-type'] == 'reprocessing') {
    res.redirect('task-list')
  } else {
    res.redirect('overseas-sites')
  }
})








// Add your routes above the module.exports line
module.exports = router