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
	./bin/instance_details.js download

api:
	./bin/instance_details.js yaml > ./api/ec2instances.yaml
	./bin/instance_details.js json > ./api/ec2instances.json

deploy: download api
	git add api/*
	git diff --quiet HEAD api/ || git commit -m "Automated API update from CircleCI"; git push
