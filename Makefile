SHELL := /bin/bash
.PHONY: dependencies api clean fresh deploy
export NODE_OPTIONS := --max_old_space_size=4096

dependencies:
	bash -c 'yarn install'

clean:
	rm -rf node_modules
	rm -rf yarn.lock
	rm -rf package-lock.json

fresh: clean dependencies

download: /tmp/aws_ec2_services.json /tmp/aws_ec2_products.json /tmp/aws_ec2_terms.json

#
# Services
#

/tmp/aws_ec2_services.json:
	@echo Downloading AWS Offers file.
	curl -Ls https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/index.json > /tmp/aws_ec2_services.json

#
# Products
#

/tmp/aws_ec2_products.json: /tmp/aws_ec2_services.json
	@echo Generating Products File
	cat /tmp/aws_ec2_services.json | npx JSONStream 'products.*' > /tmp/aws_ec2_products.json

/tmp/aws_ec2_products.jsonl: /tmp/aws_ec2_products.json
	@echo Converting products.json to jsonl
	cat /tmp/aws_ec2_products.json | jq -cn --stream 'fromstream(1|truncate_stream(inputs))' > /tmp/aws_ec2_products.jsonl


#
# Terms
#

/tmp/aws_ec2_terms.json: /tmp/aws_ec2_services.json
	@echo Generating Terms File
	cat /tmp/aws_ec2_services.json | npx JSONStream 'terms.OnDemand.*' > /tmp/aws_ec2_terms.json


#
# Actual stuff
#


api:
	node --max-old-space-size=4096 ./bin/instance_details.js yaml > ./api/ec2instances.yaml
	node --max-old-space-size=4096 ./bin/instance_details.js json > ./api/ec2instances.json

deploy: download api
	git add api/*
	git diff --quiet HEAD api/ || git commit -m "Automated API update from CircleCI"; git push
