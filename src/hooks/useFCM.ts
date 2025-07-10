
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
      console.log('🔧 Inicializando gerenciador FCM...');
      
      // Verificar suporte básico do ambiente
      const hasNotificationSupport = 'Notification' in window;
      const hasServiceWorkerSupport = 'serviceWorker' in navigator;
      const isSecureContext = window.isSecureContext || 
                              window.location.hostname === 'localhost' ||
                              window.location.hostname === '127.0.0.1';

      console.log('🔍 Checagem de suporte:');
      console.log('  - Notificações:', hasNotificationSupport);
      console.log('  - Service Workers:', hasServiceWorkerSupport);
      console.log('  - Contexto seguro:', isSecureContext);

      const supported = hasNotificationSupport && hasServiceWorkerSupport && isSecureContext;
      setIsSupported(supported);

      if (supported) {
        const currentPermission = Notification.permission;
        setPermissionStatus(currentPermission);
        console.log('📋 Permissão atual:', currentPermission);
        
        // Verificar se já temos token salvo
        const savedToken = localStorage.getItem('fcm-admin-token');
        if (savedToken && currentPermission === 'granted') {
          console.log('💾 Token recuperado do localStorage');
          setFcmToken(savedToken);
        }

        // Configurar listener para mensagens em primeiro plano
        const unsubscribe = onForegroundMessage((payload) => {
          console.log('📨 Mensagem recebida em primeiro plano:', payload);
          
          toast({
            title: "🔔 Novo pedido recebido!",
            description: "Você recebeu um novo pedido no site da Rascunho Luminoso.",
            duration: 8000,
          });
        });

        return unsubscribe;
      } else {
        console.log('❌ Ambiente não suporta notificações push');
      }
    };

    initializeFCM();
  }, []);

  const saveAdminToken = async (token: string) => {
    try {
      console.log('💾 Salvando token do administrador...');
      
      const { error } = await supabase.rpc('upsert_fcm_token', {
        p_token: token,
        p_user_type: 'admin',
        p_is_active: true
      });

      if (error) {
        console.error('❌ Erro ao salvar token:', error);
        throw error;
      }

      console.log('✅ Token salvo no backend com sucesso');
      
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
      console.log('🚀 === INICIANDO ATIVAÇÃO DE NOTIFICAÇÕES ===');
      
      toast({
        title: "🔔 Configurando notificações...",
        description: "Aguarde enquanto configuramos as notificações push.",
        duration: 3000,
      });

      const token = await requestFCMToken();
      
      if (token) {
        console.log('✅ Token obtido:', token.substring(0, 20) + '...');
        
        setFcmToken(token);
        setPermissionStatus('granted');
        
        // Salvar localmente e no backend
        localStorage.setItem('fcm-admin-token', token);
        await saveAdminToken(token);
        
        console.log('✅ === NOTIFICAÇÕES ATIVADAS COM SUCESSO ===');
        
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
      console.error('❌ === ERRO NA ATIVAÇÃO ===');
      console.error('❌ Erro completo:', error);
      
      let userMessage = "Não foi possível ativar as notificações.";
      let userAction = "";
      
      if (error.message.includes('negada') || error.message.includes('denied')) {
        userMessage = "Permissão negada para notificações.";
        userAction = "Clique no ícone de cadeado na barra de endereços e permita notificações, ou vá em Configurações do navegador.";
      } else if (error.message.includes('HTTPS')) {
        userMessage = "Notificações requerem conexão segura.";
        userAction = "Acesse o site via HTTPS.";
      } else if (error.message.includes('bloqueada')) {
        userMessage = "Notificações bloqueadas.";
        userAction = "Vá em Configurações > Privacidade > Notificações e permita para este site.";
      }
      
      toast({
        title: "❌ Erro ao ativar notificações",
        description: userMessage + (userAction ? " " + userAction : ""),
        variant: "destructive",
        duration: 15000,
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const disableNotifications = async () => {
    try {
      if (fcmToken) {
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
      
      console.log('🔕 Notificações desativadas');
    } catch (error) {
      console.error('❌ Erro ao desativar:', error);
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

      console.log('🧪 Executando teste de notificação...');
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
