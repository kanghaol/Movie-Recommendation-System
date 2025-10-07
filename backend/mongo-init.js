// MongoDB init script: create user and database
// This script runs on container first startup when mounted to /docker-entrypoint-initdb.d/

db = db.getSiblingDB(process.env.MONGO_DB || 'mydatabase');
db.createUser({
  user: process.env.MONGO_USER || 'default_user',
  pwd: process.env.MONGO_PASSWORD || 'default_password',
  roles: [{ role: 'readWrite', db: process.env.MONGO_DB || 'mydatabase' }]
});
