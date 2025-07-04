
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw, Settings, Zap } from 'lucide-react';
import { useFCM } from '@/hooks/useFCM';
import { Alert, AlertDescription } from '@/components/ui/alert';

const NotificationManager = () => {
  const { 
    fcmToken, 
    isSupported, 
    isLoading, 
    permissionStatus, 
    requestPermission, 
    disableNotifications,
    resetPermissions,
    forceActivation
  } = useFCM();

  const getStatusInfo = () => {
    if (!isSupported) {
      return {
        icon: <XCircle className="h-5 w-5 text-red-500" />,
        status: 'Não Suportado',
        color: 'text-red-500'
      };
    }

    if (fcmToken) {
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        status: 'Ativas',
        color: 'text-green-500'
      };
    }

    return {
      icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      status: 'Desativadas',
      color: 'text-yellow-500'
    };
  };

  const statusInfo = getStatusInfo();

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BellOff className="h-5 w-5" />
            <span>Notificações não suportadas</span>
          </CardTitle>
          <CardDescription>
            Seu navegador não suporta notificações push ou service workers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Para receber notificações, use um navegador moderno como Chrome, Firefox ou Safari.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Notificações Push - Administrador</span>
        </CardTitle>
        <CardDescription>
          Receba notificações instantâneas quando novos pedidos chegarem, mesmo com o navegador fechado.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status das Notificações */}
        <div className="flex items-center space-x-2">
          {statusInfo.icon}
          <span className={`font-medium ${statusInfo.color}`}>
            Status: {statusInfo.status}
          </span>
        </div>

        {/* Informações do Token */}
        {fcmToken && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700 font-medium">
              ✅ Notificações configuradas com sucesso!
            </p>
            <p className="text-xs text-green-600 mt-1 font-mono break-all">
              Token: {fcmToken.substring(0, 30)}...
            </p>
          </div>
        )}

        {/* Instruções para Ativar */}
        {!fcmToken && (
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              <strong>🔧 MODO ADMINISTRADOR - SEM BLOQUEIOS:</strong>
              <br />
              <br />
              Clique em qualquer um dos botões abaixo para ativar as notificações.
              <br />
              Se um não funcionar, tente o próximo.
            </AlertDescription>
          </Alert>
        )}

        {/* Botões de Controle */}
        <div className="flex gap-2 flex-wrap">
          {!fcmToken ? (
            <>
              <Button 
                onClick={requestPermission}
                disabled={isLoading}
                className="flex-1 min-w-[180px]"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Ativando...
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 mr-2" />
                    Ativar Notificações
                  </>
                )}
              </Button>
              
              <Button 
                onClick={forceActivation}
                disabled={isLoading}
                variant="secondary"
                className="flex-1 min-w-[180px]"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Forçando...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    FORÇAR ATIVAÇÃO
                  </>
                )}
              </Button>
              
              <Button 
                onClick={resetPermissions}
                variant="outline"
                className="flex-1 min-w-[180px]"
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Resetar e Recarregar
              </Button>
            </>
          ) : (
            <Button 
              onClick={disableNotifications}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <BellOff className="w-4 h-4 mr-2" />
              Desativar Notificações
            </Button>
          )}
        </div>

        {/* Instruções para Administrador */}
        <div className="text-xs text-gray-500 space-y-1 p-3 bg-blue-50 rounded-lg">
          <p className="font-medium text-blue-700">👨‍💼 MODO ADMINISTRADOR:</p>
          <p>• TODOS OS BLOQUEIOS FORAM REMOVIDOS</p>
          <p>• Clique em "Ativar Notificações" primeiro</p>
          <p>• Se não funcionar, clique em "FORÇAR ATIVAÇÃO"</p>
          <p>• Use "Resetar e Recarregar" se necessário</p>
          <p>• As notificações funcionarão mesmo com o navegador fechado</p>
        </div>

        {/* Teste de Notificação */}
        {fcmToken && (
          <Button 
            onClick={() => {
              if (Notification.permission === 'granted') {
                new Notification('🧪 Teste - Rascunho Luminoso', {
                  body: 'Esta é uma notificação de teste! Se você vê isso, as notificações estão funcionando.',
                  icon: '/lovable-uploads/9d315dc9-03f6-4949-85dc-8c64f34b1b8f.png',
                  tag: 'test-notification',
                  requireInteraction: true
                });
              } else {
                // Mesmo sem permissão, tentar mostrar notificação
                try {
                  new Notification('🧪 Teste Forçado - Rascunho Luminoso', {
                    body: 'Notificação de teste forçada!',
                    icon: '/lovable-uploads/9d315dc9-03f6-4949-85dc-8c64f34b1b8f.png',
                  });
                } catch (error) {
                  console.log('Erro na notificação de teste:', error);
                  alert('🧪 Teste: Notificações estão ativas! (mostrado como alerta)');
                }
              }
            }}
            variant="secondary"
            size="sm"
            className="w-full"
          >
            🧪 Enviar Notificação de Teste
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationManager;
