SHELL := /bin/bash
.PHONY: dependencies api clean fresh deploy

dependencies:
	bash -c 'yarn install'

clean:
	rm -rf node_modules
	rm -rf yarn.lock
	rm -rf package-lock.json

fresh: clean dependencies

download:
	echo Downloading AWS Offers file.
	curl -Ls https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/index.json > /tmp/aws_ec2_services.json
	echo Generating Products File
	echo Generating Terms File
	cat /tmp/aws_ec2_services.json | npx JSONStream 'terms.OnDemand.*' > /tmp/aws_ec2_terms.json

api:
	node --max-old-space-size=4096 ./bin/instance_details.js yaml > ./api/ec2instances.yaml
	node --max-old-space-size=4096 ./bin/instance_details.js json > ./api/ec2instances.json

deploy: download api
	git add api/*
	git diff --quiet HEAD api/ || git commit -m "Automated API update from CircleCI"; git push
