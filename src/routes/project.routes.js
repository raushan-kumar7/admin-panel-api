import { Router } from "express";
import {
  createProject,
  getAllProjects,
  getProjectById,
  permanentDeleteProject,
  restoreProject,
  softDeleteProject,
  updateProjectDetails,
} from "../controllers/project.controller.js";
import { verifyJWT, verifyUserRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getAllProjects);
router.route("/:projectId").get(getProjectById);


router.route("/").post(verifyUserRole(["Admin"]), createProject);

router
  .route("/:projectId")
  .put(verifyUserRole(["Admin"]), updateProjectDetails)
  .delete(verifyUserRole(["Admin"]), softDeleteProject);

router
  .route("/permanent/:projectId")
  .delete(verifyUserRole(["Admin"]), permanentDeleteProject);
router
  .route("/restore/:projectId")
  .patch(verifyUserRole(["Admin"]), restoreProject);

export default router;
