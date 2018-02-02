# ec2details

This service provides details about AWS EC2 Instance Typs available in a variety of formats.

The data is generated from the EC2 services published in the [AWS Bulk API](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/using-ppslong.html), which is a giant (>195M) json file AWS updates regularly. The problem with this file is that it is horribly obtuse (requiring [custom tools](http://blog.tedivm.com/open-source/2017/05/introducing-jsonsmash-work-with-large-json-files-easily/) simply to read it) and takes a lot of memory to parse (over 2gb using python). This service transforms that to make it much easier to use and access.

The data is regenerated at least once a day using a scheduled [CircleCI job](https://circleci.com/gh/tedivm/ec2details) and published using [Github pages](https://tedivm.github.io/ec2details/).


## The API

The API currently serves the data in two formats (each using the same data structure).

- json: https://tedivm.github.io/ec2details/api/ec2instances.json

- yaml: https://tedivm.github.io/ec2details/api/ec2instances.yaml

In both cases the instance type is the key, with attributes existing under that. Not every instance fill have every attribute (as an example, only the `p2`, `p3`, `g2` and `g3` instances have a `gpu` field).

```yaml
p3.16xlarge:
  clockSpeed: 2.3 GHz
  currentGeneration: true
  dedicatedEbsThroughput: 14000 Mbps
  ecu: '188'
  enhancedNetworkingSupported: true
  gpu: '8'
  memory: 488 GiB
  networkPerformance: 25 Gigabit
  normalizationSizeFactor: '128'
  physicalProcessor: Intel Xeon E5-2686 v4 (Broadwell)
  storage: EBS only
  vcpu: '64'
```


## Author

This project was created by [Robert Hafner](https://blog.tedivm.com/), who you can find on [Github](https://github.com/tedivm) and [Twitter](https://twitter.com/tedivm).
