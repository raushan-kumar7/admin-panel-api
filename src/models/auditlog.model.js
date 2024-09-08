import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";

const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    performedBy: {
      type: DataTypes.UUID,
      references: {
        model: "users",
        key: "id",
      },
      allowNull: false,
    },
    performedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    targetResource: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "audit_logs",
    paranoid: true,
    timestamps: true,
  }
);

export default AuditLog;
