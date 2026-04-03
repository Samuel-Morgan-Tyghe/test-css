import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CreateSpecSchema, STAGE_DEFINITIONS } from "@/types";

// GET /api/specs — fetch full tree for a workspace
export async function GET(req: NextRequest) {
  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  const specs = await prisma.spec.findMany({
    where: { workspaceId },
    include: { stages: { orderBy: { order: "asc" } }, children: { include: { stages: { orderBy: { order: "asc" } } } } },
    orderBy: { order: "asc" },
  });

  // Build tree: return only root specs with nested children
  const rootSpecs = specs.filter((s) => !s.parentId);
  return NextResponse.json(rootSpecs);
}

// POST /api/specs — create a new spec
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateSpecSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { label, type, parentId, workspaceId } = parsed.data;

  // Get next order value
  const maxOrder = await prisma.spec.aggregate({
    where: { parentId: parentId ?? null, workspaceId },
    _max: { order: true },
  });

  const spec = await prisma.spec.create({
    data: {
      label,
      type,
      parentId: parentId ?? null,
      workspaceId,
      order: (maxOrder._max.order ?? -1) + 1,
      stages: {
        create: STAGE_DEFINITIONS.map((def, i) => ({
          name: def.name,
          status: i === 0 ? "ACTIVE" : "LOCKED",
          order: i,
          content: "",
        })),
      },
    },
    include: { stages: { orderBy: { order: "asc" } }, children: true },
  });

  return NextResponse.json(spec, { status: 201 });
}
