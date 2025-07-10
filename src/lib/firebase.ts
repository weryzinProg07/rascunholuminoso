import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

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

if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error('Erro ao inicializar Firebase Messaging:', error);
  }
}

// Chave VAPID pública para notificações push
const VAPID_KEY = 'Z8JPXbqK-VKEfwLu8v7pHWkOleLr190syJKEGCJhXwc';

// Função para solicitar permissão e obter token FCM
export const requestFCMToken = async () => {
  if (!messaging) {
    console.error('Firebase Messaging não inicializado');
    return null;
  }

  try {
    console.log('🔔 Solicitando permissão para notificações...');
    
    // Verificar se o navegador suporta notificações
    if (!('Notification' in window)) {
      console.error('Este navegador não suporta notificações');
      return null;
    }

    // Solicitar permissão
    let permission = Notification.permission;
    
    if (permission !== 'granted') {
      permission = await Notification.requestPermission();
    }
    
    if (permission !== 'granted') {
      console.log('Permissão para notificações negada');
      return null;
    }

    // Registrar service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('✅ Service Worker registrado:', registration);
    
    // Aguardar um momento para garantir que o SW está ativo
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Obter token FCM
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });
    
    if (token) {
      console.log('✅ Token FCM obtido:', token);
      return token;
    } else {
      console.log('❌ Não foi possível obter o token FCM');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Erro ao obter token FCM:', error);
    return null;
  }
};

// Função para ouvir mensagens em primeiro plano
export const onForegroundMessage = (callback: (payload: any) => void) => {
  if (!messaging) {
    console.error('Firebase Messaging não inicializado');
    return () => {};
  }

  try {
    return onMessage(messaging, (payload) => {
      console.log('📱 Mensagem recebida em primeiro plano:', payload);
      callback(payload);
    });
  } catch (error) {
    console.error('Erro ao configurar listener de mensagens:', error);
    return () => {};
  }
};

export { messaging };
