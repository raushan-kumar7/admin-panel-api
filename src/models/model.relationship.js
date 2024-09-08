import Project from "./project.model.js";
import ProjectUser from "./projectUser.model.js";
import User from "./user.model.js";
import AuditLog from "./auditlog.model.js";

// Define relationships
Project.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
User.hasMany(Project, { foreignKey: "createdBy", as: "createdProjects" });

Project.belongsToMany(User, {
  through: ProjectUser,
  as: "assignedUsers", // Alias for many-to-many relationship
  foreignKey: "projectId",
});

User.belongsToMany(Project, {
  through: ProjectUser,
  as: "userProjects", // Alias for many-to-many relationship
  foreignKey: "userId",
});

AuditLog.belongsTo(User, { foreignKey: "performedBy" });
User.hasMany(AuditLog, { foreignKey: "performedBy" });

export { User, Project, AuditLog, ProjectUser };


