
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const orderData: OrderRequest = await req.json();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">Novo Pedido - Rascunho Luminoso</h2>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Detalhes do Cliente:</h3>
          <p><strong>Nome:</strong> ${orderData.name}</p>
          <p><strong>Email:</strong> ${orderData.email}</p>
          <p><strong>WhatsApp:</strong> ${orderData.phone}</p>
        </div>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Detalhes do Pedido:</h3>
          <p><strong>Serviço:</strong> ${orderData.service}</p>
          <p><strong>Descrição:</strong></p>
          <p style="background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid #f97316;">
            ${orderData.description}
          </p>
        </div>

        ${orderData.files && orderData.files.length > 0 ? `
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Arquivos Anexados:</h3>
          ${orderData.files.map(file => `
            <div style="margin-bottom: 15px; padding: 10px; background-color: white; border-radius: 4px;">
              <p style="margin: 0; font-weight: bold;">${file.name}</p>
              ${file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? `
                <img src="${file.url}" alt="${file.name}" style="max-width: 300px; max-height: 200px; margin-top: 10px; border-radius: 4px;">
              ` : ''}
              <p style="margin: 5px 0 0 0;">
                <a href="${file.url}" target="_blank" style="color: #f97316; text-decoration: none;">
                  📁 Ver arquivo
                </a>
              </p>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #fef3c7; border-radius: 8px;">
          <p style="margin: 0; color: #92400e;">
            <strong>Responda este cliente o mais rápido possível!</strong>
          </p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Rascunho Luminoso <onboarding@resend.dev>",
      to: ["rascunholuminoso@gmail.com"],
      subject: `Novo Pedido: ${orderData.service} - ${orderData.name}`,
      html: emailHtml,
    });

    console.log("Email enviado com sucesso:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
