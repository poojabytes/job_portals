const { Sequelize, DataTypes } = require("sequelize");

const {
  DB_HOST,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  POOL_MAX,
  POOL_MIN,
  POOL_ACQUIRE,
  POOL_IDLE,
} = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  logging: false,
  dialect: "mysql",
  operatorsAliases: false,
  pool: {
    max: parseInt(POOL_MAX) || 5,
    min: parseInt(POOL_MIN) || 0,
    acquire: POOL_ACQUIRE || 30000,
    idle: POOL_IDLE || 10000,
  },
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// ----------------------Tables----------------------------
db.User = require("../models/user.model")(sequelize, DataTypes);
db.Agency = require("../models/agency.model")(sequelize, DataTypes);
db.OTP = require("../models/otp.model")(sequelize, DataTypes);

// -----------------------------------------Associations---------------------------------------------

// User ↔ Agency
db.User.belongsTo(db.Agency, {
  foreignKey: "agencyId",
  as: "agency",
});

db.Agency.hasMany(db.User, {
  foreignKey: "agencyId",
  as: "jobSeekers",
});

// ----------------------------------------End of Associations--------------------------------------

// Sync Models
(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database & tables synced successfully.");
  } catch (error) {
    console.error("Sequelize sync error:", error);
  }
})();

module.exports = { sequelize, db };


