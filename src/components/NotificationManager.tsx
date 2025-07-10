
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, Loader2, CheckCircle, XCircle, AlertCircle, TestTube, Settings } from 'lucide-react';
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
        description: 'Seu navegador não suporta notificações push ou não está em HTTPS'
      };
    }

    if (fcmToken && permissionStatus === 'granted') {
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        status: 'Ativo e Funcionando',
        color: 'text-green-500',
        description: 'Você receberá notificações sobre novos pedidos, mesmo com o navegador fechado'
      };
    }

    if (permissionStatus === 'denied') {
      return {
        icon: <XCircle className="h-5 w-5 text-red-500" />,
        status: 'Permissão Negada',
        color: 'text-red-500',
        description: 'Vá nas configurações do navegador e permita notificações para este site'
      };
    }

    return {
      icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      status: 'Inativo',
      color: 'text-yellow-500',
      description: 'Clique em "Ativar Notificações Push" para começar a receber alertas'
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
            Seu navegador não suporta notificações push ou o site não está sendo acessado via HTTPS.
            Use Chrome, Firefox ou Safari em conexão segura (HTTPS).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <Settings className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <strong>Como resolver:</strong>
              <br />
              • Acesse o site via HTTPS (não HTTP)
              <br />
              • Use um navegador moderno (Chrome, Firefox, Safari)
              <br />
              • Certifique-se de que está em localhost ou domínio seguro
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

        {/* Permissão negada - instruções especiais */}
        {permissionStatus === 'denied' && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <strong>❌ Permissão negada</strong>
              <br />
              <strong>Como resolver:</strong>
              <br />
              1. Clique no ícone de cadeado/notificação na barra de endereços
              <br />
              2. Ou vá em Configurações do navegador → Privacidade → Notificações
              <br />
              3. Permita notificações para este site
              <br />
              4. Recarregue a página e tente novamente
            </AlertDescription>
          </Alert>
        )}

        {/* Token ativo */}
        {fcmToken && permissionStatus === 'granted' && (
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

        {/* Instruções para ativar */}
        {!fcmToken && permissionStatus !== 'denied' && (
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              <strong>Como ativar notificações:</strong>
              <br />
              1. Clique em "Ativar Notificações Push"
              <br />
              2. Permita as notificações quando o navegador solicitar
              <br />
              3. Teste a funcionalidade para verificar se está funcionando
              <br />
              4. Pronto! Você receberá alertas sobre novos pedidos
            </AlertDescription>
          </Alert>
        )}

        {/* Botões de Controle */}
        <div className="flex gap-3 flex-wrap">
          {!fcmToken && permissionStatus !== 'denied' ? (
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
          ) : permissionStatus === 'denied' ? (
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              <Settings className="w-4 h-4 mr-2" />
              Recarregar após permitir
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
          <p>• Funciona apenas em HTTPS ou localhost</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationManager;
