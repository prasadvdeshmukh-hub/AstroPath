'use strict';

// Firestore initialization with a memory fallback.
// The memory fallback implements just enough of the Firestore Admin API
// for the repositories we ship today (doc, get, set, update, collection, add).
// This lets the backend scaffold boot and serve the frontend without credentials.

let firestoreInstance = null;
let mode = 'memory';

function createMemoryFirestore() {
  const collections = new Map(); // name -> Map<id, data>

  function ensure(name) {
    if (!collections.has(name)) collections.set(name, new Map());
    return collections.get(name);
  }

  function wrapDoc(collectionName, id) {
    return {
      id,
      async get() {
        const data = ensure(collectionName).get(id);
        return {
          id,
          exists: data !== undefined,
          data: () => (data !== undefined ? { ...data } : undefined),
        };
      },
      async set(data, options = {}) {
        const col = ensure(collectionName);
        const existing = options.merge ? col.get(id) || {} : {};
        col.set(id, { ...existing, ...data });
        return { writeTime: new Date() };
      },
      async update(data) {
        const col = ensure(collectionName);
        const existing = col.get(id);
        if (existing === undefined) {
          const err = new Error(`No document to update: ${collectionName}/${id}`);
          err.code = 5; // NOT_FOUND
          throw err;
        }
        col.set(id, { ...existing, ...data });
        return { writeTime: new Date() };
      },
      async delete() {
        ensure(collectionName).delete(id);
        return { writeTime: new Date() };
      },
    };
  }

  function wrapCollection(name) {
    return {
      doc(id) {
        const docId = id || Math.random().toString(36).slice(2) + Date.now().toString(36);
        return wrapDoc(name, docId);
      },
      async add(data) {
        const docId = Math.random().toString(36).slice(2) + Date.now().toString(36);
        ensure(name).set(docId, { ...data });
        return wrapDoc(name, docId);
      },
      async get() {
        const col = ensure(name);
        const docs = [];
        for (const [id, data] of col.entries()) {
          docs.push({ id, exists: true, data: () => ({ ...data }) });
        }
        return { empty: docs.length === 0, size: docs.length, docs };
      },
    };
  }

  return {
    __memory: true,
    collection(name) {
      return wrapCollection(name);
    },
  };
}

async function initFirestore(env) {
  mode = env.FIRESTORE_MODE;

  if (mode === 'memory') {
    firestoreInstance = createMemoryFirestore();
    return firestoreInstance;
  }

  // Lazy-require so the memory path doesn't need firebase-admin installed.
  const admin = require('firebase-admin');
  if (admin.apps.length === 0) {
    const opts = {};
    if (env.FIREBASE_PROJECT_ID) opts.projectId = env.FIREBASE_PROJECT_ID;
    admin.initializeApp(opts);
  }
  firestoreInstance = admin.firestore();
  return firestoreInstance;
}

function getFirestore() {
  if (!firestoreInstance) {
    throw new Error('Firestore has not been initialized. Call initFirestore() first.');
  }
  return firestoreInstance;
}

function getFirestoreMode() {
  return mode;
}

module.exports = { initFirestore, getFirestore, getFirestoreMode };
