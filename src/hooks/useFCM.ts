
import { useState, useEffect } from 'react';
import { requestFCMToken, onForegroundMessage } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';

export const useFCM = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Verificar suporte a notificações
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermissionStatus(Notification.permission);
      
      // Verificar se já temos token salvo
      const savedToken = localStorage.getItem('fcm-token');
      if (savedToken && Notification.permission === 'granted') {
        setFcmToken(savedToken);
        console.log('✅ Token FCM recuperado do localStorage:', savedToken);
      }

      // Registrar service worker
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado:', registration);
        })
        .catch((error) => {
          console.error('❌ Erro ao registrar Service Worker:', error);
        });

      // Configurar listener para mensagens em primeiro plano
      const unsubscribe = onForegroundMessage((payload) => {
        console.log('📱 Notificação recebida em primeiro plano:', payload);
        
        toast({
          title: payload.notification?.title || 'Nova Notificação',
          description: payload.notification?.body || 'Você tem uma nova mensagem',
          duration: 5000,
        });
      });

      return unsubscribe;
    } else {
      console.log('❌ Notificações não suportadas neste navegador');
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: "Erro",
        description: "Notificações não suportadas neste navegador.",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);

    try {
      console.log('🔔 Solicitando permissão para notificações...');
      
      const token = await requestFCMToken();
      
      if (token) {
        setFcmToken(token);
        setPermissionStatus('granted');
        
        // Salvar o token no localStorage
        localStorage.setItem('fcm-token', token);
        
        console.log('✅ Notificações ativadas com sucesso!');
        
        toast({
          title: "✅ Notificações ativadas!",
          description: "Você receberá notificações sobre novos pedidos.",
        });
        
        return token;
      } else {
        setPermissionStatus(Notification.permission);
        
        toast({
          title: "❌ Erro",
          description: "Não foi possível ativar as notificações. Verifique as permissões do navegador.",
          variant: "destructive",
        });
        
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao solicitar permissão:', error);
      setPermissionStatus(Notification.permission);
      
      toast({
        title: "❌ Erro",
        description: "Erro ao ativar notificações. Tente novamente.",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const disableNotifications = () => {
    setFcmToken(null);
    localStorage.removeItem('fcm-token');
    
    toast({
      title: "🔕 Notificações desativadas",
      description: "Você não receberá mais notificações push.",
    });
    
    console.log('🔕 Notificações desativadas pelo usuário');
  };

  return {
    fcmToken,
    isSupported,
    isLoading,
    permissionStatus,
    requestPermission,
    disableNotifications,
  };
};
