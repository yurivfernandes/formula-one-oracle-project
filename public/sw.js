// Versão do cache - MUDE ESTE NÚMERO QUANDO QUISER FORÇAR ATUALIZAÇÃO
const CACHE_VERSION = 'v3.0-drivers-validation';
const BUILD_TIMESTAMP = Date.now();
const CACHE_NAME = `formula-one-oracle-${CACHE_VERSION}-${BUILD_TIMESTAMP}`;
const STATIC_CACHE = `static-${CACHE_VERSION}-${BUILD_TIMESTAMP}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}-${BUILD_TIMESTAMP}`;

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon-f1-analytics.png',
  '/icons/icon-192x192.png'
  // Não cachear arquivos JS/CSS do Vite pois eles têm hash próprio
];

// Instalar o service worker e fazer cache dos recursos
self.addEventListener('install', (event) => {
  console.log(`Service Worker: Installing ${CACHE_VERSION}...`);
  
  event.waitUntil(
    Promise.all([
      // Limpar todos os caches existentes primeiro
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('SW Install: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }),
      // Criar novo cache
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(urlsToCache);
      })
    ]).then(() => {
      // Forçar ativação imediata da nova versão
      console.log('SW: Skipping waiting for immediate activation');
      return self.skipWaiting();
    })
  );
});

// Interceptar requests com estratégia Network First para HTML, Cache First para assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Para navegação (páginas HTML) - sempre tentar rede primeiro
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clonar resposta para cache
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback para cache se offline
          return caches.match(request).then((cached) => {
            return cached || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Para assets estáticos - Cache First
  if (request.destination === 'image' || request.destination === 'font' || 
      url.pathname.includes('/icons/') || url.pathname.includes('/favicon')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(request).then((response) => {
          const responseClone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        });
      })
    );
    return;
  }

  // Para API calls e outros recursos - Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Só cachear respostas válidas
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback para cache
        return caches.match(request);
      })
  );
});

// Atualizar o service worker - limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log(`Service Worker: Activating ${CACHE_VERSION}...`);
  const cacheWhitelist = [STATIC_CACHE, DYNAMIC_CACHE];

  event.waitUntil(
    Promise.all([
      // Limpar TODOS os caches antigos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Limpar localStorage de predições antigas para forçar nova geração
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'CLEAR_OLD_DATA',
            version: CACHE_VERSION
          });
        });
      }),
      // Tomar controle imediatamente
      self.clients.claim()
    ]).then(() => {
      console.log(`Service Worker: ${CACHE_VERSION} activated successfully`);
    })
  );
});

// Lidar com mensagens do app principal
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Skipping waiting...');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('Service Worker: Clearing all caches...');
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
});

// Sincronização em background (para quando voltar online)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Implementar lógica de sincronização aqui
  // Por exemplo, enviar dados pendentes quando voltar online
  return Promise.resolve();
}

// Push notifications (opcional para futuras funcionalidades)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização da Fórmula 1!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver mais',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('F1 Analytics', options)
  );
});

// Lidar com cliques em notificações
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    // Abrir a aplicação
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
