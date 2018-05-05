# ec2details
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Ftedivm%2Fec2details.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Ftedivm%2Fec2details?ref=badge_shield)


This service provides details about AWS EC2 Instance Types available in a variety of formats.

The data is generated from the EC2 services published in the [AWS Bulk API](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/using-ppslong.html), which is a giant (>218M) json file AWS that gets updated anytime there's a change in the ec2 service (new instances, price reductions, additional regions, etc). The problem with this file is that it is horribly obtuse (requiring [custom tools](http://blog.tedivm.com/open-source/2017/05/introducing-jsonsmash-work-with-large-json-files-easily/) simply to read it) and takes a lot of memory to parse (over 2gb using python, although significantly less when using node). This service uses that file to create a simplified version to make accessing EC2 instance type data far easier.

The data is regenerated at least once a day using a scheduled [CircleCI job](https://circleci.com/gh/tedivm/ec2details) and published using [Github pages](https://tedivm.github.io/ec2details/). Four times a day the scheduled CircleCI job regenerates the static API files and, if there is a change, pushes those files back up to the master branch of the git repository to update the Github Pages site.


## The API

The API currently serves the data in two formats, with each using the same data structure.

- json: [https://tedivm.github.io/ec2details/api/ec2instances.json](https://tedivm.github.io/ec2details/api/ec2instances.json)

- yaml: [https://tedivm.github.io/ec2details/api/ec2instances.yaml](https://tedivm.github.io/ec2details/api/ec2instances.yaml)

In both cases the instance type is the key, with attributes existing under that. Not every instance fill have every attribute (as an example, only the `p2`, `p3`, `g2` and `g3` instances have a `gpu` field), so it is important to check for both the existence of the field as well as the value.

Pricing is in USD and is broken down by region, operating system (Linux, RHEL, SUSE, or Windows), and tenancy (Dedicated or Shared).

```yaml
x1e.xlarge:
  clockSpeed: 2.3 GHz
  currentGeneration: true
  dedicatedEbsThroughput: 500 Mbps
  ecu: 12
  enhancedNetworkingSupported: true
  memory: 122 GiB
  networkPerformance: Up to 10 Gigabit
  normalizationSizeFactor: 8
  physicalProcessor: High Frequency Intel Xeon E7-8880 v3 (Haswell)
  prices:
    Linux:
      ap-northeast-1:
        Dedicated: 1.33
        Shared: 1.209
      ap-southeast-2:
        Dedicated: 1.33
        Shared: 1.209
      eu-west-1:
        Dedicated: 1.1
        Shared: 1
      us-east-1:
        Dedicated: 0.917
        Shared: 0.834
      us-west-2:
        Dedicated: 0.917
        Shared: 0.834
    RHEL:
      ap-northeast-1:
        Dedicated: 1.39
        Shared: 1.269
      ap-southeast-2:
        Dedicated: 1.39
        Shared: 1.269
      eu-west-1:
        Dedicated: 1.16
        Shared: 1.06
      us-east-1:
        Dedicated: 0.977
        Shared: 0.894
      us-west-2:
        Dedicated: 0.977
        Shared: 0.894
    SUSE:
      ap-northeast-1:
        Dedicated: 1.43
        Shared: 1.309
      ap-southeast-2:
        Dedicated: 1.43
        Shared: 1.309
      eu-west-1:
        Dedicated: 1.2
        Shared: 1.1
      us-east-1:
        Dedicated: 1.017
        Shared: 0.934
      us-west-2:
        Dedicated: 1.017
        Shared: 0.934
    Windows:
      ap-northeast-1:
        Dedicated: 1.582
        Shared: 1.461
      ap-southeast-2:
        Dedicated: 3.014
        Shared: 1.393
      eu-west-1:
        Dedicated: 1.764
        Shared: 1.184
      us-east-1:
        Dedicated: 1.101
        Shared: 0.834
      us-west-2:
        Dedicated: 1.101
        Shared: 1.086
  regions:
    - us-east-1
    - eu-west-1
    - ap-southeast-2
    - us-west-2
    - ap-northeast-1
  storage: 1 x 120
  vcpu: 4
```

## About

This project is [hosted on Github](https://github.com/tedivm/ec2details) under the [MIT License](https://github.com/tedivm/ec2details/blob/master/LICENSE).

It was created by [Robert Hafner](https://blog.tedivm.com/), who you can find on [Github](https://github.com/tedivm) and [Twitter](https://twitter.com/tedivm).


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Ftedivm%2Fec2details.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Ftedivm%2Fec2details?ref=badge_large)