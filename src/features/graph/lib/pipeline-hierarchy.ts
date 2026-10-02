import type { PipelineTask } from "../types/pipeline";

export interface PipelineHierarchyNode {
  task: PipelineTask;
  children: PipelineHierarchyNode[];
  depth: number;
}

export interface PipelineHierarchy {
  roots: PipelineHierarchyNode[];
  orphans: PipelineHierarchyNode[];
  unresolved: PipelineTask[];
  taskMap: Map<string, PipelineTask>;
  childrenMap: Map<string, PipelineTask[]>;
}

export function buildPipelineHierarchy(tasks: PipelineTask[]): PipelineHierarchy {
  const taskMap = new Map<string, PipelineTask>();
  const childrenMap = new Map<string, PipelineTask[]>();

  for (const task of tasks) {
    taskMap.set(task.id, task);
  }

  const unresolved: PipelineTask[] = [];

  for (const task of tasks) {
    const parentId = task.parent?.taskId;

    if (parentId && !taskMap.has(parentId)) {
      unresolved.push(task);
      continue;
    }

    if (parentId) {
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId)!.push(task);
    }
  }

  const visited = new Set<string>();
  const visiting = new Set<string>();

  function hasCycle(taskId: string): boolean {
    if (visiting.has(taskId)) return true;
    if (visited.has(taskId)) return false;

    visiting.add(taskId);

    const children = childrenMap.get(taskId) || [];
    for (const child of children) {
      if (hasCycle(child.id)) {
        return true;
      }
    }

    visiting.delete(taskId);
    visited.add(taskId);
    return false;
  }

  const roots: PipelineHierarchyNode[] = [];
  const orphans: PipelineHierarchyNode[] = [];

  function buildNode(task: PipelineTask, depth: number): PipelineHierarchyNode {
    const children = childrenMap.get(task.id) || [];
    const validChildren = children.filter(c => !hasCycle(c.id));

    const childNodes = validChildren.map(c => buildNode(c, depth + 1));
    return {
      task,
      children: childNodes,
      depth
    };
  }

  for (const task of tasks) {
    const parentId = task.parent?.taskId;

    if (!parentId || !taskMap.has(parentId)) {
      if (!hasCycle(task.id)) {
        if (task.parent?.resolution === "UNRESOLVED" || (parentId && !taskMap.has(parentId))) {
          orphans.push(buildNode(task, 0));
        } else {
          roots.push(buildNode(task, 0));
        }
      }
    }
  }

  return {
    roots,
    orphans,
    unresolved,
    taskMap,
    childrenMap
  };
}
