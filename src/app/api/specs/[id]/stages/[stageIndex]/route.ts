import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UpdateStageSchema, STAGE_DEFINITIONS } from "@/types";

// PATCH /api/specs/:id/stages/:stageIndex — update stage content or status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; stageIndex: string }> },
) {
  const { id, stageIndex: stageIndexStr } = await params;
  const stageIndex = parseInt(stageIndexStr, 10);

  if (isNaN(stageIndex) || stageIndex < 0 || stageIndex >= STAGE_DEFINITIONS.length) {
    return NextResponse.json({ error: "Invalid stage index" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = UpdateStageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { content, action } = parsed.data;
  const stageName = STAGE_DEFINITIONS[stageIndex].name;

  // Fetch the spec with all stages
  const spec = await prisma.spec.findUnique({
    where: { id },
    include: { stages: { orderBy: { order: "asc" } } },
  });

  if (!spec) {
    return NextResponse.json({ error: "Spec not found" }, { status: 404 });
  }

  const stage = spec.stages[stageIndex];
  if (!stage) {
    return NextResponse.json({ error: "Stage not found" }, { status: 404 });
  }

  // Save content
  if (content !== undefined) {
    await prisma.stage.update({
      where: { id: stage.id },
      data: { content },
    });
  }

  // Complete stage
  if (action === "complete") {
    if (stage.status !== "ACTIVE") {
      return NextResponse.json({ error: "Stage is not active" }, { status: 400 });
    }

    // Check previous stages are all completed
    for (let i = 0; i < stageIndex; i++) {
      if (spec.stages[i].status !== "COMPLETED") {
        return NextResponse.json({ error: "Previous stages not complete" }, { status: 400 });
      }
    }

    await prisma.stage.update({
      where: { id: stage.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    // Unlock next stage
    if (stageIndex + 1 < spec.stages.length) {
      const nextStage = spec.stages[stageIndex + 1];
      if (nextStage.status === "LOCKED") {
        await prisma.stage.update({
          where: { id: nextStage.id },
          data: { status: "ACTIVE" },
        });
      }
    }
  }

  // Reopen stage — re-lock all downstream
  if (action === "reopen") {
    if (stage.status !== "COMPLETED") {
      return NextResponse.json({ error: "Stage is not completed" }, { status: 400 });
    }

    await prisma.stage.update({
      where: { id: stage.id },
      data: { status: "ACTIVE", completedAt: null, completedBy: null },
    });

    // Re-lock all downstream stages
    for (let i = stageIndex + 1; i < spec.stages.length; i++) {
      await prisma.stage.update({
        where: { id: spec.stages[i].id },
        data: { status: "LOCKED", completedAt: null, completedBy: null },
      });
    }

    // Clear PR action
    await prisma.spec.update({
      where: { id },
      data: { prAction: null, prComment: "" },
    });
  }

  // Return updated spec
  const updatedSpec = await prisma.spec.findUnique({
    where: { id },
    include: {
      stages: { orderBy: { order: "asc" } },
      children: { include: { stages: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } },
    },
  });

  return NextResponse.json(updatedSpec);
}
