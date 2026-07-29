import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const ADMIN_EMAILS = ['luizgferreira13@gmail.com', 'isabela122006@gmail.com']

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { event, items, clientName, clientEmail } = await req.json()

    const itemsHtml = items.map((i: { nome: string; quantidade: number; subtotal: number }) =>
      `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #222;color:#ccc">${i.nome}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #222;color:#ccc;text-align:center">${i.quantidade}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #222;color:#c9a84c;text-align:right">R$ ${Number(i.subtotal).toFixed(2)}</td>
      </tr>`
    ).join('')

    const html = `
      <div style="background:#0a0a0a;color:#fff;font-family:sans-serif;padding:32px;max-width:600px;margin:0 auto;border-radius:12px">
        <h1 style="color:#c9a84c;margin:0 0 4px">28 Eventos</h1>
        <p style="color:#666;margin:0 0 32px;font-size:13px">Nova solicitação de orçamento</p>

        <div style="background:#111;border-radius:8px;padding:20px;margin-bottom:24px">
          <h2 style="color:#fff;margin:0 0 16px;font-size:18px">${event.nome_evento}</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="color:#666;padding:4px 0;font-size:13px">Cliente</td><td style="color:#fff;font-size:13px">${clientName} (${clientEmail})</td></tr>
            <tr><td style="color:#666;padding:4px 0;font-size:13px">Tipo</td><td style="color:#fff;font-size:13px">${event.tipo_evento}</td></tr>
            <tr><td style="color:#666;padding:4px 0;font-size:13px">Data</td><td style="color:#fff;font-size:13px">${event.data || '—'}</td></tr>
            <tr><td style="color:#666;padding:4px 0;font-size:13px">Horário</td><td style="color:#fff;font-size:13px">${event.horario_inicio} - ${event.horario_fim}</td></tr>
            <tr><td style="color:#666;padding:4px 0;font-size:13px">Pessoas</td><td style="color:#fff;font-size:13px">${event.quantidade_pessoas}</td></tr>
            <tr><td style="color:#666;padding:4px 0;font-size:13px">Local</td><td style="color:#fff;font-size:13px">${event.endereco}, ${event.numero} - ${event.bairro}, ${event.cidade}/${event.estado}</td></tr>
            ${event.possui_aniversariante ? `<tr><td style="color:#666;padding:4px 0;font-size:13px">Aniversariante</td><td style="color:#fff;font-size:13px">${event.nome_aniversariante}, ${event.idade_aniversariante} anos</td></tr>` : ''}
            ${event.observacoes ? `<tr><td style="color:#666;padding:4px 0;font-size:13px">Obs</td><td style="color:#fff;font-size:13px">${event.observacoes}</td></tr>` : ''}
          </table>
        </div>

        <div style="background:#111;border-radius:8px;padding:20px;margin-bottom:24px">
          <h3 style="color:#fff;margin:0 0 12px;font-size:15px">Serviços solicitados</h3>
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="border-bottom:1px solid #333">
                <th style="text-align:left;padding:8px 12px;color:#666;font-size:12px">Serviço</th>
                <th style="text-align:center;padding:8px 12px;color:#666;font-size:12px">Qtd</th>
                <th style="text-align:right;padding:8px 12px;color:#666;font-size:12px">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:12px;color:#fff;font-weight:bold">Total estimado</td>
                <td style="padding:12px;color:#c9a84c;font-weight:bold;text-align:right;font-size:18px">R$ ${Number(event.valor_total).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p style="color:#555;font-size:12px;text-align:center">Acesse o painel admin para confirmar ou rejeitar este orçamento.</p>
      </div>
    `

    const errors: string[] = []

    for (const to of ADMIN_EMAILS) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to,
          subject: `[Orçamento] ${event.nome_evento} — ${clientName}`,
          html,
        }),
      })

      if (!res.ok) {
        const body = await res.text()
        errors.push(`${to}: ${res.status} ${body}`)
      }
    }

    if (errors.length > 0) {
      console.error('Resend errors:', errors)
      return new Response(JSON.stringify({ ok: false, errors }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Function error:', err)
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
