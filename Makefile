.PHONY: dependencies

dependencies:
	bash -c 'yarn install'

clean:
	rm -rf node_modules
	rm -rf yarn.lock
	rm -rf package-lock.json

fresh: clean dependencies
