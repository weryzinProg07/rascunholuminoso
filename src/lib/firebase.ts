
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

// Função para solicitar permissão e obter token - SEM BLOQUEIOS
export const requestFCMToken = async () => {
  if (!messaging) {
    console.error('Firebase Messaging não inicializado');
    return null;
  }

  try {
    console.log('🚀 SOLICITANDO TOKEN SEM BLOQUEIOS...');
    
    // Verificar se o navegador suporta notificações
    if (!('Notification' in window)) {
      console.error('Este navegador não suporta notificações');
      return null;
    }

    // Solicitar permissão sem verificar se já foi negada
    let permission = Notification.permission;
    
    if (permission !== 'granted') {
      console.log('🔔 Solicitando permissão...');
      permission = await Notification.requestPermission();
      console.log('🔔 Resultado da permissão:', permission);
    }
    
    // FORÇAR obtenção do token independente da permissão
    try {
      const token = await getToken(messaging, {
        vapidKey: 'Z8JPXbqK-VKEfwLu8v7pHWkOleLr190syJKEGCJhXwc'
      });
      
      if (token) {
        console.log('✅ Token FCM obtido com sucesso:', token);
        return token;
      }
    } catch (tokenError) {
      console.log('⚠️ Erro ao obter token, mas continuando...', tokenError);
    }
    
    // Tentar novamente com diferentes abordagens
    console.log('🔄 Tentando abordagem alternativa...');
    
    try {
      // Forçar registro do service worker primeiro
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('✅ Service Worker forçado:', registration);
      
      // Aguardar um pouco e tentar obter token novamente
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const retryToken = await getToken(messaging, {
        vapidKey: 'Z8JPXbqK-VKEfwLu8v7pHWkOleLr190syJKEGCJhXwc',
        serviceWorkerRegistration: registration
      });
      
      if (retryToken) {
        console.log('✅ Token FCM obtido na segunda tentativa:', retryToken);
        return retryToken;
      }
    } catch (retryError) {
      console.log('⚠️ Erro na segunda tentativa:', retryError);
    }
    
    // Se chegou até aqui, tentar uma última vez sem service worker específico
    console.log('🔄 Última tentativa...');
    
    try {
      const finalToken = await getToken(messaging, {
        vapidKey: 'Z8JPXbqK-VKEfwLu8v7pHWkOleLr190syJKEGCJhXwc'
      });
      
      if (finalToken) {
        console.log('✅ Token FCM obtido na tentativa final:', finalToken);
        return finalToken;
      }
    } catch (finalError) {
      console.log('⚠️ Erro na tentativa final:', finalError);
    }
    
    console.log('⚠️ Não foi possível obter token, mas não há bloqueios');
    return null;
    
  } catch (error) {
    console.error('❌ Erro geral capturado (mas sem bloquear):', error);
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
