
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, Loader2, CheckCircle, XCircle, AlertCircle, TestTube } from 'lucide-react';
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
    testNotification
  } = useFCM();

  const getStatusInfo = () => {
    if (!isSupported) {
      return {
        icon: <XCircle className="h-5 w-5 text-red-500" />,
        status: 'Não Suportado',
        color: 'text-red-500',
        description: 'Seu navegador não suporta notificações push'
      };
    }

    if (fcmToken && permissionStatus === 'granted') {
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        status: 'Ativo e Funcionando',
        color: 'text-green-500',
        description: 'Você está apto a receber notificações neste dispositivo'
      };
    }

    return {
      icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      status: 'Inativo',
      color: 'text-yellow-500',
      description: 'Clique em "Ativar Notificações" para começar a receber alertas'
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
            Seu navegador não suporta notificações push. Use Chrome, Firefox ou Safari para receber alertas.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Notificações Push - Sistema Administrativo</span>
        </CardTitle>
        <CardDescription>
          Receba alertas instantâneos quando novos pedidos chegarem, mesmo com o navegador fechado (como WhatsApp).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status das Notificações */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            {statusInfo.icon}
            <div>
              <p className={`font-medium ${statusInfo.color}`}>
                Status: {statusInfo.status}
              </p>
              <p className="text-sm text-gray-600">
                {statusInfo.description}
              </p>
            </div>
          </div>
        </div>

        {/* Token ativo */}
        {fcmToken && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              <strong>✅ Notificações configuradas com sucesso!</strong>
              <br />
              Este dispositivo receberá alertas sobre novos pedidos, mesmo com o navegador fechado.
              <br />
              <span className="text-xs font-mono">
                Token: {fcmToken.substring(0, 30)}...
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Instruções */}
        {!fcmToken && (
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              <strong>Como ativar:</strong>
              <br />
              1. Clique em "Ativar Notificações Push"
              <br />
              2. Permita as notificações quando o navegador solicitar
              <br />
              3. Pronto! Você receberá alertas sobre novos pedidos
            </AlertDescription>
          </Alert>
        )}

        {/* Botões de Controle */}
        <div className="flex gap-3 flex-wrap">
          {!fcmToken ? (
            <Button 
              onClick={requestPermission}
              disabled={isLoading}
              className="flex-1 min-w-[200px]"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Configurando...
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Ativar Notificações Push
                </>
              )}
            </Button>
          ) : (
            <>
              <Button 
                onClick={testNotification}
                variant="secondary"
                size="lg"
                className="flex-1"
              >
                <TestTube className="w-4 h-4 mr-2" />
                Testar Notificação
              </Button>
              
              <Button 
                onClick={disableNotifications}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <BellOff className="w-4 h-4 mr-2" />
                Desativar
              </Button>
            </>
          )}
        </div>

        {/* Informações técnicas */}
        <div className="text-xs text-gray-500 space-y-1 p-3 bg-blue-50 rounded-lg border">
          <p className="font-medium text-blue-700">📱 Como funciona:</p>
          <p>• As notificações funcionam mesmo com o navegador fechado</p>
          <p>• Apenas 1 dispositivo admin pode estar ativo por vez</p>
          <p>• Se outro dispositivo ativar, este será desativado automaticamente</p>
          <p>• Use "Testar Notificação" para verificar se está funcionando</p>
          <p>• As notificações aparecem na central do sistema (como WhatsApp)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationManager;
