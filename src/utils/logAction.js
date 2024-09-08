import { ApiError } from "./ApiError.js";
import AuditLog from "../models/auditlog.model.js";

export const logAction = async (action, performedBy, targetResource) => {
  const auditLog = await AuditLog.create({
    action,
    performedBy,
    targetResource,
  });

  if (!auditLog) {
    throw new ApiError(500, "An error occurred while logging the action");
  }

  return auditLog;
};
