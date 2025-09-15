PYTHONPATH=$(shell pwd)/python/src:$(shell pwd)/python

.EXPORT_ALL_VARIABLES:

# Database commands

db-start:
	docker run -d -it --rm --name database -e POSTGRES_PASSWORD=postgres -p 127.0.0.1:5432:5432/tcp postgres

db-stop:
	docker stop database

db-migrate:
	docker cp ./database/schema.sql database:./schema.sql
	docker exec database psql -h localhost -U postgres -d postgres -f schema.sql

db-seed:
	docker cp ./database/majors.csv database:./majors.csv
	docker cp ./database/students.csv database:./students.csv
	docker cp ./database/enrollments.csv database:./enrollments.csv
	docker cp ./database/seeder.sql database:./seeder.sql
	docker exec database psql -h localhost -U postgres -d postgres -f seeder.sql

# TypeScript Commands

typescript-setup:
	yarn --cwd ./typescript_
	yarn --cwd ./typescript_ build

typescript-test:
	yarn --cwd ./typescript_ unit.tests

typescript-dev:
	yarn --cwd ./typescript_ dev

typescript-lint:
	yarn --cwd ./typescript_ lint

# Python Commands

python-run-tests:
	pytest -v python/test/test_*.py

python-start-server:
	flask --app python/src/app.py run