
# Build the src code to lib folder for publishing to npm.
build:
	npm run build

# Watch changes and run build.
build-watch:
	npm run build-watch

# Test on the saucelabs cloud.
browser:
	TEST_ENV=browser ./node_modules/.bin/karma start karma.conf.js

# Test on local browsers.
local-browser:
	./node_modules/.bin/karma start karma.conf.js

# Watch changes and run test.
watch:
	npm run watch

# Lint code and run unit test.
unit:
	npm run lint && npm run test

# Run test and show coverage reports.
report:
	npm run nyc
	npm run report

watch-report:
	npm run watch-report

# Run test and report coverage reports to coveralls.
coveralls:
	npm run nyc
	npm run coverage
