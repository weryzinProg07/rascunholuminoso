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
const VAPID_KEY = 'BPdgVfG9kKNBqKGv4QyZ8JPXbqK-VKEfwLu8v7pHWkOleLr190syJKEGCJhXwc';

let messaging: any = null;

// Função para verificar se o ambiente suporta FCM
const checkEnvironmentSupport = () => {
  console.log('🔍 === VERIFICANDO SUPORTE DO AMBIENTE ===');
  
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
    console.error('❌ Protocolo atual:', window.location.protocol);
    console.error('❌ Hostname atual:', window.location.hostname);
    return false;
  }

  console.log('✅ Ambiente suporta FCM completamente');
  console.log('✅ Protocolo:', window.location.protocol);
  console.log('✅ Hostname:', window.location.hostname);
  return true;
};

// Função para registrar Service Worker
const registerServiceWorker = async () => {
  try {
    console.log('🔧 === REGISTRANDO SERVICE WORKER ===');
    
    // Verificar se já existe
    const existingRegistration = await navigator.serviceWorker.getRegistration();
    if (existingRegistration) {
      console.log('✅ Service Worker já registrado:', existingRegistration.scope);
      
      // Verificar se está ativo
      if (existingRegistration.active) {
        console.log('✅ Service Worker está ativo');
        return existingRegistration;
      }
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
            console.log('✅ Service Worker ativado');
            resolve(registration);
          }
        });
      });
    }

    console.log('✅ Service Worker configurado e funcionando');
    return registration;

  } catch (error) {
    console.error('❌ Erro ao registrar Service Worker:', error);
    throw new Error(`Falha no Service Worker: ${error.message}`);
  }
};

// Função principal para obter token FCM (CHAMADA APENAS APÓS PERMISSÃO CONCEDIDA)
export const requestFCMToken = async () => {
  try {
    console.log('🚀 === OBTENDO TOKEN FCM (PERMISSÃO JÁ CONCEDIDA) ===');
    
    // 1. Verificar suporte do ambiente
    if (!checkEnvironmentSupport()) {
      throw new Error('Ambiente não suporta notificações push. Use HTTPS e um navegador moderno (Chrome, Firefox, Safari).');
    }

    // 2. Verificar se FCM é suportado
    const supported = await isSupported();
    if (!supported) {
      throw new Error('Firebase Messaging não é suportado neste navegador');
    }
    console.log('✅ Firebase Messaging suportado');

    // 3. Verificar se permissão já foi concedida (OBRIGATÓRIO)
    if (Notification.permission !== 'granted') {
      throw new Error('Esta função só deve ser chamada APÓS a permissão ser concedida');
    }
    console.log('✅ Permissão já concedida anteriormente');

    // 4. Registrar Service Worker
    const registration = await registerServiceWorker();

    // 5. Inicializar messaging
    messaging = getMessaging(app);
    console.log('✅ Firebase Messaging inicializado');

    // 6. Obter token FCM
    console.log('🎫 === OBTENDO TOKEN FCM ===');
    console.log('🔑 Usando VAPID Key:', VAPID_KEY.substring(0, 30) + '...');
    
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (!token) {
      throw new Error('Token FCM não foi gerado. Verifique a configuração do Firebase.');
    }

    console.log('🎉 === TOKEN FCM OBTIDO COM SUCESSO ===');
    console.log('🎫 Token (primeiros 50 chars):', token.substring(0, 50) + '...');
    console.log('📏 Tamanho do token:', token.length, 'caracteres');
    
    return token;

  } catch (error: any) {
    console.error('❌ === ERRO AO OBTER TOKEN FCM ===');
    console.error('❌ Tipo do erro:', error.constructor.name);
    console.error('❌ Mensagem:', error.message);
    console.error('❌ Código (se houver):', error.code);
    console.error('❌ Stack:', error.stack);
    
    // Melhorar mensagens de erro baseadas no tipo
    let userMessage = error.message;
    
    if (error.code === 'messaging/permission-blocked' || error.message.includes('negada')) {
      userMessage = 'Notificações foram bloqueadas. Clique no ícone de cadeado ou sino na barra de endereços e permita notificações.';
    } else if (error.code === 'messaging/vapid-key-required') {
      userMessage = 'Chave VAPID é obrigatória para notificações.';
    } else if (error.code === 'messaging/registration-token-not-registered') {
      userMessage = 'Token de registro inválido. Recarregue a página e tente novamente.';
    } else if (error.message.includes('HTTPS')) {
      userMessage = 'Notificações só funcionam em HTTPS. Certifique-se de que está acessando via HTTPS.';
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
    console.log('🧪 === TESTANDO NOTIFICAÇÃO LOCAL ===');
    
    // Verificar permissão antes de criar notificação
    if (Notification.permission !== 'granted') {
      throw new Error('Permissão para notificações não foi concedida. Ative as notificações primeiro.');
    }

    console.log('🧪 Criando notificação de teste...');
    
    const notification = new Notification('🧪 Teste - Rascunho Luminoso', {
      body: 'Esta é uma notificação de teste! Se você vê isso, as notificações estão funcionando perfeitamente. ✅',
      icon: '/lovable-uploads/9d315dc9-03f6-4949-85dc-8c64f34b1b8f.png',
      badge: '/lovable-uploads/9d315dc9-03f6-4949-85dc-8c64f34b1b8f.png',
      tag: 'test-notification',
      requireInteraction: true
    } as NotificationOptions);
    
    notification.onclick = () => {
      console.log('🔔 Notificação de teste clicada pelo usuário');
      notification.close();
      window.focus();
    };
    
    console.log('✅ Notificação de teste criada e exibida');
    return notification;
    
  } catch (error: any) {
    console.error('❌ Erro ao criar notificação de teste:', error);
    throw new Error(`Erro no teste: ${error.message}`);
  }
};

export { messaging };
