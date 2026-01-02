// MongoDB initialization script
// This script creates a database user for the application
// It runs automatically when MongoDB container starts for the first time
// Place this file in: /docker-entrypoint-initdb.d/ (mounted as volume)

// Switch to the target database
db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE || 'qatar-project');

// Create application user (not root)
// This user has read/write access only to the application database
db.createUser({
  user: process.env.MONGO_APP_USERNAME || 'qatar-app',
  pwd: process.env.MONGO_APP_PASSWORD || 'changeme_app_password',
  roles: [
    {
      role: 'readWrite',
      db: process.env.MONGO_INITDB_DATABASE || 'qatar-project'
    }
  ]
});

print('Application user created successfully');
















