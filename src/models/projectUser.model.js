import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";

const ProjectUser = sequelize.define(
  "ProjectUser",
  {
    projectId: {
      type: DataTypes.UUID,
      references: {
        model: "projects",
        key: "id",
      },
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "project_users",
    paranoid: true,
    timestamps: false,
  }
);

export default ProjectUser;
