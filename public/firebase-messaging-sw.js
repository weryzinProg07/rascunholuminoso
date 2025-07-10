
// Firebase Cloud Messaging Service Worker - Versão Corrigida
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

console.log('🔧 === SERVICE WORKER FCM INICIADO ===');

// Configuração do Firebase (idêntica ao arquivo principal)
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

// Lidar com mensagens em segundo plano (quando o navegador está fechado)
messaging.onBackgroundMessage(function(payload) {
  console.log('📱 === MENSAGEM FCM EM SEGUNDO PLANO ===');
  console.log('📦 Payload completo:', payload);

  // Extrair dados da mensagem
  const notificationTitle = payload.notification?.title || 'Novo pedido recebido';
  const notificationBody = payload.notification?.body || 'Você recebeu um novo pedido no site da Rascunho Luminoso.';
  
  const notificationOptions = {
    body: notificationBody,
    icon: '/lovable-uploads/9d315dc9-03f6-4949-85dc-8c64f34b1b8f.png',
    badge: '/lovable-uploads/9d315dc9-03f6-4949-85dc-8c64f34b1b8f.png',
    tag: 'new-order',
    requireInteraction: true,
    silent: false,
    data: {
      url: '/admin',
      orderId: payload.data?.orderId || 'unknown',
      timestamp: Date.now(),
      clickAction: '/admin'
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
  console.log('⚙️ Opções da notificação:', notificationOptions);
  
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Lidar com cliques na notificação
self.addEventListener('notificationclick', function(event) {
  console.log('🔔 === NOTIFICAÇÃO CLICADA ===');
  console.log('🔔 Event:', event);
  console.log('🔔 Action:', event.action);
  console.log('🔔 Data:', event.notification.data);
  
  event.notification.close();
  
  const action = event.action;
  const notificationData = event.notification.data;
  
  if (action === 'view' || !action) {
    // Abrir a página de administração
    console.log('👀 Abrindo página de administração...');
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        // Verificar se já há uma janela aberta
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes('/admin') && 'focus' in client) {
            console.log('👀 Focando janela existente');
            return client.focus();
          }
        }
        
        // Abrir nova janela
        if (clients.openWindow) {
          console.log('👀 Abrindo nova janela: /admin');
          return clients.openWindow('/admin');
        }
      })
    );
  } else if (action === 'dismiss') {
    console.log('❌ Notificação dispensada pelo usuário');
  }
});

// Log de instalação do SW
self.addEventListener('install', function(event) {
  console.log('⚙️ Service Worker instalado com sucesso');
  self.skipWaiting(); // Força ativação imediata
});

// Log de ativação do SW
self.addEventListener('activate', function(event) {
  console.log('✅ Service Worker ativado e assumindo controle');
  event.waitUntil(self.clients.claim()); // Assume controle de todas as páginas
});

// Log geral
console.log('🎯 === SERVICE WORKER FCM CONFIGURADO E PRONTO ===');
console.log('📍 Escopo do SW:', self.registration.scope);
console.log('🔧 Firebase Messaging configurado para background messages');
