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

  // A single selected checkbox is stored as a string — normalise to an array
  let overseasSites = req.session.data['overseas-sites']
  if (typeof overseasSites === 'string') {
    req.session.data['overseas-sites'] = overseasSites ? [overseasSites] : undefined
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

  // Session data defaults are shared between sessions, so the application state
  // is kept in session data and attached to a copy of the material to render
  if (req.session.data['application-status']) {
    res.locals.material = Object.assign({}, currentMaterial[0], {
      application: {
        status: req.session.data['application-status']
      }
    })
  }

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

  // The task list is the standard journey, so leave the regulator query behind
  delete req.session.data['resubmit']
  req.session.data['application-status'] = 'In progress'

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
  // Send the user to upload evidence for each selected site that has none yet
  let selected = JSON.stringify(req.session.data['overseas-sites'] || [])

  if (selected.includes('Bharat') && !req.session.data['bharat-bes']) {
    res.redirect('bes?bes-site=bharat')
  } else if (selected.includes('Dragon') && !req.session.data['dragon-bes']) {
    res.redirect('bes?bes-site=dragon')
  } else {
    res.redirect('task-list')
  }
})

// Set the site name and existing uploads for the broadly equivalent standards page
router.get('/bes', (req, res, next) => {
  if (req.session.data['bes-site'] == 'bharat') {
    res.locals.siteName = 'Bharat Paper Recycling'
    res.locals.uploads = req.session.data['bharat-bes']
  } else {
    res.locals.siteName = 'Dragon Paper Recyclers'
    res.locals.uploads = req.session.data['dragon-bes']
  }

  next()
})

router.post('/bes', (req, res) => {
  let uploads

  if (req.session.data['bes-site'] == 'bharat') {
    if (!req.session.data['bharat-bes']) {
      req.session.data['bharat-bes'] = []
    }
    uploads = req.session.data['bharat-bes']
  } else {
    if (!req.session.data['dragon-bes']) {
      req.session.data['dragon-bes'] = []
    }
    uploads = req.session.data['dragon-bes']
  }

  // Setup the object with the answers given by the user
  const newUpload = Object.assign({
    name: req.session.data['bes-file'],
    date: req.session.data['bes-date'],
    start: req.session.data['bes-start-year']+'-'+parseInt(req.session.data['bes-start-month']).toLocaleString(undefined, {minimumIntegerDigits: 2})+'-'+parseInt(req.session.data['bes-start-day']).toLocaleString(undefined, {minimumIntegerDigits: 2}),
    end: req.session.data['bes-end-year']+'-'+parseInt(req.session.data['bes-end-month']).toLocaleString(undefined, {minimumIntegerDigits: 2})+'-'+parseInt(req.session.data['bes-end-day']).toLocaleString(undefined, {minimumIntegerDigits: 2})
  })

  // Pass the above object into the uploads data
  uploads.push(newUpload)

  delete req.session.data['bes-file']
  delete req.session.data['bes-date']
  delete req.session.data['bes-start-year']
  delete req.session.data['bes-start-month']
  delete req.session.data['bes-start-day']
  delete req.session.data['bes-end-year']
  delete req.session.data['bes-end-month']
  delete req.session.data['bes-end-day']

  res.redirect('bes')
})

router.get('/bes-delete', (req, res) => {
  var index = req.session.data['index']
  let uploads

  if (req.session.data['bes-site'] == 'bharat') {
    uploads = req.session.data['bharat-bes']
  } else {
    uploads = req.session.data['dragon-bes']
  }

  uploads.splice(index, 1)

  res.redirect('bes')
})

router.get('/bes-complete', (req, res) => {
  // Move on to the next selected site needing evidence, or back to the task list
  let selected = JSON.stringify(req.session.data['overseas-sites'] || [])

  if (selected.includes('Bharat') && !req.session.data['bharat-bes']) {
    res.redirect('bes?bes-site=bharat')
  } else if (selected.includes('Dragon') && !req.session.data['dragon-bes']) {
    res.redirect('bes?bes-site=dragon')
  } else {
    res.redirect('task-list')
  }
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
  delete req.session.data['recycling-operation']
  delete req.session.data['oecd-code-1']
  delete req.session.data['oecd-code-2']
  delete req.session.data['oecd-code-3']
  delete req.session.data['rejected-loads']
  delete req.session.data['export-conditions']
  delete req.session.data['broadly-equivalent-documentation']
  delete req.session.data['include-in-application']
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
  res.redirect('recycling-operation')
})

router.post('/add-site/recycling-operation', (req, res) => {
  res.redirect('oecd-codes')
})

router.post('/add-site/oecd-codes', (req, res) => {
  res.redirect('rejected-loads')
})

router.post('/add-site/rejected-loads', (req, res) => {
  res.redirect('accreditation')
})

router.post('/add-site/accreditation', (req, res) => {
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
    phone: req.session.data['phone'] || '01632 960 001',
    recyclingOperation: req.session.data['recycling-operation'],
    oecdCode1: req.session.data['oecd-code-1'],
    oecdCode2: req.session.data['oecd-code-2'],
    oecdCode3: req.session.data['oecd-code-3'],
    rejectedLoads: req.session.data['rejected-loads'],
    exportConditions: req.session.data['export-conditions'],
    broadlyEquivalentDocumentation: req.session.data['broadly-equivalent-documentation'],
    includeInApplication: req.session.data['include-in-application']
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

  // Only a plan opened from the regulator query goes back to the query
  if (req.session.data['resubmit']) {
    return res.redirect('query')
  }

  // Reprocessing sites have no overseas sites, and changing skips straight back
  if (req.session.data['change'] || req.session.data['current-site-type'] == 'reprocessing') {
    res.redirect('task-list')
  } else {
    res.redirect('overseas-sites')
  }
})


// Pass the uploaded supporting information files through to the page
router.get('/supporting-information', (req, res, next) => {
  res.locals.uploads = req.session.data['supporting-information']
  next()
})

router.post('/supporting-information', (req, res) => {
  if (!req.session.data['supporting-information']) {
    req.session.data['supporting-information'] = []
  }
  let uploads = req.session.data['supporting-information']

  // Don't allow more than the maximum of 10 files
  if (uploads.length < 10) {
    // Setup the object with the answers given by the user
    const newUpload = Object.assign({
      name: req.session.data['supporting-information-file']
    })

    // Pass the above object into the uploads data
    uploads.push(newUpload)
  }

  delete req.session.data['supporting-information-file']

  res.redirect('supporting-information')
})

// Delete an uploaded supporting information file
router.get('/supporting-information/delete-upload', (req, res) => {
  req.session.data['supporting-information'].splice(parseInt(req.session.data['index']), 1)
  res.redirect('../supporting-information')
})

// Finish uploading supporting information and return to the task list
router.get('/supporting-information/complete', (req, res) => {
  res.redirect('../task-list')
})


// Remember where the user came from so 'No' can send them back
router.get('/withdraw', (req, res, next) => {
  if (req.headers.referer) {
    req.session.data['withdraw-back'] = req.headers.referer
  }
  next()
})

router.post('/withdraw', (req, res) => {
  // If the user chose not to withdraw, go back to the previous page
  if (req.session.data['withdraw'] != 'Yes') {
    let back = req.session.data['withdraw-back'] || './'
    delete req.session.data['withdraw']
    delete req.session.data['withdraw-reason']
    delete req.session.data['withdraw-back']
    return res.redirect(back)
  }

  // Delete the application data
  delete req.session.data['tonnage']
  delete req.session.data['si-plan']
  delete req.session.data['supporting-information']
  delete req.session.data['overseas-sites']
  delete req.session.data['bharat-bes']
  delete req.session.data['dragon-bes']
  delete req.session.data['application-status']
  // Clear the withdraw question answers
  delete req.session.data['withdraw']
  delete req.session.data['withdraw-reason']
  delete req.session.data['withdraw-back']
  // Enable the notification banner
  req.session.data['application-withdrawn'] = true
  // Go back to the accreditation
  res.redirect('./')
})

// The regulator has queried the sampling and inspection plan of a submitted application
router.get('/email', (req, res, next) => {
  req.session.data['application-status'] = 'Requires resubmission'

  // The queried plan was uploaded as part of the submitted application
  if (!req.session.data['si-plan']) {
    req.session.data['si-plan'] = 'si-plan.pdf'
  }

  next()
})

router.post('/query', (req, res) => {
  req.session.data['application-resubmitted'] = true
  req.session.data['application-status'] = 'In review'
  // The resubmission is done
  delete req.session.data['resubmit']
  res.redirect('./')
})

router.get('/', (req, res, next) => {
  // Clear notification banners
  delete req.session.data['application-withdrawn']
  delete req.session.data['application-resubmitted']
  next()
})








// Example sites for the design option pages only. Two share a name so the
// operator feedback can be judged against the problem it describes.
const designOptionSites = [
  {
    organisation: 'Bharat Paper Recycling',
    address: '4852/24, Ansari Road, Darya Ganj, Delhi, 110002, India',
    evidence: false
  },
  {
    organisation: 'Bharat Paper Recycling',
    address: 'Plot 14, MIDC Industrial Area, Pune, 411019, India',
    evidence: true
  },
  {
    organisation: 'Dragon Paper Recyclers',
    address: 'Stanhope Hse North Point, Eastern District, Hong Kong',
    evidence: true
  }
]

router.get('/design-options*', (req, res, next) => {
  res.locals.exampleSites = designOptionSites
  // Same charges feeCalc uses, but for the example sites above
  res.locals.fee = 546 + (designOptionSites.length * 328)
  next()
})


// Add your routes above the module.exports line
module.exports = router