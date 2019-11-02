#!/usr/bin/env node
const program = require('commander')
const stringify = require('fast-json-stable-stringify')
const request = require('request')
const fs = require('mz/fs')
const yaml = require('js-yaml')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

const offers = 'https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/index.json'
const offersFile = '/tmp/aws_ec2_services.json'
const productsFile = '/tmp/aws_ec2_products.json'
const termsFile = '/tmp/aws_ec2_terms.json'

const regionMap = {
  'US East (Ohio)': 'us-east-2',
  'US East (N. Virginia)': 'us-east-1',
  'US West (N. California)': 'us-west-1',
  'US West (Oregon)': 'us-west-2',
  'Asia Pacific (Hong Kong)': 'ap-east-1',
  'Asia Pacific (Tokyo)': 'ap-northeast-1',
  'Asia Pacific (Seoul)': 'ap-northeast-2',
  'Asia Pacific (Osaka-Local)': 'ap-northeast-3',
  'Asia Pacific (Mumbai)': 'ap-south-1',
  'Asia Pacific (Singapore)': 'ap-southeast-1',
  'Asia Pacific (Sydney)': 'ap-southeast-2',
  'Canada (Central)': 'ca-central-1',
  'EU (Frankfurt)': 'eu-central-1',
  'EU (Ireland)': 'eu-west-1',
  'EU (London)': 'eu-west-2',
  'EU (Paris)': 'eu-west-3',
  'EU (Stockholm)': 'eu-north-1',
  'South America (Sao Paulo)': 'sa-east-1',
  'Middle East (Bahrain)': 'me-south-1',

  // No pricing currently available.
  'China (Beijing)': 'cn-north-1',
  'China (Ningxia)': 'cn-northwest-1',
  'AWS GovCloud (US)': 'us-gov-west-1'
}

async function downloadFile (forceDownload = false) {
  if (forceDownload || !await fs.existsSync(productsFile) || !await fs.existsSync(termsFile)) {
    if (forceDownload || !await fs.existsSync(offersFile)) {
      const stream = fs.createWriteStream(offersFile)
      request.get(offers).pipe(stream)
      await new Promise(fulfill => stream.on('finish', fulfill))
    }
    await exec(`jq '.products' ${offersFile} > ${productsFile}`)
    await exec(`jq '.terms.OnDemand' ${offersFile} > ${termsFile}`)
  }
  return true
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

  const intFields = [
    'normalizationSizeFactor',
    'vcpu',
    'gpu'
  ]

  const floatFields = [
    'ecu'
  ]

  await downloadFile()
  const products = require(productsFile)
  const terms = require(termsFile)
  const keys = Object.keys(products)
  const instances = {}

  for (const key of keys) {
    const sku = products[key].sku
    const serviceDetails = products[key].attributes
    if (!serviceDetails['instanceType'] || !serviceDetails['instanceType'].includes('.')) {
      continue
    }
    const instanceType = serviceDetails['instanceType']
    if (!instances[instanceType]) {
      instances[instanceType] = {
        'regions': [],
        'prices': {}
      }
    }

    const region = regionMap[serviceDetails['location']] ? regionMap[serviceDetails['location']] : serviceDetails['location']
    const operatingSystem = serviceDetails['operatingSystem']
    const tenancy = serviceDetails['tenancy']
    const preInstalledSw = serviceDetails['preInstalledSw']

    if (!instances[instanceType]['regions'].includes(region)) {
      instances[instanceType]['regions'].push(region)
    }

    if (operatingSystem !== 'NA' && tenancy !== 'Host' && preInstalledSw === 'NA' && terms[sku]) {
      const priceBlock = terms[sku]
      const offerCodes = Object.keys(priceBlock)
      const offerCode = offerCodes[0]
      const priceCode = Object.keys(priceBlock[offerCode]['priceDimensions'])[0]
      const price = priceBlock[offerCode]['priceDimensions'][priceCode]['pricePerUnit']['USD']
      if (price > 0) {
        if (!Object.keys(instances[instanceType]['prices']).includes(operatingSystem)) {
          instances[instanceType]['prices'][operatingSystem] = {}
        }
        if (!instances[instanceType]['prices'][operatingSystem][region]) {
          instances[instanceType]['prices'][operatingSystem][region] = {}
        }
        instances[instanceType]['prices'][operatingSystem][region][tenancy] = parseFloat(price)
      }
    }

    if (serviceDetails['location']) {
    }

    for (const field of fields) {
      if (serviceDetails[field] && serviceDetails[field] !== 'NA') {
        if (serviceDetails[field] === 'Yes' || serviceDetails[field] === 'No') {
          instances[instanceType][field] = serviceDetails[field] === 'Yes'
        } else if (intFields.includes(field)) {
          instances[instanceType][field] = parseInt(serviceDetails[field])
        } else if (floatFields.includes(field)) {
          instances[instanceType][field] = parseFloat(serviceDetails[field])
        } else {
          instances[instanceType][field] = serviceDetails[field]
        }
      }
    }
  }
  return instances
}

function instanceSort (a, b) {
  const aCompare = typeof a === 'string' ? a.substring(0, a.indexOf('.')) : a.key
  const bCompare = typeof b === 'string' ? b.substring(0, b.indexOf('.')) : b.key
  if (aCompare === bCompare) {
    return a.localeCompare(b)
  }
  return aCompare.localeCompare(bCompare)
}

program
  .version('0.2.0')

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
    console.log(stringify(instances, instanceSort))
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
