
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDGqK8v7pHWkOleLr190syJKEGCJhXwc",
  authDomain: "rascunho-luminoso.firebaseapp.com",
  projectId: "rascunho-luminoso",
  storageBucket: "rascunho-luminoso.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firebase Cloud Messaging
let messaging: any = null;

// Chave VAPID pública para notificações push
const VAPID_KEY = 'Z8JPXbqK-VKEfwLu8v7pHWkOleLr190syJKEGCJhXwc';

// Verificar se o ambiente suporta messaging
const initializeMessaging = async () => {
  if (typeof window === 'undefined') {
    console.log('❌ Ambiente não é navegador - Firebase Messaging não disponível');
    return null;
  }

  try {
    // Verificar se o FCM é suportado
    const supported = await isSupported();
    if (!supported) {
      console.error('❌ Firebase Messaging não é suportado neste navegador');
      return null;
    }

    // Verificar se notificações são suportadas
    if (!('Notification' in window)) {
      console.error('❌ Este navegador não suporta notificações');
      return null;
    }

    // Verificar se service workers são suportados
    if (!('serviceWorker' in navigator)) {
      console.error('❌ Este navegador não suporta Service Workers');
      return null;
    }

    messaging = getMessaging(app);
    console.log('✅ Firebase Messaging inicializado com sucesso');
    return messaging;

  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase Messaging:', error);
    return null;
  }
};

// Função para verificar protocolo HTTPS
const checkHTTPS = () => {
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '[::1]';
  
  const isHTTPS = window.location.protocol === 'https:';
  
  if (!isHTTPS && !isLocalhost) {
    console.error('❌ Notificações push requerem HTTPS ou localhost');
    return false;
  }
  
  console.log('✅ Protocolo válido para notificações push:', window.location.protocol);
  return true;
};

// Função para registrar service worker
const registerServiceWorker = async () => {
  try {
    console.log('🔧 Registrando Service Worker...');
    
    // Verificar se já existe um SW registrado
    const existingRegistration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    
    if (existingRegistration) {
      console.log('✅ Service Worker já registrado:', existingRegistration);
      return existingRegistration;
    }

    // Registrar novo SW
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });
    
    console.log('✅ Service Worker registrado com sucesso:', registration);
    
    // Aguardar o SW ficar ativo
    await new Promise((resolve) => {
      if (registration.active) {
        resolve(registration);
      } else {
        registration.addEventListener('statechange', () => {
          if (registration.active) {
            resolve(registration);
          }
        });
      }
    });
    
    return registration;
    
  } catch (error) {
    console.error('❌ Erro ao registrar Service Worker:', error);
    throw new Error(`Falha ao registrar Service Worker: ${error.message}`);
  }
};

// Função para solicitar permissão e obter token FCM
export const requestFCMToken = async () => {
  try {
    console.log('🔔 Iniciando processo de obtenção do token FCM...');
    
    // Verificar protocolo HTTPS
    if (!checkHTTPS()) {
      throw new Error('Notificações push requerem HTTPS ou localhost');
    }

    // Inicializar messaging
    const messagingInstance = await initializeMessaging();
    if (!messagingInstance) {
      throw new Error('Firebase Messaging não pôde ser inicializado');
    }

    // Verificar permissão atual
    let permission = Notification.permission;
    console.log('📋 Permissão atual:', permission);

    // Solicitar permissão se necessário
    if (permission === 'default') {
      console.log('🔔 Solicitando permissão para notificações...');
      permission = await Notification.requestPermission();
      console.log('📋 Nova permissão:', permission);
    }

    if (permission === 'denied') {
      throw new Error('Permissão para notificações foi negada pelo usuário. Por favor, habilite nas configurações do navegador.');
    }

    if (permission !== 'granted') {
      throw new Error('Permissão para notificações não foi concedida');
    }

    // Registrar service worker
    const registration = await registerServiceWorker();
    console.log('🔧 Service Worker ativo:', !!registration.active);

    // Aguardar um momento para garantir que tudo está inicializado
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Obter token FCM
    console.log('🎫 Obtendo token FCM com VAPID key...');
    const token = await getToken(messagingInstance, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (!token) {
      throw new Error('Token FCM não foi gerado. Verifique as configurações do Firebase.');
    }

    console.log('✅ Token FCM obtido com sucesso!');
    console.log('🎫 Token FCM:', token);
    
    return token;

  } catch (error: any) {
    console.error('❌ Erro detalhado ao obter token FCM:', error);
    
    // Melhorar mensagens de erro
    let errorMessage = error.message;
    
    if (error.code === 'messaging/permission-blocked') {
      errorMessage = 'Permissão bloqueada. Clique no ícone de cadeado na barra de endereços e permita notificações.';
    } else if (error.code === 'messaging/vapid-key-required') {
      errorMessage = 'Chave VAPID inválida ou não fornecida.';
    } else if (error.code === 'messaging/registration-token-not-registered') {
      errorMessage = 'Token de registro inválido. Tente novamente.';
    }
    
    throw new Error(errorMessage);
  }
};

// Função para ouvir mensagens em primeiro plano
export const onForegroundMessage = (callback: (payload: any) => void) => {
  if (!messaging) {
    console.error('❌ Firebase Messaging não inicializado');
    return () => {};
  }

  try {
    console.log('👂 Configurando listener para mensagens em primeiro plano...');
    
    return onMessage(messaging, (payload) => {
      console.log('📱 Mensagem recebida em primeiro plano:', payload);
      callback(payload);
    });
    
  } catch (error) {
    console.error('❌ Erro ao configurar listener de mensagens:', error);
    return () => {};
  }
};

// Função para testar notificação local
export const testLocalNotification = () => {
  if (Notification.permission === 'granted') {
    console.log('🧪 Enviando notificação de teste...');
    
    const notification = new Notification('🧪 Teste - Rascunho Luminoso', {
      body: 'Esta é uma notificação de teste! Se você vê isso, as notificações estão funcionando.',
      icon: '/lovable-uploads/9d315dc9-03f6-4949-85dc-8c64f34b1b8f.png',
      tag: 'test-notification',
      requireInteraction: true,
      badge: '/lovable-uploads/9d315dc9-03f6-4949-85dc-8c64f34b1b8f.png'
    });
    
    notification.onclick = () => {
      console.log('🔔 Notificação de teste clicada');
      notification.close();
    };
    
    return notification;
  } else {
    throw new Error('Permissão para notificações não concedida');
  }
};

export { messaging };
