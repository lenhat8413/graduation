import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { uploadInvitationAssets } from "../middleware/upload.js";
import {
  createInvitation,
  deleteInvitation,
  listInvitations,
  updateInvitation
} from "../controllers/invitationController.js";
import { listWishes } from "../controllers/wishController.js";

const router = Router();

router.use(requireAuth);
router.get("/cards", listInvitations);
router.get("/wishes", listWishes);
router.post("/cards", uploadInvitationAssets, createInvitation);
router.put("/cards/:id", uploadInvitationAssets, updateInvitation);
router.delete("/cards/:id", deleteInvitation);

export default router;
