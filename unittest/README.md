# devt - Python Unit Testing Framework

[![PyPI version](https://badge.fury.io/py/devt.svg)](https://badge.fury.io/py/devt)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)

Python unit testing framework with enhanced testing utilities and environment validation.

## Installation

```bash
pip install devt
```

## Features

- **Conditional Test Execution** - Use `@unittest.skipIf(*isTest())` to control which tests run based on environment variables
- **Environment-Based Test Control** - Enable/disable test suites using environment flags
- **Fine-Grained Test Management** - Separate unit tests, integration tests, and functional tests
- **Simple API** - Clean, minimal interface with tuple unpacking support
- **Python 3.9+ Support** - Modern Python compatibility

## Usage

### Conditional Test Execution with unittest

The primary use case is to conditionally skip or run unittest test cases based on environment variables:

```python
import unittest
from devt import isTest

@unittest.skipIf(*isTest('TEST_FUNC'))
class Test(unittest.TestCase):
    def test_foo(self):
        # This test will only run when TEST_FUNC environment variable is set to '1'
        pass
    
    def test_bar(self):
        # This test will only run when TEST_FUNC environment variable is set to '1'
        pass

@unittest.skipIf(*isTest('TEST_INTEGRATION'))
class IntegrationTest(unittest.TestCase):
    def test_database_connection(self):
        # This test will only run when TEST_INTEGRATION is set to '1'
        pass

# Regular test class (always runs)
class AlwaysRunTest(unittest.TestCase):
    def test_basic_functionality(self):
        # This test always runs regardless of environment variables
        pass
```

### Running Tests with Environment Control

```bash
# Run all tests including those marked with TEST_FUNC
TEST_FUNC=1 python -m unittest

# Run all tests including integration tests
TEST_INTEGRATION=1 python -m unittest

# Run both functional and integration tests
TEST_FUNC=1 TEST_INTEGRATION=1 python -m unittest

# Run only basic tests (no environment variables set)
python -m unittest
```

### Environment Variable Validation

```python
import devt

# Check if environment variable is properly set for testing
is_valid, message = devt.isTest('TEST_MODE')

if is_valid:
    print("Environment is ready for testing")
else:
    print(f"Environment issue: {message}")
```

### Example Use Cases

```python
import devt

# Validate database connection environment
db_ready, db_msg = devt.isTest('DATABASE_URL')

# Validate API key environment
api_ready, api_msg = devt.isTest('API_KEY')

# Validate debug mode environment
debug_ready, debug_msg = devt.isTest('DEBUG_MODE')
```

## API Reference

### `devt.isTest(variable_name)`

Validates if an environment variable is properly configured for testing.

**Parameters:**
- `variable_name` (str): Name of the environment variable to check

**Returns:**
- `tuple`: (bool, str) - (is_valid, error_message)
  - `is_valid`: `True` if environment variable is NOT set to '1', `False` otherwise
  - `error_message`: Descriptive message if validation fails

**Behavior:**
- When environment variable is NOT set or set to any value other than '1': Returns `(True, "environment is not defined: {variable_name}")`
- When environment variable is set to '1': Returns `(False, "environment is not defined: {variable_name}")`

**Usage with unittest.skipIf:**
The tuple unpacking (`*isTest()`) works perfectly with `@unittest.skipIf` decorator:
- When variable is NOT set to '1': `skipIf(True, message)` → Test is **skipped**
- When variable is set to '1': `skipIf(False, message)` → Test **runs**

This design allows tests to run only when explicitly enabled via environment variables, providing fine-grained control over test execution.

## Development

### Requirements

- Python 3.9 or higher
- Poetry (for development)

### Setup

```bash
# Clone and enter directory
cd unittest/

# Install dependencies
poetry install

# Activate virtual environment
poetry shell
```

### Building

```bash
# Build package
poetry build

# Publish to PyPI (maintainers only)
poetry publish
```

## License

MIT

## Version

Current version: **0.1.1**

## Links

- [PyPI Package](https://pypi.org/project/devt/)
- [Source Code](https://github.com/infodb/devt)