.PHONY: venv install run dev clean format lint

PYTHON = python3
VENV_DIR = .venv
BIN_DIR = $(VENV_DIR)/bin

venv:
	$(PYTHON) -m venv $(VENV_DIR)

install: venv
	$(BIN_DIR)/pip install --upgrade pip
	$(BIN_DIR)/pip install -r requirements.txt

run:
	$(BIN_DIR)/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

clean:
	rm -rf $(VENV_DIR)
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -exec rm -f {} +

format:
	$(BIN_DIR)/black app
	$(BIN_DIR)/isort app

lint:
	$(BIN_DIR)/flake8 app
