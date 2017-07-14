

build:
	npm run build

watch:
	npm run watch

unit:
	npm run lint && npm run test

report:
	npm run nyc
	npm run report

coveralls:
	npm run nyc
	npm run coverage

update-snapshots:
	npm run update-snapshots
