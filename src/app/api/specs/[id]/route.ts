import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/specs/:id — full spec with stages and children (recursive)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const spec = await prisma.spec.findUnique({
    where: { id },
    include: {
      stages: { orderBy: { order: "asc" } },
      children: {
        include: { stages: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!spec) {
    return NextResponse.json({ error: "Spec not found" }, { status: 404 });
  }

  return NextResponse.json(spec);
}

// PATCH /api/specs/:id — rename
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { label } = await req.json();

  const spec = await prisma.spec.update({
    where: { id },
    data: { label },
    include: { stages: { orderBy: { order: "asc" } }, children: true },
  });

  return NextResponse.json(spec);
}

// DELETE /api/specs/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Cascade delete handled by Prisma schema
  await prisma.spec.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
