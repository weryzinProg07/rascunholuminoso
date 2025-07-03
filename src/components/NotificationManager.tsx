
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff } from 'lucide-react';
import { useFCM } from '@/hooks/useFCM';

const NotificationManager = () => {
  const { fcmToken, isSupported, requestPermission } = useFCM();

  useEffect(() => {
    // Verificar se já temos um token salvo
    const savedToken = localStorage.getItem('fcm-token');
    if (savedToken) {
      console.log('Token FCM já existe:', savedToken);
    }
  }, []);

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
          Receba notificações instantâneas quando novos pedidos chegarem.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Status: {fcmToken ? '✅ Ativadas' : '⚠️ Desativadas'}
            </p>
            {fcmToken && (
              <p className="text-xs text-gray-500">
                Token: {fcmToken.substring(0, 20)}...
              </p>
            )}
          </div>
          
          <Button 
            onClick={requestPermission}
            disabled={!!fcmToken}
            className="w-full"
          >
            {fcmToken ? 'Notificações Ativas' : 'Ativar Notificações'}
          </Button>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Certifique-se de permitir notificações quando solicitado</p>
            <p>• As notificações funcionam mesmo com o navegador fechado</p>
            <p>• Você pode desativar a qualquer momento nas configurações do navegador</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationManager;
