import { Router } from "express"
import { createUser, getUsers } from "../controllers/user.controller"
import { authenticate } from "../middleware/auth.middleware"
import { rbac } from "../middleware/rbac"

const router = Router()


router.post(
  "/user",

  createUser
)

router.get(
  "/user",

  getUsers
)

export default router
