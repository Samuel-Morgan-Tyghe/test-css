import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PRActionSchema } from "@/types";

// POST /api/specs/:id/pr-action — approve or request changes
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = PRActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { action, comment } = parsed.data;

  const spec = await prisma.spec.findUnique({
    where: { id },
    include: { stages: { orderBy: { order: "asc" } } },
  });

  if (!spec) {
    return NextResponse.json({ error: "Spec not found" }, { status: 404 });
  }

  if (action === "CHANGES_REQUESTED") {
    // Return to DEV_SPEC (index 3)
    for (let i = 3; i < spec.stages.length; i++) {
      await prisma.stage.update({
        where: { id: spec.stages[i].id },
        data: {
          status: i === 3 ? "ACTIVE" : "LOCKED",
          completedAt: null,
          completedBy: null,
        },
      });
    }

    await prisma.spec.update({
      where: { id },
      data: { prAction: action, prComment: comment ?? "" },
    });
  } else {
    // Approved
    await prisma.spec.update({
      where: { id },
      data: { prAction: action, prComment: "" },
    });
  }

  const updatedSpec = await prisma.spec.findUnique({
    where: { id },
    include: {
      stages: { orderBy: { order: "asc" } },
      children: { include: { stages: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } },
    },
  });

  return NextResponse.json(updatedSpec);
}
