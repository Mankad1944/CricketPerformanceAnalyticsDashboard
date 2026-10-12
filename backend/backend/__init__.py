import importlib

try:
    pymysql = importlib.import_module("pymysql")
    pymysql.install_as_MySQLdb()
except ImportError:
    pass
