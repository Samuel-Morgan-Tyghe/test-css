import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { STAGE_DEFINITIONS } from "@/types";

function stageData() {
  return STAGE_DEFINITIONS.map((def, i) => ({
    name: def.name,
    status: i === 0 ? "ACTIVE" : "LOCKED",
    order: i,
    content: "",
  }));
}

// POST /api/seed — create default workspace with sample specs
export async function POST() {
  const existing = await prisma.workspace.findFirst({ where: { name: "Default" } });
  if (existing) {
    return NextResponse.json(existing);
  }

  const workspace = await prisma.workspace.create({ data: { name: "Default" } });
  const wid = workspace.id;

  const page = await prisma.spec.create({
    data: { label: "Home Page", type: "PAGE", workspaceId: wid, order: 0, stages: { create: stageData() } },
  });

  const feature = await prisma.spec.create({
    data: { label: "Data Table", type: "FEATURE", parentId: page.id, workspaceId: wid, order: 0, stages: { create: stageData() } },
  });

  await prisma.spec.create({
    data: { label: "Column Sorting", type: "SUB_FEATURE", parentId: feature.id, workspaceId: wid, order: 0, stages: { create: stageData() } },
  });

  await prisma.spec.create({
    data: { label: "Row Filtering", type: "SUB_FEATURE", parentId: feature.id, workspaceId: wid, order: 1, stages: { create: stageData() } },
  });

  return NextResponse.json(workspace, { status: 201 });
}
