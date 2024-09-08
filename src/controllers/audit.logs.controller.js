import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import AuditLog from "../models/auditlog.model.js";

/**
 * @route GET /api/v1/audit-logs
 * @desc Get all audit logs
 * @access Only admin can access this route
 */
const getAllAuditLogs = async (req, res) => {
  const auditLogs = await AuditLog.findAll({
    order: [["performedAt", "DESC"]],
  });

  if (!auditLogs) {
    throw new ApiError(404, "No audit logs found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, auditLogs, "Audit logs retrieved successfully"));
};

export { getAllAuditLogs };
