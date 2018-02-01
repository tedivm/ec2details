.PHONY: dependencies api clean fresh deploy

dependencies:
	bash -c 'yarn install'

clean:
	rm -rf node_modules
	rm -rf yarn.lock
	rm -rf package-lock.json

fresh: clean dependencies

api:
	./bin/instance_details.js yaml > ./api/ec2instances.yaml
	./bin/instance_details.js json > ./api/ec2instances.json

deploy:
	./bin/instance_details.js yaml > ./api/ec2instances.yaml
	./bin/instance_details.js json > ./api/ec2instances.json
	git push
