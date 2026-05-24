import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

interface BookingEmailParams {
  firstName: string
  lastName: string
  email: string
  phone?: string
  artistName?: string
  bodyZone?: string
  projectDescription?: string
  tryoutLink?: string
  bookingId: string
}

/**
 * Envoie l'email de confirmation au client + notification au studio.
 */
export async function sendBookingEmails(p: BookingEmailParams) {
  if (!resend) {
    console.warn('[resend] désactivé — RESEND_API_KEY manquante')
    return { ok: false, reason: 'Resend non configuré' }
  }

  const from = process.env.RESEND_FROM_EMAIL ?? 'atelier@memories.ink'
  const studioEmail = process.env.RESEND_TO_EMAIL ?? from

  // ---- Email au client ----
  const clientHtml = `
    <div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;background:#0a0807;color:#f0ebe3;">
      <h1 style="font-family:Georgia,serif;font-style:italic;font-size:42px;letter-spacing:-0.02em;margin:0 0 24px;">
        Memories<span style="color:#d62828">°</span>
      </h1>
      <p style="font-size:16px;line-height:1.6;">Bonjour ${p.firstName},</p>
      <p style="font-size:16px;line-height:1.6;">
        Nous avons bien reçu ta demande de réservation. Nous te recontactons sous <strong style="color:#d62828">24h ouvrées</strong>.
      </p>
      <div style="margin:32px 0;padding:24px;border:1px solid #2a2724;border-radius:8px;">
        <p style="font-family:monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#6b6660;margin:0 0 12px;">Ton projet</p>
        ${p.bodyZone ? `<p style="margin:6px 0;font-size:14px;">Zone : <strong>${p.bodyZone}</strong></p>` : ''}
        ${p.artistName ? `<p style="margin:6px 0;font-size:14px;">Artiste : <strong>${p.artistName}</strong></p>` : ''}
        ${p.projectDescription ? `<p style="margin:12px 0 0;font-size:14px;color:#c0b8aa;">${p.projectDescription}</p>` : ''}
      </div>
      ${p.tryoutLink ? `<p style="font-size:14px;"><a href="${p.tryoutLink}" style="color:#d62828;">Voir ton essayage IA →</a></p>` : ''}
      <p style="font-size:14px;color:#6b6660;margin-top:40px;">À très bientôt,<br>L'atelier Memories</p>
    </div>
  `

  // ---- Email au studio ----
  const studioHtml = `
    <div style="font-family:monospace;max-width:560px;margin:0 auto;padding:24px;">
      <h2 style="margin:0 0 16px;">🆕 Nouvelle réservation #${p.bookingId.slice(0, 8)}</h2>
      <ul style="line-height:1.8;list-style:none;padding:0;">
        <li><strong>Nom :</strong> ${p.firstName} ${p.lastName}</li>
        <li><strong>Email :</strong> ${p.email}</li>
        ${p.phone ? `<li><strong>Tél :</strong> ${p.phone}</li>` : ''}
        ${p.artistName ? `<li><strong>Artiste préféré :</strong> ${p.artistName}</li>` : ''}
        ${p.bodyZone ? `<li><strong>Zone :</strong> ${p.bodyZone}</li>` : ''}
      </ul>
      ${p.projectDescription ? `<p><strong>Projet :</strong><br>${p.projectDescription}</p>` : ''}
      ${p.tryoutLink ? `<p><a href="${p.tryoutLink}">→ Essayage IA du client</a></p>` : ''}
    </div>
  `

  try {
    const [clientEmail, studioEmailRes] = await Promise.all([
      resend.emails.send({
        from,
        to: p.email,
        subject: '✦ Memories — On a bien reçu ta demande',
        html: clientHtml,
      }),
      resend.emails.send({
        from,
        to: studioEmail,
        subject: `Nouvelle réservation — ${p.firstName} ${p.lastName}`,
        html: studioHtml,
      }),
    ])
    return { ok: true, clientEmail, studioEmail: studioEmailRes }
  } catch (err) {
    console.error('[resend]', err)
    return { ok: false, reason: String(err) }
  }
}
