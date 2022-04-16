# ec2details

This service is the easiest way to get a list of AWS EC2 Instance Types with metadata and prices.

## The API

The API currently serves the data in two formats, with each using the same data structure.

- json: [https://tedivm.github.io/ec2details/api/ec2instances.json](https://tedivm.github.io/ec2details/api/ec2instances.json)

- yaml: [https://tedivm.github.io/ec2details/api/ec2instances.yaml](https://tedivm.github.io/ec2details/api/ec2instances.yaml)

In both cases the instance type is the key, with attributes existing under that. Not every instance will have every attribute (as an example, only the `p` and `g` families have a `gpu` field), so it is important to check for both the existence of the field as well as the value.

Pricing is in USD and is broken down by region, operating system (Linux, RHEL, SUSE, or Windows), and tenancy (Dedicated or Shared).

```yaml
a1.2xlarge:
  clockSpeed: 2.3 GHz
  currentGeneration: true
  dedicatedEbsThroughput: Up to 3500 Mbps
  enhancedNetworkingSupported: true
  memory: 16 GiB
  networkPerformance: Up to 10 Gigabit
  normalizationSizeFactor: 16
  physicalProcessor: AWS Graviton Processor
  prices:
    Linux:
      ap-northeast-1:
        Dedicated: 0.2743
        Shared: 0.2568
      ap-south-1:
        Dedicated: 0.217
        Shared: 0.204
      ap-southeast-1:
        Dedicated: 0.2501
        Shared: 0.2352
      ap-southeast-2:
        Dedicated: 0.2825
        Shared: 0.2664
      eu-central-1:
        Dedicated: 0.248
        Shared: 0.2328
      eu-west-1:
        Dedicated: 0.2454
        Shared: 0.2304
      us-east-1:
        Dedicated: 0.2162
        Shared: 0.204
      us-east-2:
        Dedicated: 0.2162
        Shared: 0.204
      us-west-2:
        Dedicated: 0.2162
        Shared: 0.204
    RHEL:
      ap-northeast-1:
        Dedicated: 0.4043
        Shared: 0.3868
      ap-south-1:
        Dedicated: 0.347
        Shared: 0.334
      ap-southeast-1:
        Dedicated: 0.3801
        Shared: 0.3652
      ap-southeast-2:
        Dedicated: 0.4125
        Shared: 0.3964
      eu-central-1:
        Dedicated: 0.378
        Shared: 0.3628
      eu-west-1:
        Dedicated: 0.3754
        Shared: 0.3604
      us-east-1:
        Dedicated: 0.3462
        Shared: 0.334
      us-east-2:
        Dedicated: 0.3462
        Shared: 0.334
      us-west-2:
        Dedicated: 0.3462
        Shared: 0.334
    RHEL_HA:
      ap-northeast-1:
        Dedicated: 0.4372
        Shared: 0.4218
      ap-south-1:
        Dedicated: 0.3812
        Shared: 0.369
      ap-southeast-1:
        Dedicated: 0.4143
        Shared: 0.4002
      ap-southeast-2:
        Dedicated: 0.4474
        Shared: 0.4314
      eu-central-1:
        Dedicated: 0.4118
        Shared: 0.3978
      eu-west-1:
        Dedicated: 0.4092
        Shared: 0.3954
      us-east-1:
        Dedicated: 0.3812
        Shared: 0.369
      us-east-2:
        Dedicated: 0.3812
        Shared: 0.369
      us-west-2:
        Dedicated: 0.3812
        Shared: 0.369
    SUSE:
      ap-northeast-1:
        Dedicated: 0.4243
        Shared: 0.4068
      ap-south-1:
        Dedicated: 0.367
        Shared: 0.354
      ap-southeast-1:
        Dedicated: 0.4001
        Shared: 0.3852
      ap-southeast-2:
        Dedicated: 0.4325
        Shared: 0.4164
      eu-central-1:
        Dedicated: 0.398
        Shared: 0.3828
      eu-west-1:
        Dedicated: 0.3954
        Shared: 0.3804
      us-east-1:
        Dedicated: 0.3662
        Shared: 0.354
      us-east-2:
        Dedicated: 0.3662
        Shared: 0.354
      us-west-2:
        Dedicated: 0.3662
        Shared: 0.354
  regions:
    - ap-southeast-2
    - ap-northeast-1
    - ap-southeast-1
    - us-west-2
    - us-east-2
    - us-east-1
    - ap-south-1
    - eu-central-1
    - eu-west-1
  storage: EBS only
  vcpu: 8
```


## How it's Generated

The data is generated from the EC2 services published in the [AWS Bulk API](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/using-ppslong.html), which is a giant (>2.8G) json file that gets updated anytime there's a change in the EC2 service (new instances, price reductions, additional regions, etc).

Besides being huge, this file is that it is horribly obtuse (requiring [custom tools](http://blog.tedivm.com/open-source/2017/05/introducing-jsonsmash-work-with-large-json-files-easily/) simply to read it). This service uses takes the data in that file and converts it into a simpler data structure.

The data is regenerated four times a day using a scheduled [CircleCI job](https://circleci.com/gh/tedivm/ec2details) and published using [Github pages](https://tedivm.github.io/ec2details/). During each run the scheduled CircleCI job regenerates the static API files and, if there is a change, pushes those files back up to the master branch of the git repository to update the Github Pages site.

The resulting files are less than 0.1% of the size of the original, and are much easier to parse. Since the files are static and served over the Github CDN they are also quick to download.


## About

This project is [hosted on Github](https://github.com/tedivm/ec2details) under the [MIT License](https://github.com/tedivm/ec2details/blob/master/LICENSE).

It was created by [Robert Hafner](https://blog.tedivm.com/), who you can find on [Github](https://github.com/tedivm) and [Twitter](https://twitter.com/tedivm).


<script defer data-domain="tedivm.github.io/ec2details" src="https://plausible.io/js/plausible.js"></script>
