#!/usr/bin/env node
const program = require('commander')
const rp = require('request-promise-native')
const fs = require('mz/fs')
const offers = 'https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/index.json'
const offersFile = '/tmp/aws_ec2_services.json'
const yaml = require('js-yaml')

async function downloadFile (forceDownload = false) {
  if (forceDownload || !await fs.existsSync(offersFile)) {
    const offersString = await rp(offers)
    await fs.writeFile(offersFile, offersString)
    return JSON.parse(offersString)
  }
  const fileContents = await fs.readFile(offersFile)
  return JSON.parse(fileContents)
}

async function getInstanceDetails () {
  const fields = [
    'currentGeneration',
    'vcpu',
    'physicalProcessor',
    'clockSpeed',
    'memory',
    'storage',
    'networkPerformance',
    'dedicatedEbsThroughput',
    'ecu',
    'enhancedNetworkingSupported',
    'gpu',
    'normalizationSizeFactor'
  ]

  const json = await downloadFile()
  const keys = Object.keys(json.products)
  const instances = {}

  for (const key of keys) {
    const serviceDetails = json.products[key].attributes
    if (!serviceDetails['instanceType'] || !serviceDetails['instanceType'].includes('.')) {
      continue
    }
    const instanceType = serviceDetails['instanceType']
    if (!instances[instanceType]) {
      instances[instanceType] = {}
    }

    for (const field of fields) {
      if (serviceDetails[field] && serviceDetails[field] !== 'NA') {
        instances[instanceType][field] = serviceDetails[field]
      }
    }
  }
  return instances
}

function instanceSort (a, b) {
  const familyA = a.substring(0, a.indexOf('.'))
  const familyB = b.substring(0, b.indexOf('.'))
  if (familyA === familyB) {
    return a.localeCompare(b)
  }
  return familyA.localeCompare(familyB)
}

program
  .version('0.1.0')

program
  .command('download')
  .description('Download the AWS Offers file.')
  .action(async function () {
    await downloadFile(true)
    console.log('Download finished.')
  })

program
  .command('details')
  .description('Output instance details.')
  .action(async function () {
    const instances = await getInstanceDetails()
    const instanceTypes = Object.keys(instances)
    instanceTypes.sort(instanceSort)
    for (const type of instanceTypes) {
      console.log(type)
      console.log(instances[type])
      console.log('\n')
    }
  })

program
  .command('instances')
  .description('Get a list of instance types.')
  .action(async function () {
    const instances = await getInstanceDetails()
    const instanceTypes = Object.keys(instances)
    instanceTypes.sort(instanceSort)

    for (const type of instanceTypes) {
      console.log(type)
    }
  })

program
  .command('json')
  .description('Output instance details as JSON.')
  .action(async function () {
    const instances = await getInstanceDetails()
    console.log(JSON.stringify(instances))
  })

program
  .command('yaml')
  .description('Output instance details as YAML.')
  .action(async function () {
    const instances = await getInstanceDetails()
    console.log(yaml.safeDump(instances, {'sortKeys': instanceSort}))
  })

// Sort commands so they are in alphabetical order in the help display.
program.commands.sort((a, b) => a._name.localeCompare(b._name))

// If no subcommand is passed return the help functions
if (!process.argv.slice(2).length) {
//  program.commands.sort((a, b) => a._name.localeCompare(b._name))
  program.outputHelp()
}

program.parse(process.argv)
