import { Router } from "express";
import { getAllAuditLogs } from "../controllers/audit.logs.controller.js";
import { verifyJWT, verifyUserRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(verifyUserRole(["Admin"]), getAllAuditLogs);

export default router;
