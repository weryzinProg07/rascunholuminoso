
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderRequest {
  service: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  files?: any[];
  orderId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== EDGE FUNCTION PUSH NOTIFICATION INICIADA ===");
    console.log("Timestamp:", new Date().toISOString());
    
    // Verificar se a chave do servidor Firebase está configurada
    const firebaseServerKey = Deno.env.get("FIREBASE_SERVER_KEY");
    if (!firebaseServerKey) {
      console.error("❌ CRÍTICO: FIREBASE_SERVER_KEY não encontrada nas variáveis de ambiente");
      return new Response(
        JSON.stringify({ 
          error: "FIREBASE_SERVER_KEY não configurada",
          details: "A chave do servidor Firebase não está configurada"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    console.log("✅ FIREBASE_SERVER_KEY encontrada");

    // Verificar se é uma requisição POST válida
    if (req.method !== "POST") {
      console.error("❌ Método inválido:", req.method);
      return new Response(
        JSON.stringify({ error: `Método ${req.method} não permitido` }),
        {
          status: 405,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Ler dados da requisição
    let orderData: OrderRequest;
    try {
      const rawData = await req.text();
      console.log("📥 Dados recebidos (primeiros 200 chars):", rawData.substring(0, 200));
      orderData = JSON.parse(rawData);
    } catch (parseError) {
      console.error("❌ Erro ao fazer parse dos dados:", parseError);
      return new Response(
        JSON.stringify({ 
          error: "Dados inválidos", 
          details: "JSON malformado na requisição" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("✅ Dados do pedido validados:", {
      service: orderData.service,
      name: orderData.name,
      filesCount: orderData.files?.length || 0,
      orderId: orderData.orderId
    });

    // Buscar tokens FCM ativos dos administradores
    console.log("🔍 Buscando tokens FCM dos administradores...");
    
    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: tokens, error: tokensError } = await supabase
      .from('fcm_tokens')
      .select('token')
      .eq('user_type', 'admin')
      .eq('is_active', true);

    if (tokensError) {
      console.error("❌ Erro ao buscar tokens FCM:", tokensError);
      return new Response(
        JSON.stringify({ 
          error: "Erro ao buscar tokens",
          details: tokensError.message 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!tokens || tokens.length === 0) {
      console.log("⚠️ Nenhum token FCM ativo encontrado para administradores");
      return new Response(JSON.stringify({ 
        success: true,
        message: "Nenhum administrador com notificações ativas",
        sentCount: 0
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`📱 Encontrados ${tokens.length} tokens FCM ativos`);

    // Preparar payload da notificação
    const notificationPayload = {
      notification: {
        title: "Novo pedido recebido",
        body: "Você recebeu um novo pedido no site da Rascunho Luminoso.",
        icon: "/lovable-uploads/9d315dc9-03f6-4949-85dc-8c64f34b1b8f.png",
        badge: "/lovable-uploads/9d315dc9-03f6-4949-85dc-8c64f34b1b8f.png",
        tag: "new-order",
        requireInteraction: true,
        click_action: "/admin"
      },
      data: {
        orderId: orderData.orderId,
        service: orderData.service,
        customerName: orderData.name,
        timestamp: new Date().toISOString(),
        url: "/admin"
      }
    };

    // Enviar notificação para cada token
    let successCount = 0;
    let failCount = 0;

    for (const tokenData of tokens) {
      try {
        console.log(`📤 Enviando notificação para token: ${tokenData.token.substring(0, 20)}...`);

        const fcmPayload = {
          to: tokenData.token,
          ...notificationPayload
        };

        const fcmResponse = await fetch("https://fcm.googleapis.com/fcm/send", {
          method: "POST",
          headers: {
            "Authorization": `key=${firebaseServerKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fcmPayload),
        });

        if (fcmResponse.ok) {
          const fcmResult = await fcmResponse.json();
          console.log("✅ Notificação enviada com sucesso:", fcmResult);
          successCount++;
        } else {
          const fcmError = await fcmResponse.text();
          console.error("❌ Erro ao enviar notificação:", fcmError);
          failCount++;
        }
      } catch (pushError) {
        console.error("❌ Erro ao processar token:", pushError);
        failCount++;
      }
    }

    console.log(`📊 Resultado: ${successCount} enviadas, ${failCount} falharam`);
    console.log("=== EDGE FUNCTION FINALIZADA ===");

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Notificações enviadas para ${successCount} administradores`,
      sentCount: successCount,
      failedCount: failCount,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (globalError: any) {
    console.error("❌ ERRO GLOBAL na edge function:", globalError);
    
    return new Response(
      JSON.stringify({ 
        error: "Erro interno do servidor",
        details: globalError.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
