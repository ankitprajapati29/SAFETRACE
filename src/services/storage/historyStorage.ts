import type { ScanHistoryRecord } from "../../types";

const DB_NAME = "safetrace_database";
const DB_VERSION = 1;
const STORE_NAME = "scan_history";
const MAX_HISTORY = 200;

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(
      new Error("IndexedDB is not available in this environment."),
    );
  }

  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });

        store.createIndex("createdAt", "createdAt", {
          unique: false,
        });
      }
    };

    request.onsuccess = () => resolve(request.result);

    request.onerror = () => {
      databasePromise = null;
      reject(request.error ?? new Error("Database could not be opened."));
    };

    request.onblocked = () => {
      reject(new Error("Database upgrade is blocked by another tab."));
    };
  });

  return databasePromise;
}

export async function saveScan(
  record: ScanHistoryRecord,
): Promise<void> {
  const db = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    store.put(record);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("Unable to save scan."));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("Scan save was aborted."));
  });

  await enforceHistoryLimit();
}

export async function getScanHistory(): Promise<ScanHistoryRecord[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).getAll();

    request.onsuccess = () => {
      const records = request.result as ScanHistoryRecord[];

      resolve(
        records.sort((a, b) => b.createdAt - a.createdAt),
      );
    };

    request.onerror = () =>
      reject(request.error ?? new Error("Unable to load scan history."));
  });
}

export async function deleteScan(id: string): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).delete(id);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("Unable to delete scan."));
  });
}

export async function clearScanHistory(): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).clear();

    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("Unable to clear history."));
  });
}

async function enforceHistoryLimit(): Promise<void> {
  const records = await getScanHistory();

  if (records.length <= MAX_HISTORY) return;

  const excessRecords = records.slice(MAX_HISTORY);

  await Promise.all(
    excessRecords.map((record) => deleteScan(record.id)),
  );
}