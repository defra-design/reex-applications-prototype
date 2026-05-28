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

  req.session.data['current-org'] = '2'

  next()
})

// Search for and render the current org/site/material
router.all('*', (req, res, next) => {
  // Find the current org
  let orgToFind = req.session.data['current-org'] || '2'
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

router.get('/apply*', (req, res, next) => {
  // If application doesn't exist, setup a new application
  if (!req.material[0].application) {
    req.material[0].application = []

    if (req.session.data['current-site-type'] == 'reprocessing') {
      pErn = 'PRN'
    } else {
      pErn = 'PERN'
    }

    let tonnage = req.material[0].tonnage

    if (tonnage == 'Up to 500 tonnes') {
      newFee = '546'
    } else if (tonnage == 'Up to 5,000 tonnes') {
      newFee = '2184'
    } else if (tonnage == 'Up to 10,000 tonnes') {
      newFee = '3276'
    } else if (tonnage == 'Over 10,000 tonnes') {
      newFee = '3965'
    }

    let setupApplication = {
      status: 'In progress',
      fee: newFee,
      questions: [
        {
          name: pErn+' tonnage',
          link: 'tonnage',
          status: 'Completed',
          answer: tonnage
        },
        {
          name: 'Authority to issue '+pErn+'s',
          link: 'authority',
          status: 'Completed',
          answer: req.material[0].authorised
        },
        {
          name: 'Business plan',
          link: 'business-plan',
          status: 'Completed',
          answer: req.material[0]['business-plan']
        },
        {
          name: 'Sampling and inspection plan',
          link: 'si-plan',
          status: 'Incomplete'
        }
      ]
    }

    req.material[0].application = setupApplication
  }

  next()
})

router.get('/apply/task-list', (req, res, next) => {
  // Delete the change flag
  delete req.session.data['change']

  // Prototype option to set all answers to completed
  if (req.session.data['complete-all']) {
    let questions = req.material[0].application.questions
    for (let q = 0; q < questions.length; q++) {
      questions[q].status = 'Completed'
    }
    delete req.session.data['complete-all']
    res.redirect('task-list');
  } else { next() }
})

// Get the current question and store
router.all('/apply/:question*', (req, res, next) => {
  // Find the current application
  let application = req.material[0].application
    // Pass it through to each page as local data
    res.locals.application = application
    // Store it for use in later routes
    req.application = application

  // Find the current question
  let questionToFind = req.params.question
  let questions = application.questions
  let currentQuestion = questions.filter(question => question.link === questionToFind)
    // If an answer exists, pass it through to each page as local data
    res.locals.answer = currentQuestion[0]?.answer
    // Store it for use in later routes
    req.currentQuestion = currentQuestion

  next()
})

router.get('/apply/:question/delete-upload', (req, res) => {
  delete req.currentQuestion[0].answer
  res.redirect(`../${req.params.question}`)
})

router.post('/apply/task-list', (req, res) => {
  req.session.data['application-submitted'] = true
  req.application.status = 'Resubmitted'
  res.redirect('../')
})

// Update status to complete for all questions all submit
router.post('/apply/:question', (req, res, next) => {
  let question = req.currentQuestion[0]
  // Update the status
  question.status = 'Completed'
  // Save the answer
  question.answer = req.session.data[`${req.params.question}`]

  // If updating the tonnage recalculate fee
  if (req.params.question == 'tonnage') {
    let answer = question.answer

    if (answer == 'Up to 500 tonnes') {
      req.material[0].application.fee = '546'
    } else if (answer == 'Up to 5,000 tonnes') {
      req.material[0].application.fee = '2184'
    } else if (answer == 'Up to 10,000 tonnes') {
      req.material[0].application.fee = '3276'
    } else if (answer == 'Over 10,000 tonnes') {
      req.material[0].application.fee = '3965'
    }
  }

  next()
})

router.post('/apply/tonnage', (req, res) => {
  if (req.session.data['change']) {
    res.redirect('task-list')
  } else {
    res.redirect('authority')
  }
})

router.post('/apply/authority', (req, res) => {
  if (req.session.data['change']) {
    res.redirect('task-list')
  } else {
    res.redirect('business-plan')
  }
})

router.post('/apply/business-plan', (req, res) => {
  if (req.session.data['change']) {
    res.redirect('task-list')
  } else {
    res.redirect('si-plan')
  }
})

router.post('/apply/si-plan', (req, res) => {
  if (req.session.data['change']) {
    res.redirect('task-list')
  } else {
    res.redirect('task-list')
  }
})

router.get('/', (req, res, next) => {
  delete req.session.data['application-submitted']
  next()
})






// Add your routes above the module.exports line
module.exports = router