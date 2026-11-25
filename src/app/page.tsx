"use client";
import styles from "./page.module.css";
import { useState } from "react";
import { Task, TaskStatus } from '../types';

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'TODO', label: 'To do' },
  { status: 'IN_PROGRESS', label: 'In progress' },
  { status: 'DONE', label: 'Done' },
];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [moveError, setMoveError] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

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
      <div>
        {COLUMNS.map((col) => {
          const columnTasks = filteredTasks.filter((t) => t.status === col.status);

          return (
            <section key={col.status} className={styles.column}>
              <h2 className={styles.columnHeader}>
                {col.label}{' '}
                <span className={styles.columnCount}>({columnTasks.length})</span>
              </h2>
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
