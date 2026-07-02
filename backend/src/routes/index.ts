import { Router } from "express";
import authRouter from "./auth.routes";
import { adminArticleRouter, publicArticleRouter } from "./article.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/villages", publicArticleRouter);
router.use("/admin/articles", adminArticleRouter);

export default router;
