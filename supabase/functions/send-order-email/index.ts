import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FileData {
  name: string;
  url: string;
}

interface OrderRequest {
  service: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  files?: FileData[];
  orderId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== EDGE FUNCTION INICIADA ===");
    console.log("Timestamp:", new Date().toISOString());
    
    // Verificar se a API key está configurada
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error("❌ CRÍTICO: RESEND_API_KEY não encontrada nas variáveis de ambiente");
      return new Response(
        JSON.stringify({ 
          error: "RESEND_API_KEY não configurada",
          details: "A chave da API do Resend não está configurada no servidor"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    console.log("✅ RESEND_API_KEY encontrada, tamanho:", apiKey.length);

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
      email: orderData.email,
      phone: orderData.phone,
      filesCount: orderData.files?.length || 0,
      descriptionLength: orderData.description?.length || 0,
      orderId: orderData.orderId
    });

    // Validar campos obrigatórios
    const requiredFields = ['service', 'name', 'email', 'phone', 'description'];
    const missingFields = requiredFields.filter(field => !orderData[field as keyof OrderRequest]);
    
    if (missingFields.length > 0) {
      console.error("❌ Campos obrigatórios ausentes:", missingFields);
      return new Response(
        JSON.stringify({ 
          error: "Campos obrigatórios ausentes", 
          details: `Campos necessários: ${missingFields.join(', ')}` 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Preparar HTML do email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: #f97316; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎨 Novo Pedido - Rascunho Luminoso</h1>
        </div>
        
        <div style="padding: 30px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
            <h2 style="color: #374151; margin-top: 0;">👤 Informações do Cliente</h2>
            <p style="margin: 8px 0;"><strong>Nome:</strong> ${orderData.name}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${orderData.email}</p>
            <p style="margin: 8px 0;"><strong>WhatsApp:</strong> ${orderData.phone}</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
            <h2 style="color: #374151; margin-top: 0;">📋 Detalhes do Serviço</h2>
            <p style="margin: 8px 0;"><strong>Pedido ID:</strong> #${orderData.orderId.substring(0, 8)}</p>
            <p style="margin: 8px 0;"><strong>Serviço Solicitado:</strong> ${orderData.service}</p>
            <div style="margin-top: 15px;">
              <strong>Descrição do Projeto:</strong>
              <div style="background-color: white; padding: 15px; border-radius: 6px; margin-top: 8px; border: 1px solid #e5e7eb;">
                ${orderData.description.replace(/\n/g, '<br>')}
              </div>
            </div>
          </div>

          ${orderData.files && orderData.files.length > 0 ? `
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
            <h2 style="color: #374151; margin-top: 0;">📎 Arquivos Anexados (${orderData.files.length})</h2>
            ${orderData.files.map(file => `
              <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 10px 0; border: 1px solid #e5e7eb;">
                <p style="margin: 0 0 10px 0; font-weight: bold; color: #374151;">📄 ${file.name}</p>
                ${file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? `
                  <img src="${file.url}" alt="${file.name}" style="max-width: 100%; max-height: 300px; border-radius: 4px; margin: 10px 0;">
                ` : ''}
                <div style="margin-top: 10px;">
                  <a href="${file.url}" target="_blank" style="color: #f97316; text-decoration: none; font-weight: bold;">
                    🔗 Abrir arquivo
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
          ` : ''}

          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
            <h3 style="color: #92400e; margin: 0 0 10px 0;">⚡ Ação Necessária</h3>
            <p style="color: #92400e; margin: 0; font-weight: bold;">
              Responda este cliente o mais rápido possível!
            </p>
            <p style="color: #92400e; margin: 5px 0 0 0; font-size: 14px;">
              Cliente aguarda retorno em até 24 horas
            </p>
          </div>
        </div>

        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            Email enviado automaticamente pelo sistema Rascunho Luminoso<br>
            Data: ${new Date().toLocaleString('pt-BR', { timeZone: 'Africa/Luanda' })}
          </p>
        </div>
      </div>
    `;

    console.log("✅ Template do email preparado");
    console.log("📧 Tentando enviar email...");

    // Inicializar Resend
    let resend;
    try {
      resend = new Resend(apiKey);
      console.log("✅ Cliente Resend inicializado");
    } catch (resendInitError) {
      console.error("❌ Erro ao inicializar Resend:", resendInitError);
      return new Response(
        JSON.stringify({ 
          error: "Erro na inicialização do Resend",
          details: resendInitError.message 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Enviar email
    console.log("📤 Enviando para: rascunholuminoso@gmail.com");
    console.log("📤 Assunto:", `🎨 Novo Pedido: ${orderData.service} - ${orderData.name}`);
    
    let emailResponse;
    try {
      emailResponse = await resend.emails.send({
        from: "Rascunho Luminoso <onboarding@resend.dev>",
        to: ["rascunholuminoso@gmail.com"],
        subject: `🎨 Novo Pedido: ${orderData.service} - ${orderData.name}`,
        html: emailHtml,
      });
      
      console.log("📬 Resposta do Resend:", JSON.stringify(emailResponse, null, 2));
    } catch (emailSendError) {
      console.error("❌ ERRO ao enviar email:", emailSendError);
      console.error("❌ Tipo do erro:", typeof emailSendError);
      console.error("❌ Stack trace:", emailSendError.stack);
      
      return new Response(
        JSON.stringify({ 
          error: "Falha no envio do email",
          details: emailSendError.message,
          type: typeof emailSendError,
          timestamp: new Date().toISOString()
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Verificar resposta do Resend
    if (emailResponse.error) {
      console.error("❌ Erro retornado pelo Resend:", emailResponse.error);
      return new Response(
        JSON.stringify({ 
          error: "Erro do serviço Resend",
          details: emailResponse.error,
          resendResponse: emailResponse
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!emailResponse.data) {
      console.error("❌ Resposta do Resend sem dados:", emailResponse);
      return new Response(
        JSON.stringify({ 
          error: "Resposta inválida do Resend",
          details: "Sem dados na resposta",
          resendResponse: emailResponse
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("✅ EMAIL ENVIADO COM SUCESSO!");
    console.log("✅ ID do email:", emailResponse.data.id);

    // Tentar enviar notificação push (após o email ser enviado com sucesso)
    try {
      console.log("📱 Tentando enviar notificação push...");
      
      const firebaseServerKey = Deno.env.get("FIREBASE_SERVER_KEY");
      if (!firebaseServerKey) {
        console.warn("⚠️ FIREBASE_SERVER_KEY não encontrada, pulando notificação push");
      } else {
        // Token FCM do admin (você pode salvá-lo no banco ou usar um fixo)
        // Por enquanto, vamos tentar enviar para um tópico
        const fcmPayload = {
          to: "/topics/admin-notifications", // Usar tópicos para simplificar
          notification: {
            title: "🎨 Novo Pedido - Rascunho Luminoso",
            body: `${orderData.service} solicitado por ${orderData.name}`,
            icon: "/lovable-uploads/9d315dc9-03f6-4949-85dc-8c64f34b1b8f.png",
            badge: "/lovable-uploads/9d315dc9-03f6-4949-85dc-8c64f34b1b8f.png",
            tag: "new-order",
            requireInteraction: true
          },
          data: {
            orderId: orderData.orderId,
            service: orderData.service,
            customerName: orderData.name,
            timestamp: new Date().toISOString()
          }
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
          console.log("✅ Notificação push enviada com sucesso:", fcmResult);
        } else {
          const fcmError = await fcmResponse.text();
          console.error("❌ Erro ao enviar notificação push:", fcmError);
        }
      }
      
    } catch (pushError) {
      console.warn("⚠️ Erro ao enviar notificação push (não crítico):", pushError);
    }

    console.log("=== EDGE FUNCTION FINALIZADA COM SUCESSO ===");

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data.id,
      message: "Email enviado com sucesso para rascunholuminoso@gmail.com",
      notification: "Notificação push enviada para admin",
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
    console.error("❌ Tipo:", typeof globalError);
    console.error("❌ Nome:", globalError.name);
    console.error("❌ Mensagem:", globalError.message);
    console.error("❌ Stack:", globalError.stack);
    
    return new Response(
      JSON.stringify({ 
        error: "Erro interno do servidor",
        details: globalError.message,
        type: globalError.name,
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
