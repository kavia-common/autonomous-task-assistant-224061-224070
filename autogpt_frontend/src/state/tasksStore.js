import { createStore } from "./createStore";

const initialState = {
  tasks: [], // array of tasks
  selectedTaskId: null,
};

function actionsFactory({ getState, setState }) {
  // PUBLIC_INTERFACE
  const setTasks = (tasks = []) => {
    setState((s) => ({ ...s, tasks: Array.isArray(tasks) ? tasks : [] }));
  };

  // PUBLIC_INTERFACE
  const addTask = (task) => {
    if (!task) return;
    setState((s) => ({ ...s, tasks: [task, ...s.tasks] }));
  };

  // PUBLIC_INTERFACE
  const updateTask = (task) => {
    if (!task || !task.id) return;
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === task.id ? { ...t, ...task } : t)),
    }));
  };

  // PUBLIC_INTERFACE
  const removeTask = (taskId) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.filter((t) => t.id !== taskId),
      selectedTaskId: s.selectedTaskId === taskId ? null : s.selectedTaskId,
    }));
  };

  // PUBLIC_INTERFACE
  const selectTask = (taskId) => {
    setState((s) => ({ ...s, selectedTaskId: taskId || null }));
  };

  // PUBLIC_INTERFACE
  const getSelectedTask = () => {
    const { tasks, selectedTaskId } = getState();
    return tasks.find((t) => t.id === selectedTaskId) || null;
  };

  return { setTasks, addTask, updateTask, removeTask, selectTask, getSelectedTask };
}

export const tasksStore = createStore(initialState, actionsFactory);

// PUBLIC_INTERFACE
export function useTasks(selector) {
  return tasksStore.useStore(selector || ((s) => s));
}
