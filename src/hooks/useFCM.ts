
import { useState, useEffect } from 'react';
import { requestFCMToken, onForegroundMessage } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      const savedToken = localStorage.getItem('fcm-admin-token');
      if (savedToken && Notification.permission === 'granted') {
        setFcmToken(savedToken);
        console.log('✅ Token FCM recuperado:', savedToken);
      }

      // Configurar listener para mensagens em primeiro plano
      const unsubscribe = onForegroundMessage((payload) => {
        console.log('📱 Notificação recebida em primeiro plano:', payload);
        
        toast({
          title: "Novo pedido recebido!",
          description: "Você recebeu um novo pedido no site da Rascunho Luminoso.",
          duration: 8000,
        });
      });

      return unsubscribe;
    } else {
      console.log('❌ Notificações não suportadas neste navegador');
    }
  }, []);

  const saveAdminToken = async (token: string) => {
    try {
      console.log('💾 Salvando token do administrador:', token.substring(0, 20) + '...');
      
      // Primeiro, desativar todos os tokens existentes
      const { error: deactivateError } = await supabase
        .from('fcm_tokens')
        .update({ is_active: false })
        .eq('user_type', 'admin');

      if (deactivateError) {
        console.warn('⚠️ Erro ao desativar tokens antigos:', deactivateError);
      }

      // Salvar o novo token como ativo
      const { error } = await supabase.rpc('upsert_fcm_token', {
        p_token: token,
        p_user_type: 'admin',
        p_is_active: true
      });

      if (error) {
        console.error('❌ Erro ao salvar token do admin:', error);
        throw error;
      } else {
        console.log('✅ Token do administrador salvo com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro ao comunicar com backend:', error);
      throw error;
    }
  };

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
      console.log('🔔 Solicitando permissões e configurando notificações...');
      
      const token = await requestFCMToken();
      
      if (token) {
        setFcmToken(token);
        setPermissionStatus('granted');
        
        // Salvar o token no localStorage e backend
        localStorage.setItem('fcm-admin-token', token);
        await saveAdminToken(token);
        
        console.log('✅ Notificações configuradas com sucesso!');
        
        toast({
          title: "✅ Notificações ativadas!",
          description: "Você receberá notificações push sobre novos pedidos, mesmo com o navegador fechado.",
          duration: 6000,
        });
        
        return token;
      } else {
        throw new Error('Não foi possível obter o token FCM');
      }
    } catch (error: any) {
      console.error('❌ Erro ao configurar notificações:', error);
      
      toast({
        title: "❌ Erro ao ativar notificações",
        description: error.message || "Não foi possível ativar as notificações. Verifique se o navegador permite notificações.",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const disableNotifications = async () => {
    try {
      if (fcmToken) {
        // Desativar o token no backend
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
      console.error('Erro ao desativar notificações:', error);
    }
  };

  const testNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('🧪 Teste - Rascunho Luminoso', {
        body: 'Esta é uma notificação de teste! Se você vê isso, as notificações estão funcionando perfeitamente.',
        icon: '/lovable-uploads/9d315dc9-03f6-4949-85dc-8c64f34b1b8f.png',
        tag: 'test-notification',
        requireInteraction: true
      });
    } else {
      toast({
        title: "🧪 Teste",
        description: "Permissão para notificações não concedida.",
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
