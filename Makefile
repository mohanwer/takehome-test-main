.PHONY: db-init
db-init:
	@echo "Checking if database $(db_name) exists..."
	@if [ -z "$$(psql -lqt | cut -d \| -f 1 | grep -w $(db_name))" ]; then \
		echo "Creating database $(db_name)..."; \
		createdb $(db_name); \
	else \
		echo "Database $(db_name) already exists."; \
	fi
	
	@echo "Checking if user $(db_name) exists..."
	@if [ -z "$$(psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$(db_user)'")" ]; then \
		echo "Creating user $(db_user)..."; \
		createuser $(db_user); \
	else \
		echo "User $(db_user) already exists."; \
	fi
	@psql -c "ALTER USER $(db_user) WITH PASSWORD '$(db_user)'";
	@echo "Granting privileges..."
	@psql -c "GRANT ALL PRIVILEGES ON DATABASE $(db_name) TO $(db_user)"
	@psql -d $(db_name) -c "GRANT ALL ON SCHEMA public TO $(db_user)"
	@echo "Database initialization complete."

.PHONY: db-table-create
db-table-create: 
	@echo "Dropping all tables from ${db_name} database..."
	@psql -d stw_takehome -c "DO \$$\$$ DECLARE \
		r RECORD; \
	BEGIN \
		FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP \
			EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE'; \
		END LOOP; \
	END \$$\$$;"
	@echo "Running initialization script..."
	@psql -d $(db_name) -f db-init-sql/docker-entrypoint-initdb.sql -U $(db_user)
	@echo "Database reset complete."

.PHONY: db-build
db-build:
	@$(MAKE) db-init db_name=stw_takehome db_user=stw_takehome
	@$(MAKE) db-table-create db_name=stw_takehome db_user=stw_takehome

.PHONY: test-db-build
test-db-build:
	@$(MAKE) db-init db_name=stw_takehome_test db_user=stw_takehome_test
	@$(MAKE) db-table-create db_name=stw_takehome_test db_user=stw_takehome_test

.PHONY: install-dependencies
install-dependencies:
	@echo "Checking if asdf is already installed..."
	@if ! command -v asdf >/dev/null; then \
		echo "Installing asdf via Homebrew..."; \
		brew install asdf; \
	else \
		echo "asdf is already installed"; \
	fi
	@asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git
	@asdf install nodejs 22.14.0
	@asdf set nodejs 22.14.0
	@asdf plugin add pnpm
	@asdf install pnpm 10.6.1
	@asdf set pnpm 10.6.1
	@echo "Checking if ~/.asdf/shims is in PATH..."
	@if ! echo "$$PATH" | grep -q "$$HOME/.asdf/shims"; then \
		echo "Adding ~/.asdf/shims to PATH in ~/.zshrc"; \
		echo 'export PATH="$$HOME/.asdf/shims:$$PATH"' >> ~/.zshrc; \
		echo "You'll need to restart your shell or run 'source ~/.zshrc' for the changes to take effect."; \
	else \
		echo "~/.asdf/shims is already in PATH"; \
	fi

.PHONY: build-node
build-node:
	@(cd backend && pnpm install)
	@(cd frontend && npm install)
