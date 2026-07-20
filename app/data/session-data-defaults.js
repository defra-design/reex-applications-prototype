// Country list from https://www.gov.uk/government/publications/geographical-names-and-information
let countries = require('./countries.json')
// Option lists from the overseas reprocessing interim sites log
let recoveryOperations = require('./recovery-operations.json')
let oecdCodes = require('./oecd-codes.json')
module.exports = {
  countries,
  "recovery-operations": recoveryOperations,
  "oecd-codes": oecdCodes,
  "repository-url": "https://github.com/defra-design/reex-applications-prototype",
  "prototype-url": "https://reex-applications-prototype-5c478b674681.herokuapp.com",

  "orgs": [
    {
      "id": "123001",
      "name": "GreenLoop Recovery",
      "users": [
        {
          "name": "Rosina Campbell",
          "email": "rosina@gws.com",
          "active": true
        },
        {
          "name": "Harry Edge",
          "email": "harry@gws.com"
        },
        {
          "name": "Cathryn Mansfield",
          "email": "cathryn@gws.com"
        },
        {
          "name": "Ghulam Patel",
          "email": "ghulam@gws.com"
        }
      ],
      "reprocessing-sites": [
        {
          "id": 0,
          "name": "North road",
          "address": "2 North Road, Addingrove, AA3 1AB",
          "regulator": "Environment Agency",
          "materials": [
            {
              "id": 0,
              "name": "Paper and board",
              "registration": "Approved",
              "registration-number": "R26ER1234560001PA",
              "accreditation": "Approved",
              "accreditation-number": "A26ER1234560001PA",
              "accreditation-expiry": "2026-12-31",
              "balance": "23.49",
              "tonnage": "Up to 500 tonnes",
              "authorised": ['Rosina Campbell', 'Harry Edge'],
              "business-plan": [{"copy":"New reprocessing infrastructure and maintaining existing infrastructure","percentage":"80","details":"I’ll spend the income to…"},{"copy":"Price support for buying packaging waste or selling recycled packaging waste","percentage":"","details":""},{"copy":"Building converted into accommodation","percentage":"20","details":"I’ll spend the income to…"},{"copy":"Price support for buying packaging waste or selling recycled packaging waste","percentage":"","details":""},{"copy":"Support for business collections","percentage":"","details":""},{"copy":"Communications, including information campaigns","percentage":"","details":""},{"copy":"Developing new markets for products made from recycled packaging waste","percentage":"","details":""},{"copy":"Developing new uses for recycled waste","percentage":"","details":""},{"copy":"Activities or investment not covered by the other categories","percentage":"","details":""}]
            }
          ]
        },
        {
          "id": 1,
          "name": "South road",
          "address": "111 South Road, Addingrove, AA3 1AB",
          "regulator": "Environment Agency",
          "materials": [
            {
              "id": 0,
              "name": "Paper and board",
              "registration": "Approved",
              "registration-number": "R26ER1234560002PA",
              "accreditation": "Approved",
              "accreditation-number": "A26ER1234560002PA",
              "accreditation-expiry": "2026-12-31",
              "balance": "23.49",
              "tonnage": "Up to 5,000 tonnes",
              "authorised": ['Rosina Campbell', 'Harry Edge'],
              "business-plan": [{"copy":"New reprocessing infrastructure and maintaining existing infrastructure","percentage":"80","details":"I’ll spend the income to…"},{"copy":"Price support for buying packaging waste or selling recycled packaging waste","percentage":"","details":""},{"copy":"Building converted into accommodation","percentage":"20","details":"I’ll spend the income to…"},{"copy":"Price support for buying packaging waste or selling recycled packaging waste","percentage":"","details":""},{"copy":"Support for business collections","percentage":"","details":""},{"copy":"Communications, including information campaigns","percentage":"","details":""},{"copy":"Developing new markets for products made from recycled packaging waste","percentage":"","details":""},{"copy":"Developing new uses for recycled waste","percentage":"","details":""},{"copy":"Activities or investment not covered by the other categories","percentage":"","details":""}]
            }
          ]
        }
      ],
      "exporting-sites": [
        {
          "id": 0,
          "name": "North road",
          "address": "2 North Road, Addingrove, AA3 1AB",
          "regulator": "Environment Agency",
          "materials": [
            {
              "id": 0,
              "name": "Paper and board",
              "registration": "Approved",
              "registration-number": "R26EE1234560001PA",
              "accreditation": "Not accredited"
            }
          ]
        }
      ]
    },
    {
      "id": "123002",
      "name": "EcoCycle Industries",
      "users": [
        {
          "name": "Rosina Campbell",
          "email": "rosina@greenloop.com",
          "active": true
        },
        {
          "name": "Harry Edge",
          "email": "harry@greenloop.com"
        },
        {
          "name": "Cathryn Mansfield",
          "email": "cathryn@greenloop.com"
        },
        {
          "name": "Ghulam Patel",
          "email": "ghulam@greenloop.com"
        }
      ],
      "overseas-sites": [
        {
          "organisation": "Bharat Recycling",
          "country": "India",
          "address": "4852/24, Ansari Road, Darya Ganj, Delhi, 110002, India"
        },
        {
          "organisation": "Dragon Recyclers",
          "country": "Hong Kong",
          "address": "Stanhope Hse North Point, Eastern District, Hong Kong"
        }
      ],
      "exporting-sites": [
        {
          "id": 0,
          "name": "North road",
          "address": "2 North Road, Addingrove, AA3 1AB",
          "regulator": "Environment Agency",
          "materials": [
            {
              "id": 0,
              "name": "Plastic",
              "registration": "Approved",
              "registration-number": "R26EX1234560001PA",
              "accreditation": "Approved",
              "accreditation-number": "A26EX1234560001PA",
              "accreditation-expiry": "2026-12-31",
              "balance": "23.49",
              "tonnage": "Up to 500 tonnes",
              "authorised": ['Rosina Campbell', 'Harry Edge'],
              "business-plan": [{"copy":"New reprocessing infrastructure and maintaining existing infrastructure","percentage":"80","details":"I’ll spend the income to…"},{"copy":"Price support for buying packaging waste or selling recycled packaging waste","percentage":"","details":""},{"copy":"Building converted into accommodation","percentage":"20","details":"I’ll spend the income to…"},{"copy":"Price support for buying packaging waste or selling recycled packaging waste","percentage":"","details":""},{"copy":"Support for business collections","percentage":"","details":""},{"copy":"Communications, including information campaigns","percentage":"","details":""},{"copy":"Developing new markets for products made from recycled packaging waste","percentage":"","details":""},{"copy":"Developing new uses for recycled waste","percentage":"","details":""},{"copy":"Activities or investment not covered by the other categories","percentage":"","details":""}],
              "overseas-sites": ["Bharat Recycling", "Dragon Recyclers"]
            }
          ]
        }
      ]
    }
  ]

}
