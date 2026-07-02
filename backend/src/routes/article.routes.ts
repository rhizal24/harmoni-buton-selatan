import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  create,
  getMine,
  getPublicBySlug,
  listMine,
  listPublic,
  remove,
  update,
} from "../controllers/article.controller";

// Public, per-village read access: /api/villages/:village/articles
export const publicArticleRouter = Router();
publicArticleRouter.get("/:village/articles", listPublic);
publicArticleRouter.get("/:village/articles/:slug", getPublicBySlug);

// Admin CRUD, scoped to the authenticated admin's own village: /api/admin/articles
export const adminArticleRouter = Router();
adminArticleRouter.use(requireAuth);
adminArticleRouter.get("/", listMine);
adminArticleRouter.post("/", create);
adminArticleRouter.get("/:id", getMine);
adminArticleRouter.put("/:id", update);
adminArticleRouter.delete("/:id", remove);
