import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createProjectSchema } from "../validation/project.validation.js";
import Project from "../models/project.model.js";
import ProjectUser from "../models/projectUser.model.js";
import User from "../models/user.model.js";
import { logAction } from "../utils/logAction.js";

/**
 * @route POST /api/v1/project
 * @desc Create a new project
 * @access Only admin can create projects
 */
const createProject = async (req, res) => {
  const { error } = createProjectSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const { name, description, assignedTo } = req.body;

  // Create the project and store in Project model
  const project = await Project.create({
    name,
    description,
    createdBy: req.user.id,
  });

  if (!project) {
    throw new ApiError(500, "Failed to create project");
  }

  // Store project ID and assigned user IDs in ProjectUser model
  if (assignedTo && assignedTo.length > 0) {
    const projectUsers = assignedTo.map((userId) => ({
      projectId: project.id,
      userId: userId,
    }));

    await ProjectUser.bulkCreate(projectUsers); // Bulk create user-project assignments
  }

  // Fetch the project along with the createdBy user and the assigned users' data
  const projectWithUsers = await Project.findByPk(project.id, {
    include: [
      {
        model: User,
        as: "creator", // Use the alias "creator" for createdBy
        attributes: ["id", "username", "email"],
      },
      {
        model: User,
        as: "assignedUsers", // Use the alias for assigned users
        through: { attributes: [] }, // Exclude the join table attributes
        attributes: ["id", "username", "email", "role"],
      },
    ],
  });

  if (!projectWithUsers) {
    throw new ApiError(404, "Project with users not found");
  }

  await logAction("CREATE_PROJECT", req.user.id, project.id);

  return res
    .status(201)
    .json(new ApiResponse(201, projectWithUsers, "Project created successfully"));
};


/**
 * @route GET /api/v1/project
 * @desc Get all projects
 * @access All users based on the user roles
 */
const getAllProjects = async (req, res) => {
  const projects = await Project.findAll();
  if (!projects) {
    throw new ApiError(404, "No projects found");
  }

  await logAction(
    "FETCH_ALL_PROJECTS",
    req.user.id,
    projects[0].id,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Projects retrieved successfully"));
};

/**
 * @route GET /api/v1/project/:projectId
 * @desc Get project by ID
 * @access All users based on the user roles
 */
const getProjectById = async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findByPk(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  await logAction("FETCH_PROJECT_BY_ID", req.user.id, project.id);

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project retrieved successfully"));
};

/**
 * @route PUT /api/v1/project/:projectId
 * @desc Update project details
 * @access Only admin can update project details
 */
const updateProjectDetails = async (req, res) => {
  const { projectId } = req.params;
  const { name, description, assignedTo } = req.body;

  const project = await Project.findByPk(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  project.name = name || project.name;
  project.description = description || project.description;

  await project.save();

  // Update assigned users in the ProjectUser model
  if (assignedTo && assignedTo.length > 0) {
    // Remove existing assignments
    await ProjectUser.destroy({ where: { projectId: project.id } });

    // Create new assignments
    const projectUsers = assignedTo.map((userId) => ({
      projectId: project.id,
      userId: userId,
    }));

    await ProjectUser.bulkCreate(projectUsers);
  }

  await logAction("UPDATE_PROJECT_DETAILS", req.user.id, project.id);

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project updated successfully"));
};

/**
 * @route DELETE /api/v1/project/:projectId
 * @desc Soft delete project
 * @access Only admin can delete project
 */
const softDeleteProject = async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findByPk(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  await project.destroy();

  await logAction("SOFT_DELETE_PROJECT", req.user.id, project.id);

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project soft deleted successfully"));
};


/**
 * @route DELETE /api/v1/project/permanent/:projectId
 * @desc Permanently delete a project
 * @access Only admin can permanently delete a project
 */
const permanentDeleteProject = async (req, res) => {
  const { projectId } = req.params;

  // Find the project including soft-deleted ones
  const project = await Project.findByPk(projectId, { paranoid: false });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Permanently delete the project by forcing the deletion
  await project.destroy({ force: true });

  await logAction("PERMANENT_DELETE_PROJECT", req.user.id, project.id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Project permanently deleted successfully"));
};


/**
 * @route PATCH /api/v1/project/restore/:projectId
 * @desc Restore a soft-deleted project
 * @access Only admin can restore a project
 */
const restoreProject = async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findByPk(projectId, { paranoid: false });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  await project.restore();

  await logAction("RESTORE_PROJECT", req.user.id, project.id);

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project restored successfully"));
};


export {
  createProject,
  getAllProjects,
  getProjectById,
  updateProjectDetails,
  softDeleteProject,
  permanentDeleteProject,
  restoreProject,
};
