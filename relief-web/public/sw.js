const CACHE_NAME = "relief-connect-v1"
const OFFLINE_URL = "/offline.html"

const STATIC_ASSETS = [
    "/",
    "/offline.html",
    "/manifest.json",
]

// Install event - cache static assets
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS)
        })
    )
    self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName)
                    }
                })
            )
        })
    )
    self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse
            }

            return fetch(event.request)
                .then((response) => {
                    // Don't cache non-successful responses
                    if (!response || response.status !== 200 || response.type === "error") {
                        return response
                    }

                    // Clone the response
                    const responseToCache = response.clone()

                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache)
                    })

                    return response
                })
                .catch(() => {
                    // Return offline page for navigation requests
                    if (event.request.mode === "navigate") {
                        return caches.match(OFFLINE_URL)
                    }
                })
        })
    )
})

// Background sync for offline requests
self.addEventListener("sync", (event) => {
    if (event.tag === "sync-requests") {
        event.waitUntil(syncRequests())
    }
})

async function syncRequests() {
    // Get pending requests from IndexedDB
    const db = await openDB()
    const tx = db.transaction("pending-requests", "readonly")
    const store = tx.objectStore("pending-requests")
    const requests = await store.getAll()

    // Send each request
    for (const request of requests) {
        try {
            await fetch("/api/requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(request.data),
            })

            // Remove from pending if successful
            const deleteTx = db.transaction("pending-requests", "readwrite")
            const deleteStore = deleteTx.objectStore("pending-requests")
            await deleteStore.delete(request.id)
        } catch (error) {
            console.error("Sync failed for request:", request.id, error)
        }
    }
}

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("relief-connect-db", 1)

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)

        request.onupgradeneeded = (event) => {
            const db = event.target.result
            if (!db.objectStoreNames.contains("pending-requests")) {
                db.createObjectStore("pending-requests", { keyPath: "id", autoIncrement: true })
            }
        }
    })
}
