

// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Configuração do Firebase - mesma do arquivo firebase.ts
const firebaseConfig = {
  apiKey: "AIzaSyDGqK8v7pHWkOleLr190syJKEGCJhXwc",
  authDomain: "rascunho-luminoso.firebaseapp.com",
  projectId: "rascunho-luminoso",
  storageBucket: "rascunho-luminoso.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};

// Inicializar Firebase no service worker
firebase.initializeApp(firebaseConfig);

// Obter instância do messaging
const messaging = firebase.messaging();

// Lidar com mensagens em segundo plano
messaging.onBackgroundMessage(function(payload) {
  console.log('📱 Mensagem recebida em segundo plano:', payload);

  const notificationTitle = 'Novo pedido recebido';
  const notificationOptions = {
    body: 'Você recebeu um novo pedido no site da Rascunho Luminoso.',
    icon: '/lovable-uploads/9d315dc9-03f6-4949-85dc-8c64f34b1b8f.png',
    badge: '/lovable-uploads/9d315dc9-03f6-4949-85dc-8c64f34b1b8f.png',
    tag: 'new-order',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: {
      url: '/admin',
      orderId: payload.data?.orderId || 'unknown'
    },
    actions: [
      {
        action: 'view',
        title: 'Ver Pedidos',
        icon: '/lovable-uploads/9d315dc9-03f6-4949-85dc-8c64f34b1b8f.png'
      },
      {
        action: 'dismiss',
        title: 'Dispensar'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Lidar com cliques na notificação
self.addEventListener('notificationclick', function(event) {
  console.log('🔔 Notificação clicada:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    // Abrir a página de administração
    event.waitUntil(
      clients.openWindow('/admin')
    );
  } else if (event.action === 'dismiss') {
    // Apenas fechar a notificação
    console.log('Notificação dispensada');
  } else {
    // Clique geral na notificação - abrir página admin
    event.waitUntil(
      clients.openWindow('/admin')
    );
  }
});

