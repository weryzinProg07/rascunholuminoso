
import { useState, useEffect } from 'react';
import { requestFCMToken, onForegroundMessage, testLocalNotification } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useFCM = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    const initializeFCM = async () => {
      // Verificar suporte básico
      const hasNotificationSupport = 'Notification' in window;
      const hasServiceWorkerSupport = 'serviceWorker' in navigator;
      const isValidProtocol = window.location.protocol === 'https:' || 
                              window.location.hostname === 'localhost' ||
                              window.location.hostname === '127.0.0.1';

      console.log('🔍 Verificando suporte:');
      console.log('  - Notificações:', hasNotificationSupport);
      console.log('  - Service Workers:', hasServiceWorkerSupport);
      console.log('  - Protocolo válido:', isValidProtocol);

      const supported = hasNotificationSupport && hasServiceWorkerSupport && isValidProtocol;
      setIsSupported(supported);

      if (supported) {
        setPermissionStatus(Notification.permission);
        
        // Verificar se já temos token salvo e válido
        const savedToken = localStorage.getItem('fcm-admin-token');
        if (savedToken && Notification.permission === 'granted') {
          setFcmToken(savedToken);
          console.log('✅ Token FCM recuperado do localStorage:', savedToken.substring(0, 20) + '...');
        }

        // Configurar listener para mensagens em primeiro plano
        const unsubscribe = onForegroundMessage((payload) => {
          console.log('📱 Notificação recebida em primeiro plano:', payload);
          
          toast({
            title: "🔔 Novo pedido recebido!",
            description: "Você recebeu um novo pedido no site da Rascunho Luminoso.",
            duration: 8000,
          });
        });

        return unsubscribe;
      } else {
        console.log('❌ Plataforma não suporta notificações push completas');
      }
    };

    initializeFCM();
  }, []);

  const saveAdminToken = async (token: string) => {
    try {
      console.log('💾 Salvando token do administrador no backend...');
      
      // Usar a função RPC do Supabase para salvar o token
      const { error } = await supabase.rpc('upsert_fcm_token', {
        p_token: token,
        p_user_type: 'admin',
        p_is_active: true
      });

      if (error) {
        console.error('❌ Erro ao salvar token no Supabase:', error);
        throw error;
      }

      console.log('✅ Token do administrador salvo com sucesso no backend');
      
    } catch (error: any) {
      console.error('❌ Erro ao comunicar com backend:', error);
      throw new Error(`Erro ao salvar no servidor: ${error.message}`);
    }
  };

  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: "❌ Não suportado",
        description: "Seu navegador ou conexão não suporta notificações push. Use HTTPS, Chrome, Firefox ou Safari.",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);

    try {
      console.log('🚀 Iniciando processo de ativação de notificações...');
      
      // Mostrar toast informativo
      toast({
        title: "🔔 Configurando notificações...",
        description: "Por favor, permita as notificações quando solicitado.",
        duration: 5000,
      });

      const token = await requestFCMToken();
      
      if (token) {
        setFcmToken(token);
        setPermissionStatus('granted');
        
        // Salvar token localmente e no backend
        localStorage.setItem('fcm-admin-token', token);
        await saveAdminToken(token);
        
        console.log('✅ Processo de ativação concluído com sucesso!');
        
        toast({
          title: "✅ Notificações ativadas!",
          description: "Você receberá alertas sobre novos pedidos, mesmo com o navegador fechado.",
          duration: 8000,
        });
        
        return token;
      } else {
        throw new Error('Token FCM não foi gerado');
      }
      
    } catch (error: any) {
      console.error('❌ Erro no processo de ativação:', error);
      
      let userMessage = "Não foi possível ativar as notificações.";
      
      if (error.message.includes('negada')) {
        userMessage = "Permissão negada. Clique no ícone de cadeado na barra de endereços e permita notificações.";
      } else if (error.message.includes('HTTPS')) {
        userMessage = "Notificações requerem HTTPS. Acesse o site via HTTPS.";
      } else if (error.message.includes('bloqueada')) {
        userMessage = "Notificações bloqueadas. Vá em configurações do navegador > notificações e permita para este site.";
      }
      
      toast({
        title: "❌ Erro ao ativar notificações",
        description: userMessage,
        variant: "destructive",
        duration: 10000,
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const disableNotifications = async () => {
    try {
      if (fcmToken) {
        // Desativar token no backend
        console.log('🔕 Desativando token no backend...');
        await supabase
          .from('fcm_tokens')
          .update({ is_active: false })
          .eq('token', fcmToken);
      }
      
      setFcmToken(null);
      localStorage.removeItem('fcm-admin-token');
      
      toast({
        title: "🔕 Notificações desativadas",
        description: "Você não receberá mais notificações push.",
      });
      
      console.log('🔕 Notificações desativadas pelo usuário');
    } catch (error) {
      console.error('❌ Erro ao desativar notificações:', error);
      toast({
        title: "⚠️ Erro",
        description: "Erro ao desativar notificações, mas foram removidas localmente.",
        variant: "destructive",
      });
    }
  };

  const testNotification = () => {
    try {
      if (Notification.permission !== 'granted') {
        toast({
          title: "❌ Permissão necessária",
          description: "Ative as notificações primeiro para fazer o teste.",
          variant: "destructive",
        });
        return;
      }

      console.log('🧪 Testando notificação local...');
      testLocalNotification();
      
      toast({
        title: "🧪 Teste enviado",
        description: "Se as notificações estão funcionando, você verá uma notificação do sistema agora.",
        duration: 5000,
      });
      
    } catch (error: any) {
      console.error('❌ Erro no teste:', error);
      toast({
        title: "❌ Erro no teste",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    fcmToken,
    isSupported,
    isLoading,
    permissionStatus,
    requestPermission,
    disableNotifications,
    testNotification,
  };
};
