"use client";
import styles from "./page.module.css";
import { useState,useEffect,FormEvent } from "react";
import { Task, TaskStatus } from '../types';
import { getTasks,createTask } from '../api/tasks';

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'TODO', label: 'To do' },
  { status: 'IN_PROGRESS', label: 'In progress' },
  { status: 'DONE', label: 'Done' },
];

export default function TaskBoardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [moveError, setMoveError] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  


  // Inline Add Task Form
  const [newTitle, setNewTitle] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  

  // 1. Fetch initial tasks
  useEffect(() => {
    getTasks().then((data) => {
      setTasks(data);
      setLoading(false);
    });
  }, []);

  // 2. Manual 300ms debounce for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim().toLowerCase());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // 3. Add Task handler with validation
  async function handleAddTask(e: FormEvent) {
    e.preventDefault();
    const trimmed = newTitle.trim();

    if (!trimmed) {
      setFormError('Title is required');
      return;
    }
    if (trimmed.length > 80) {
      setFormError('Title must be 80 characters or fewer');
      return;
    }

    setFormError(null);
    setAdding(true);
    try {
      const created = await createTask({ title: trimmed });
      setTasks((prev) => [created, ...prev]);
      setNewTitle('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <main className={styles.container}>
        <h1 className={styles.heading}>Task Board</h1>
        <p>Loading tasks...</p>
      </main>
    );
  }

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(debouncedSearch)
  );
  return (
    <main className={styles.container}>
      <h1 className={styles.heading}>Task Board</h1>
      <div>
        <label htmlFor="search-tasks">Search tasks</label>
        <input
          id="search-tasks"
          type="text"
          className={styles.input}
          placeholder="Filter by title"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>
      {/* Optimistic Move Error Banner */}
      {moveError && (
        <div>
          <span>{moveError}</span>
          <button
            type="button"
            className={styles.button}
            onClick={() => setMoveError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      {/* 3 Columns */}
      <div className={styles.board}>
        {COLUMNS.map((col) => {
          const columnTasks = filteredTasks.filter((t) => t.status === col.status);

          return (
            <section key={col.status} className={styles.column}>
              <h2 className={styles.columnHeader}>
                {col.label}{' '}
                <span className={styles.columnCount}>({columnTasks.length})</span>
              </h2>
              {/* Inline Add Task Form inside "To do" column */}
              {col.status === 'TODO' && (
                <form onSubmit={handleAddTask} className={styles.addForm} noValidate>
                  <label htmlFor="new-task-title" className={styles.label}>
                    New task
                  </label>
                  <div className={styles.addRow}>
                    <input
                      id="new-task-title"
                      type="text"
                      className={styles.input}
                      value={newTitle}
                      onChange={(e) => {
                        setNewTitle(e.target.value);
                        if (formError) setFormError(null);
                      }}
                    />
                    <button
                      type="submit"
                      className={styles.button}
                      disabled={adding}
                    >
                      {adding ? 'Adding...' : 'Add task'}
                    </button>
                  </div>
                  {formError && <p className={styles.fieldError}>{formError}</p>}
                </form>
              )}
              {/* Task Cards */}
              <div className="styles.cardList"></div>
              {columnTasks.map((task) => (
                <article key={task.id} className={styles.card}>
                  <h3 className={styles.cardTitle}>{task.title}</h3>
                  {task.description && (
                    <p className={styles.cardDesc}>{task.description}</p>
                  )}
                  {task.dueDate && (
                    <p className={styles.cardDate}>Due {task.dueDate}</p>
                  )}
                </article>

              ))}
            </section>
          );
        })}
      </div>
    </main>
  );
}
