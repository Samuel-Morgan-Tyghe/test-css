import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SplitSpecSchema, STAGE_DEFINITIONS } from "@/types";

// POST /api/specs/:id/split — create sibling from current spec
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = SplitSpecSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { label, excerptContent } = parsed.data;

  const sourceSpec = await prisma.spec.findUnique({ where: { id } });
  if (!sourceSpec) {
    return NextResponse.json({ error: "Spec not found" }, { status: 404 });
  }

  const childType = sourceSpec.type === "PAGE" ? "FEATURE" : "SUB_FEATURE";

  const maxOrder = await prisma.spec.aggregate({
    where: { parentId: sourceSpec.parentId, workspaceId: sourceSpec.workspaceId },
    _max: { order: true },
  });

  const newSpec = await prisma.spec.create({
    data: {
      label,
      type: childType,
      parentId: sourceSpec.parentId,
      workspaceId: sourceSpec.workspaceId,
      order: (maxOrder._max.order ?? -1) + 1,
      stages: {
        create: STAGE_DEFINITIONS.map((def, i) => ({
          name: def.name,
          status: i === 0 ? "ACTIVE" : "LOCKED",
          order: i,
          content: i === 0 && excerptContent ? excerptContent : "",
        })),
      },
    },
    include: { stages: { orderBy: { order: "asc" } }, children: true },
  });

  return NextResponse.json(newSpec, { status: 201 });
}
