
import { useState, useEffect } from 'react';
import { requestFCMToken, onForegroundMessage } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';

export const useFCM = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Verificar se o navegador suporta notificações
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      
      // Registrar service worker
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registrado:', registration);
        })
        .catch((error) => {
          console.error('Erro ao registrar Service Worker:', error);
        });

      // Configurar listener para mensagens em primeiro plano
      const unsubscribe = onForegroundMessage((payload) => {
        toast({
          title: payload.notification?.title || 'Nova Notificação',
          description: payload.notification?.body || 'Você tem uma nova mensagem',
          duration: 5000,
        });
      });

      return unsubscribe;
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      console.log('Notificações não suportadas neste navegador');
      return null;
    }

    try {
      const token = await requestFCMToken();
      setFcmToken(token);
      
      if (token) {
        // Salvar o token no localStorage para uso posterior
        localStorage.setItem('fcm-token', token);
        
        toast({
          title: "Notificações ativadas!",
          description: "Você receberá notificações sobre novos pedidos.",
        });
      }
      
      return token;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível ativar as notificações.",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    fcmToken,
    isSupported,
    requestPermission,
  };
};
