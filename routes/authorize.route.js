import { Router } from "express";
import * as controller from "../controllers/authorize.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
  createAuthorizeSchema,
  updateAuthorizeSchema,
} from "../validators/authorize.schema.js";

const router = Router();

router.get("/", auth, authorize("ADMIN"), controller.findAndPaginate);
router.get("/all", auth, authorize("ADMIN"), controller.getAll);
router.get("/:id", auth, authorize("ADMIN"), controller.getById);
router.get("/role/:roleId", auth, authorize("ADMIN"), controller.getByRoleId);

router.post(
  "/",
  auth,
  authorize("ADMIN"),
  validate(createAuthorizeSchema),
  controller.create,
);

router.put(
  "/:id",
  auth,
  authorize("ADMIN"),
  validate(updateAuthorizeSchema),
  controller.update,
);

router.delete("/:id", auth, authorize("ADMIN"), controller.remove);

export default router;
