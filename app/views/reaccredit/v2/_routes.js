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
const feeCalc = function (req) {
  let questions = req.material[0].application.questions
  let tonnageQuestion = questions.filter(question => question.link === 'tonnage')
  let tonnage = tonnageQuestion[0].answer
  var newFee = 0

  if (tonnage == 'Up to 500 tonnes') {
    newFee = 546
  } else if (tonnage == 'Up to 5,000 tonnes') {
    newFee = 2184
  } else if (tonnage == 'Up to 10,000 tonnes') {
    newFee = 3276
  } else if (tonnage == 'Over 10,000 tonnes') {
    newFee = 3965
  }

  let sitesQuestion = questions.filter(question => question.link === 'overseas-sites')
  if (sitesQuestion.length) {
    let sites = sitesQuestion[0].answer || ''
    for (let a = 0; a < sites.length; a++) {
      newFee = newFee+328
    }
  }

  req.material[0].application.fee = newFee
}

router.get('/apply*', (req, res, next) => {
  // If application doesn't exist, setup a new application
  if (!req.material[0].application) {
    req.material[0].application = []

    if (req.session.data['current-site-type'] == 'reprocessing') {
      setupApplication = {
        status: 'In progress',
        questions: [
          {
            name: 'PRN tonnage',
            link: 'tonnage',
            status: 'Completed',
            answer: req.material[0].tonnage
          },
          {
            name: 'Authority to issue PRNs',
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
    } else {
      setupApplication = {
        status: 'In progress',
        questions: [
          {
            name: 'PERN tonnage',
            link: 'tonnage',
            status: 'Completed',
            answer: req.material[0].tonnage
          },
          {
            name: 'Authority to issue PERNs',
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
          },
          {
            name: 'Overseas reprocessing sites',
            link: 'overseas-sites',
            status: 'Incomplete'
          }
        ]
      }
    }

    req.material[0].application = setupApplication
    feeCalc(req)
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

router.post('/apply/query', (req, res) => {
  req.session.data['application-resubmitted'] = true
  req.material[0].application.status = 'In review'
  res.redirect('../')
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
  req.application.status = 'Submitted'
  res.redirect('payment')
})

router.post('/apply/discard', (req, res) => {
  // Delete the application data
  delete req.material[0].application
  delete req.session.data['bharat-bes']
  delete req.session.data['dragon-bes']
  // Enable the notification banner
  req.session.data['application-discarded'] = true
  // Go back to the accreditation
  res.redirect('../')
})

router.post('/apply/bes', (req, res) => {
  if (req.session.data['bes-site'] == 'bharat') {
    if (!req.session.data['bharat-bes']) {
      req.session.data['bharat-bes'] = []
    }

    uploads = req.session.data['bharat-bes'] || []
  } else {
    if (!req.session.data['dragon-bes']) {
      req.session.data['dragon-bes'] = []
    }

    uploads = req.session.data['dragon-bes'] || []
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

// Update status to complete for all questions all submit
router.post('/apply/:question', (req, res, next) => {
  let question = req.currentQuestion[0]
  // Update the status
  question.status = 'Completed'
  // Save the answer
  question.answer = req.session.data[`${req.params.question}`]

  feeCalc(req)
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
  if (!req.session.data['si-plan']) {
    let question = req.currentQuestion[0]
    question.answer = 'si-plan.pdf'
  }

  if (req.application.status == 'Requires resubmission') {
    res.redirect('query')
  } else if (req.session.data['change'] || req.session.data['current-site-type'] == 'reprocessing') {
    res.redirect('task-list')
  } else {
    res.redirect('overseas-sites')
  }
})

router.post('/apply/overseas-sites', (req, res) => {
  let questions = req.material[0].application.questions
  let question = req.currentQuestion[0]

  if (!req.session.data['overseas-sites']) {
    question.answer = ["Bharat Paper Recycling"]
  }

//   for (let a = 0; a < question.answer.length; a++) {
//     let answer = 'Evidence of '+question.answer[a]+' broadly equivalent standards'
//     let checkAnswer = JSON.stringify(questions)
//
//     if (!checkAnswer.includes(answer)) {
//       let newQuestion = Object.assign({
//         name: answer,
//         link: 'bes',
//         status: 'Incomplete'
//       })
//
//       questions.push(newQuestion)
//     }
//   }

  let checkAnswer = JSON.stringify(question.answer)
  if (checkAnswer.includes('Bharat') && !req.session.data['bharat-bes']) {
    res.redirect('bes?bes-site=bharat')
  } else if (checkAnswer.includes('Dragon') && !req.session.data['dragon-bes']) {
    res.redirect('bes?bes-site=dragon')
  } else {
    res.redirect('task-list')
  }
})

router.get('/apply/bes', (req, res, next) => {
  if (req.session.data['bes-site'] == 'bharat') {
    res.locals.siteName = 'Bharat Paper Recycling'
    res.locals.uploads = req.session.data['bharat-bes']
  } else {
    res.locals.siteName = 'Dragon Paper Recyclers'
    res.locals.uploads = req.session.data['dragon-bes']
  }

  next()
})

router.get('/apply/bes-delete', (req, res) => {
  var index = req.session.data['index']
  if (req.session.data['bes-site'] == 'bharat') {
    uploads = req.session.data['bharat-bes']
  } else {
    uploads = req.session.data['dragon-bes']
  }

  uploads.splice(index, 1)

  res.redirect('bes')
})

router.get('/apply/bes-complete', (req, res) => {
  let checkAnswer = JSON.stringify(req.material[0].application.questions)
  if (checkAnswer.includes('Bharat' && !req.session.data['bharat-bes'])) {
    res.redirect('bes?bes-site=bharat')
  } else if (checkAnswer.includes('Dragon' && !req.session.data['dragon-bes'])) {
    res.redirect('bes?bes-site=dragon')
  } else {
    res.redirect('task-list')
  }
})

router.get('/get-query', (req, res) => {
  let questions = req.material[0].application.questions
  let tonnageQuestion = questions.filter(question => question.link === 'si-plan')
  tonnageQuestion[0].status = 'Queried'
  req.material[0].application.status = 'Requires resubmission'

  res.redirect('email')
})

router.get('/apply/payment', (req, res, next) => {
  // Clear the submission banner
  delete req.session.data['application-submitted']
  next()
})

router.get('/', (req, res, next) => {
  // Clear the discard notification banner
  delete req.session.data['application-discarded']
  // Clear the submission banner
  delete req.session.data['application-resubmitted']
  next()
})






// Add your routes above the module.exports line
module.exports = router