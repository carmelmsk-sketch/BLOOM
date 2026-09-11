import Router, { type IRouter } from "express";
import {
  requireAuth,
  supabaseTable,
  sendSupabaseError,
} from "../lib/supabase";

const router: IRouter = Router();

function getRows(data: unknown): unknown[] {
  return Array.isArray(data) ? data : [];
}

function getBody(body: unknown): Record<string, unknown> {
  if (typeof body === "object" && body !== null) {
    return body as Record<string, unknown>;
  }

  return {};
}

router.get("/ideas", async (req, res) => {
  const context = await requireAuth(req, res);
  if (!context) return;

  const result = await supabaseTable<unknown[]>(
    "ideas",
    `?user_id=eq.${encodeURIComponent(context.user.id)}&order=created_at.desc`,
    {
      method: "GET",
    },
    context.accessToken,
  );

  if (!result.ok) {
    sendSupabaseError(res, result);
    return;
  }

  res.json({
    ideas: getRows(result.data),
  });
});

router.post("/ideas", async (req, res) => {
  const context = await requireAuth(req, res);
  if (!context) return;

  const body = getBody(req.body);

  if (typeof body.title !== "string" || !body.title.trim()) {
    res.status(400).json({
      code: "INVALID_IDEA",
      message: "Le titre de l'idée est requis.",
    });
    return;
  }

  const result = await supabaseTable<unknown[]>(
    "ideas",
    "",
    {
      method: "POST",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        user_id: context.user.id,
        title: body.title.trim(),
        description:
          typeof body.description === "string"
            ? body.description.trim()
            : "",
        problem:
          typeof body.problem === "string"
            ? body.problem.trim()
            : "",
        audience:
          typeof body.audience === "string"
            ? body.audience.trim()
            : "",
        solution:
          typeof body.solution === "string"
            ? body.solution.trim()
            : "",
        notes:
          typeof body.notes === "string"
            ? body.notes.trim()
            : "",
        status: "idea",
      }),
    },
    context.accessToken,
  );

  if (!result.ok) {
    sendSupabaseError(res, result);
    return;
  }

  res.status(201).json({
    idea: getRows(result.data)[0] ?? null,
  });
});

export default router;
