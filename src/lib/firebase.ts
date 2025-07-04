
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Configuração do Firebase - substitua pelos seus valores reais
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

// Função para solicitar permissão e obter token
export const requestFCMToken = async () => {
  if (!messaging) {
    console.error('Firebase Messaging não inicializado');
    return null;
  }

  try {
    console.log('Solicitando permissão para notificações...');
    
    // Verificar se o navegador suporta notificações
    if (!('Notification' in window)) {
      console.error('Este navegador não suporta notificações');
      return null;
    }

    // Solicitar permissão
    const permission = await Notification.requestPermission();
    console.log('Permissão concedida:', permission);
    
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'Z8JPXbqK-VKEfwLu8v7pHWkOleLr190syJKEGCJhXwc'
      });
      
      if (token) {
        console.log('✅ Token FCM obtido:', token);
        return token;
      } else {
        console.error('❌ Não foi possível obter o token FCM');
        return null;
      }
    } else {
      console.log('❌ Permissão para notificações negada');
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
