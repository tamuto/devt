import os
__version__ = '0.1.1'


def isTest(val):
    return (
        os.environ.get(val, '0') != '1',
        f'environment is not defined: {val}'
    )
