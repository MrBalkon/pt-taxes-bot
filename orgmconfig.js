module.exports = {
	type: process.env.DB_CONNECTION,
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	username: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
	logging: true,
	entities: ['src/entities/**/*.ts'],
	migrations: ['src/migrations/**/*.ts'],
	subscribers: ['src/subscriber/**/*.ts'],
	cli: {
	  entitiesDir: 'src/entity',
	  migrationsDir: '/src/migration',
	  subscribersDir: 'src/subscriber',
	},
  };