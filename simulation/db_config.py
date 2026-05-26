import os


def connection_config():
    required = ('SIMRS_DB_USER', 'SIMRS_DB_PASSWORD', 'SIMRS_DB_NAME')
    missing = [name for name in required if not os.getenv(name)]
    if missing:
        raise RuntimeError(f"Set environment variable: {', '.join(missing)}")

    return {
        'host': os.getenv('SIMRS_DB_HOST', 'localhost'),
        'user': os.environ['SIMRS_DB_USER'],
        'password': os.environ['SIMRS_DB_PASSWORD'],
        'database': os.environ['SIMRS_DB_NAME'],
    }


def auth_keys():
    required = ('SIMRS_ADMIN_USERNAME_KEY', 'SIMRS_ADMIN_PASSWORD_KEY')
    missing = [name for name in required if not os.getenv(name)]
    if missing:
        raise RuntimeError(f"Set environment variable: {', '.join(missing)}")
    return os.environ['SIMRS_ADMIN_USERNAME_KEY'], os.environ['SIMRS_ADMIN_PASSWORD_KEY']
