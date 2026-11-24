const { Model } = require("sequelize");

class User extends Model {}

module.exports = (sequelize, DataTypes) => {
  User.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gender: {
        type: DataTypes.ENUM("male", "female", "other"),
        allowNull: false,
      },
      userType: {
        type: DataTypes.ENUM("Job Seeker", "Agency"),
        allowNull: false,
      },
      hobbies: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      profileImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resume: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      agencyId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "agencies",
          key: "uuid",
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isPasswordSet: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "accepted", "declined"),
        defaultValue: "pending",
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
    }
  );

  return User;
};


