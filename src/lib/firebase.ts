
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

// Chave VAPID pública
const VAPID_KEY = 'Z8JPXbqK-VKEfwLu8v7pHWkOleLr190syJKEGCJhXwc';

let messaging: any = null;

// Função para verificar se o ambiente suporta FCM
const checkEnvironmentSupport = () => {
  console.log('🔍 Verificando suporte do ambiente...');
  
  // Verificar se está no navegador
  if (typeof window === 'undefined') {
    console.error('❌ Não está rodando no navegador');
    return false;
  }

  // Verificar notificações
  if (!('Notification' in window)) {
    console.error('❌ Navegador não suporta notificações');
    return false;
  }

  // Verificar Service Workers
  if (!('serviceWorker' in navigator)) {
    console.error('❌ Navegador não suporta Service Workers');
    return false;
  }

  // Verificar HTTPS ou localhost
  const isSecure = window.location.protocol === 'https:' || 
                   window.location.hostname === 'localhost' ||
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname === '[::1]';

  if (!isSecure) {
    console.error('❌ Notificações requerem HTTPS ou localhost');
    return false;
  }

  console.log('✅ Ambiente suporta FCM completamente');
  return true;
};

// Função para registrar Service Worker
const registerServiceWorker = async () => {
  try {
    console.log('🔧 Registrando Service Worker...');
    
    // Verificar se já existe
    const existingRegistration = await navigator.serviceWorker.getRegistration();
    if (existingRegistration) {
      console.log('✅ Service Worker já registrado:', existingRegistration.scope);
      return existingRegistration;
    }

    // Registrar novo SW
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('✅ Service Worker registrado com sucesso:', registration.scope);

    // Aguardar que fique ativo
    if (registration.installing) {
      console.log('⏳ Service Worker instalando...');
      await new Promise((resolve) => {
        registration.installing!.addEventListener('statechange', () => {
          if (registration.installing!.state === 'activated') {
            resolve(registration);
          }
        });
      });
    }

    console.log('✅ Service Worker ativo e funcionando');
    return registration;

  } catch (error) {
    console.error('❌ Erro ao registrar Service Worker:', error);
    throw new Error(`Falha no Service Worker: ${error.message}`);
  }
};

// Função para solicitar permissão de notificações
const requestNotificationPermission = async () => {
  console.log('🔔 Verificando permissão de notificações...');
  
  let permission = Notification.permission;
  console.log('📋 Permissão atual:', permission);

  if (permission === 'default') {
    console.log('❓ Solicitando permissão ao usuário...');
    permission = await Notification.requestPermission();
    console.log('📋 Nova permissão:', permission);
  }

  if (permission === 'denied') {
    throw new Error('Permissão para notificações foi negada. Você precisa ir nas configurações do navegador e permitir notificações para este site.');
  }

  if (permission !== 'granted') {
    throw new Error('Permissão para notificações não foi concedida');
  }

  console.log('✅ Permissão para notificações concedida');
  return permission;
};

// Função principal para obter token FCM
export const requestFCMToken = async () => {
  try {
    console.log('🚀 === INICIANDO PROCESSO FCM ===');
    
    // 1. Verificar suporte do ambiente
    if (!checkEnvironmentSupport()) {
      throw new Error('Ambiente não suporta notificações push');
    }

    // 2. Verificar se FCM é suportado
    const supported = await isSupported();
    if (!supported) {
      throw new Error('Firebase Messaging não é suportado neste navegador');
    }
    console.log('✅ Firebase Messaging suportado');

    // 3. Inicializar messaging
    messaging = getMessaging(app);
    console.log('✅ Firebase Messaging inicializado');

    // 4. Registrar Service Worker
    const registration = await registerServiceWorker();

    // 5. Solicitar permissão
    await requestNotificationPermission();

    // 6. Obter token FCM
    console.log('🎫 Obtendo token FCM...');
    console.log('🔑 Usando VAPID Key:', VAPID_KEY.substring(0, 20) + '...');
    
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (!token) {
      throw new Error('Token FCM não foi gerado. Verifique a configuração do Firebase.');
    }

    console.log('✅ === TOKEN FCM OBTIDO COM SUCESSO ===');
    console.log('🎫 Token:', token);
    console.log('📏 Tamanho do token:', token.length, 'caracteres');
    
    return token;

  } catch (error: any) {
    console.error('❌ === ERRO NO PROCESSO FCM ===');
    console.error('❌ Erro:', error);
    console.error('❌ Mensagem:', error.message);
    console.error('❌ Stack:', error.stack);
    
    // Melhorar mensagens de erro para o usuário
    let userMessage = error.message;
    
    if (error.code === 'messaging/permission-blocked') {
      userMessage = 'Notificações foram bloqueadas. Clique no ícone de cadeado/notificação na barra de endereços e permita notificações.';
    } else if (error.code === 'messaging/vapid-key-required') {
      userMessage = 'Chave VAPID é obrigatória para notificações.';
    } else if (error.code === 'messaging/registration-token-not-registered') {
      userMessage = 'Token de registro inválido. Tente recarregar a página.';
    } else if (error.message.includes('denied')) {
      userMessage = 'Permissão negada. Vá em Configurações do navegador > Privacidade e segurança > Permissões do site > Notificações e permita para este site.';
    } else if (error.message.includes('HTTPS')) {
      userMessage = 'Notificações só funcionam em HTTPS. Acesse o site via HTTPS.';
    }
    
    throw new Error(userMessage);
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
      console.log('📱 Mensagem FCM recebida em primeiro plano:', payload);
      callback(payload);
    });
    
  } catch (error) {
    console.error('❌ Erro ao configurar listener:', error);
    return () => {};
  }
};

// Função para testar notificação local
export const testLocalNotification = () => {
  try {
    if (Notification.permission !== 'granted') {
      throw new Error('Permissão para notificações não foi concedida');
    }

    console.log('🧪 Criando notificação de teste...');
    
    const notification = new Notification('🧪 Teste - Rascunho Luminoso', {
      body: 'Esta é uma notificação de teste! Se você vê isso, as notificações estão funcionando perfeitamente.',
      icon: '/lovable-uploads/9d315dc9-03f6-4949-85dc-8c64f34b1b8f.png',
      badge: '/lovable-uploads/9d315dc9-03f6-4949-85dc-8c64f34b1b8f.png',
      tag: 'test-notification',
      requireInteraction: true
    } as NotificationOptions);
    
    notification.onclick = () => {
      console.log('🔔 Notificação de teste clicada');
      notification.close();
    };
    
    console.log('✅ Notificação de teste criada');
    return notification;
    
  } catch (error: any) {
    console.error('❌ Erro ao criar notificação de teste:', error);
    throw new Error(`Erro no teste: ${error.message}`);
  }
};

export { messaging };
