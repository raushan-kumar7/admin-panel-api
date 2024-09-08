import dotenv from 'dotenv';
import { Sequelize, Op } from 'sequelize';

dotenv.config();

const sequelize = new Sequelize(process.env.POSTGRESQL_URI, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully using Sequelize");

    // Sync models (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log("Models synchronized with the database.");
  } catch (error) {
    console.error("ERROR :: ", error);
    process.exit(1);
  }
};


export { sequelize, connectDB, Op };

