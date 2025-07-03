import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ShoppingBag, Mail, Phone, User, Calendar, FileText, Download, Trash2 } from 'lucide-react';

interface Order {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  description: string;
  status: string;
  files: any;
  created_at: string;
  updated_at: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setOrders(data || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pedidos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      toast({
        title: "Status atualizado",
        description: `Pedido marcado como ${newStatus}.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do pedido.",
        variant: "destructive",
      });
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Tem certeza que deseja apagar este pedido? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      console.log('Tentando apagar pedido:', orderId);
      
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      console.log('Pedido apagado com sucesso');
      
      // Atualizar a lista local removendo o pedido apagado
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));

      toast({
        title: "Pedido apagado",
        description: "O pedido foi removido permanentemente.",
      });
    } catch (error) {
      console.error('Erro ao apagar pedido:', error);
      toast({
        title: "Erro",
        description: "Não foi possível apagar o pedido.",
        variant: "destructive",
      });
    }
  };

  const downloadFile = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error('Falha ao baixar o arquivo');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download iniciado",
        description: `Fazendo download de ${fileName}`,
      });
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer o download do arquivo.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'novo': return 'bg-blue-100 text-blue-800';
      case 'em_andamento': return 'bg-yellow-100 text-yellow-800';
      case 'concluido': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pedidos Recebidos</h2>
          <p className="text-gray-600">Gerencie os pedidos dos clientes</p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {orders.length} pedidos
        </Badge>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-500">Os pedidos dos clientes aparecerão aqui.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <Card key={order.id} className="border-l-4 border-l-orange-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 p-2 rounded-full">
                      <ShoppingBag className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{order.service}</CardTitle>
                      <CardDescription>
                        Pedido #{order.id.slice(0, 8)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{order.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{order.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{order.phone}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <FileText className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="font-medium text-sm">Descrição:</p>
                        <p className="text-gray-600 text-sm">{order.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {order.files && Array.isArray(order.files) && order.files.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="font-medium text-sm mb-2">Arquivos anexados:</p>
                    <div className="grid gap-2">
                      {order.files.map((file: any, index: number) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{file.name || `Arquivo ${index + 1}`}</span>
                          </div>
                          {file.url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadFile(file.url, file.name || `arquivo_${index + 1}`)}
                              className="flex items-center space-x-1"
                            >
                              <Download className="h-3 w-3" />
                              <span>Download</span>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'em_andamento')}
                      disabled={order.status === 'em_andamento'}
                      className="bg-yellow-500 hover:bg-yellow-600"
                    >
                      Em Andamento
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'concluido')}
                      disabled={order.status === 'concluido'}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      Concluído
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateOrderStatus(order.id, 'cancelado')}
                      disabled={order.status === 'cancelado'}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Cancelar
                    </Button>
                  </div>
                  
                  {order.status === 'concluido' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteOrder(order.id)}
                      className="flex items-center space-x-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Apagar</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
