const DATABASE_NAME = "pi-ecu-database";
const DATABASE_VERSION = 1;
const STORE_NAME = "sessions";

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(
            DATABASE_NAME,
            DATABASE_VERSION
        );

        request.onupgradeneeded = () => {
            const database = request.result;

            if (!database.objectStoreNames.contains(STORE_NAME)) {
                const store = database.createObjectStore(
                    STORE_NAME,
                    { keyPath: "id" }
                );

                store.createIndex(
                    "createdAt",
                    "createdAt",
                    { unique: false }
                );
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function saveSession(session) {
    const database = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(
            STORE_NAME,
            "readwrite"
        );

        transaction.objectStore(STORE_NAME).put(session);
        transaction.oncomplete = () => {
            database.close();
            resolve(session);
        };
        transaction.onerror = () => {
            database.close();
            reject(transaction.error);
        };
    });
}

export async function listSessions() {
    const database = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(
            STORE_NAME,
            "readonly"
        );
        const request = transaction.objectStore(STORE_NAME).getAll();

        request.onsuccess = () => {
            database.close();
            resolve(
                request.result.sort(
                    (a, b) => b.createdAt - a.createdAt
                )
            );
        };
        request.onerror = () => {
            database.close();
            reject(request.error);
        };
    });
}

export async function getSession(id) {
    const database = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(
            STORE_NAME,
            "readonly"
        );
        const request = transaction
            .objectStore(STORE_NAME)
            .get(id);

        request.onsuccess = () => {
            database.close();
            resolve(request.result || null);
        };
        request.onerror = () => {
            database.close();
            reject(request.error);
        };
    });
}

export async function deleteSession(id) {
    const database = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(
            STORE_NAME,
            "readwrite"
        );

        transaction.objectStore(STORE_NAME).delete(id);
        transaction.oncomplete = () => {
            database.close();
            resolve(true);
        };
        transaction.onerror = () => {
            database.close();
            reject(transaction.error);
        };
    });
}

export async function clearSessions() {
    const database = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(
            STORE_NAME,
            "readwrite"
        );

        transaction.objectStore(STORE_NAME).clear();
        transaction.oncomplete = () => {
            database.close();
            resolve(true);
        };
        transaction.onerror = () => {
            database.close();
            reject(transaction.error);
        };
    });
}