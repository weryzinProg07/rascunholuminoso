
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useFCM } from '@/hooks/useFCM';
import { Alert, AlertDescription } from '@/components/ui/alert';

const NotificationManager = () => {
  const { 
    fcmToken, 
    isSupported, 
    isLoading, 
    permissionStatus, 
    requestPermission, 
    disableNotifications 
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

    if (permissionStatus === 'denied') {
      return {
        icon: <XCircle className="h-5 w-5 text-red-500" />,
        status: 'Bloqueadas',
        color: 'text-red-500'
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
          <span>Notificações Push</span>
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

        {/* Aviso de Permissão Negada */}
        {permissionStatus === 'denied' && (
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Permissão negada!</strong> Para ativar as notificações:
              <br />
              1. Clique no ícone de cadeado na barra de endereços
              <br />
              2. Permita notificações para este site
              <br />
              3. Recarregue a página e tente novamente
            </AlertDescription>
          </Alert>
        )}

        {/* Botões de Controle */}
        <div className="flex gap-2">
          {!fcmToken ? (
            <Button 
              onClick={requestPermission}
              disabled={isLoading || permissionStatus === 'denied'}
              className="flex-1"
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
          ) : (
            <Button 
              onClick={disableNotifications}
              variant="outline"
              className="flex-1"
            >
              <BellOff className="w-4 h-4 mr-2" />
              Desativar Notificações
            </Button>
          )}
        </div>

        {/* Instruções */}
        <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-50 rounded-lg">
          <p className="font-medium text-gray-700">📋 Como funciona:</p>
          <p>• Clique em "Ativar Notificações" e permita quando solicitado</p>
          <p>• Receberá notificações mesmo com o navegador fechado</p>
          <p>• Pode desativar a qualquer momento</p>
          <p>• As notificações chegam apenas no dispositivo onde foi ativado</p>
        </div>

        {/* Teste de Notificação */}
        {fcmToken && (
          <Button 
            onClick={() => {
              new Notification('Teste - Rascunho Luminoso', {
                body: 'Esta é uma notificação de teste!',
                icon: '/lovable-uploads/9d315dc9-03f6-4949-85dc-8c64f34b1b8f.png'
              });
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
