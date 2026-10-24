// Committee tasks (admin → Dashboard). Anyone with the Dashboard section can
// see every task; they can change tasks in their own departments, and the
// Executive and super admins can change any.
//   GET                     { tasks, leaders, myDepts, exec }
//   GET ?format=csv         every task as a spreadsheet
//   POST { action: "create", task }
//   POST { action: "update", id, changes }
//   POST { action: "delete", id }
//   POST { action: "leaders", dept, names }   (Executive)
//   POST { action: "import" }                 copy new tasks from the sheet (Executive)
import { can, refuse } from "@/lib/admin_auth";
import { logAction } from "@/lib/audit";
import {
  dashboardData, listTasks, createTask, updateTask, deleteTask, findTask, setLeaders, importFromSheet,
  canEdit, isExec, tasksCsv, myDepartments, STATUSES,
} from "@/lib/tasks";

export const dynamic = "force-dynamic";

const label = Object.fromEntries(STATUSES.map((s) => [s.id, s.label]));
const bad = (error, status = 400) => Response.json({ error }, { status });

export async function GET(request) {
  const admin = await can("dashboard");
  if (!admin) return refuse();
  if (new URL(request.url).searchParams.get("format") === "csv") {
    const tasks = (await listTasks()).sort((a, b) => a.dept.localeCompare(b.dept) || a.id.localeCompare(b.id));
    const date = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
    return new Response("﻿" + tasksCsv(tasks), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="kings-union-tasks-${date}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }
  const { tasks, leaders, myDepts } = await dashboardData(admin);
  return Response.json({ tasks, leaders, myDepts, exec: isExec(admin) }, { headers: { "Cache-Control": "no-store" } });
}

// What changed, in words, for the Activity log.
function describe(before, after) {
  const bits = [];
  if (before.status !== after.status) bits.push(`progress to “${label[after.status]}”`);
  if (before.owner !== after.owner) bits.push(after.owner ? `owner to ${after.owner}` : "owner removed");
  if (before.supervisor !== after.supervisor) bits.push(after.supervisor ? `supervisor to ${after.supervisor}` : "supervisor removed");
  if (before.deadline !== after.deadline || before.time !== after.time) bits.push(after.deadline ? `deadline to ${after.deadline}${after.time ? " " + after.time : ""}` : "deadline removed");
  if (before.dept !== after.dept) bits.push(`moved to ${after.dept}`);
  if (before.title !== after.title) bits.push("description");
  if (before.notes !== after.notes || before.link !== after.link || before.unit !== after.unit) bits.push("details");
  return bits.join(", ");
}

export async function POST(request) {
  const admin = await can("dashboard");
  if (!admin) return refuse();
  const body = await request.json().catch(() => ({}));
  const { action } = body;

  try {
    if (action === "leaders" || action === "import") {
      if (!isExec(admin)) return bad("Only the Executive can do that.", 403);
      if (action === "leaders") {
        const names = await setLeaders(body.dept, body.names);
        await logAction(admin, `Set the task owners for ${body.dept}: ${names.join(", ") || "none"}`);
        return Response.json({ names });
      }
      const added = await importFromSheet();
      await logAction(admin, `Copied ${added} new task${added === 1 ? "" : "s"} from the dashboard sheet`);
      return Response.json({ added });
    }

    const myDepts = await myDepartments(admin);

    if (action === "create") {
      const dept = body.task?.dept;
      if (!canEdit(admin, myDepts, dept)) return bad("You can only add tasks to your own department.", 403);
      const task = await createTask(body.task || {}, admin);
      await logAction(admin, `Added task ${task.id} (${task.dept}): ${task.title.slice(0, 120)}`);
      return Response.json({ task });
    }

    if (action === "update" || action === "delete") {
      const current = await findTask(body.id);
      if (!current) return bad("That task has been deleted. Refresh the page.", 404);
      if (!canEdit(admin, myDepts, current.dept)) return bad("You can only change tasks in your own department.", 403);
      if (action === "delete") {
        await deleteTask(current.id);
        await logAction(admin, `Deleted task ${current.id} (${current.dept}): ${current.title.slice(0, 120)}`);
        return Response.json({ ok: true });
      }
      const changes = body.changes || {};
      if (changes.dept && changes.dept !== current.dept && !canEdit(admin, myDepts, changes.dept))
        return bad("You can only move tasks into your own department.", 403);
      const { before, task } = await updateTask(current.id, changes, admin);
      const what = describe(before, task);
      if (what) await logAction(admin, `Changed task ${task.id}: ${what}`);
      return Response.json({ task });
    }
  } catch (err) {
    return bad(err?.message || "That couldn’t be saved.");
  }
  return bad("Unknown action.");
}
