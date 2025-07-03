
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Clock, CheckCircle, Download, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Order {
  id: string;
  service: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  files: any[] | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast({
        title: "Erro ao carregar pedidos",
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
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
          : order
      ));

      toast({
        title: "Status atualizado",
        description: `Pedido marcado como ${newStatus}.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do pedido.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'novo':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Novo</Badge>;
      case 'lido':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Lido</Badge>;
      case 'em_andamento':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Em Andamento</Badge>;
      case 'concluido':
        return <Badge variant="outline" className="border-green-500 text-green-700">Concluído</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pedidos Recebidos</h2>
          <p className="text-gray-600">Gerencie todos os pedidos feitos através do site</p>
        </div>
        <Button onClick={fetchOrders} variant="outline">
          Atualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Total de Pedidos: {orders.length}</span>
          </CardTitle>
          <CardDescription>
            Pedidos ordenados do mais recente para o mais antigo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Nenhum pedido encontrado</p>
              <p className="text-sm">Os pedidos aparecerão aqui quando forem enviados pelo formulário do site</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Arquivos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.name}</p>
                          <p className="text-sm text-gray-500">{order.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{order.service}</TableCell>
                      <TableCell>
                        <a 
                          href={`https://wa.me/${order.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 underline"
                        >
                          {order.phone}
                        </a>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm truncate" title={order.description}>
                            {order.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.files && order.files.length > 0 ? (
                          <div className="space-y-1">
                            {order.files.map((file: any, index: number) => (
                              <div key={index} className="flex items-center space-x-2">
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span className="truncate max-w-20">{file.name}</span>
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">Nenhum</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {order.status === 'novo' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, 'lido')}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          {order.status === 'lido' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, 'em_andamento')}
                              className="text-yellow-600 hover:text-yellow-800"
                            >
                              <Clock className="w-4 h-4" />
                            </Button>
                          )}
                          {order.status === 'em_andamento' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, 'concluido')}
                              className="text-green-600 hover:text-green-800"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrders;
