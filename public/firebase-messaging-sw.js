
// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

console.log('🔧 Firebase Service Worker carregado');

// Configuração do Firebase - deve ser idêntica ao arquivo firebase.ts
const firebaseConfig = {
  apiKey: "AIzaSyDGqK8v7pHWkOleLr190syJKEGCJhXwc",
  authDomain: "rascunho-luminoso.firebaseapp.com",
  projectId: "rascunho-luminoso",
  storageBucket: "rascunho-luminoso.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};

// Inicializar Firebase no service worker
try {
  firebase.initializeApp(firebaseConfig);
  console.log('✅ Firebase inicializado no Service Worker');
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase no SW:', error);
}

// Obter instância do messaging
const messaging = firebase.messaging();

// Lidar com mensagens em segundo plano
messaging.onBackgroundMessage(function(payload) {
  console.log('📱 Mensagem FCM recebida em segundo plano:', payload);

  // Extrair dados da mensagem
  const notificationTitle = payload.notification?.title || 'Novo pedido recebido';
  const notificationBody = payload.notification?.body || 'Você recebeu um novo pedido no site da Rascunho Luminoso.';
  
  const notificationOptions = {
    body: notificationBody,
    icon: '/lovable-uploads/9d315dc9-03f6-4949-85dc-8c64f34b1b8f.png',
    badge: '/lovable-uploads/9d315dc9-03f6-4949-85dc-8c64f34b1b8f.png',
    tag: 'new-order',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: {
      url: '/admin',
      orderId: payload.data?.orderId || 'unknown',
      timestamp: Date.now()
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

  console.log('🔔 Exibindo notificação:', notificationTitle);
  
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Lidar com cliques na notificação
self.addEventListener('notificationclick', function(event) {
  console.log('🔔 Notificação clicada:', event);
  
  event.notification.close();
  
  const action = event.action;
  const notificationData = event.notification.data;
  
  if (action === 'view') {
    // Abrir a página de administração
    console.log('👀 Abrindo página de administração...');
    event.waitUntil(
      clients.openWindow('/admin')
    );
  } else if (action === 'dismiss') {
    // Apenas fechar a notificação
    console.log('❌ Notificação dispensada pelo usuário');
  } else {
    // Clique geral na notificação - abrir página admin
    console.log('🔗 Abrindo página admin via clique geral...');
    event.waitUntil(
      clients.openWindow('/admin')
    );
  }
});

// Log de instalação do SW
self.addEventListener('install', function(event) {
  console.log('⚙️ Service Worker instalado');
  self.skipWaiting();
});

// Log de ativação do SW
self.addEventListener('activate', function(event) {
  console.log('✅ Service Worker ativado');
  event.waitUntil(self.clients.claim());
});

console.log('🎯 Firebase Service Worker configurado e pronto para receber notificações');
