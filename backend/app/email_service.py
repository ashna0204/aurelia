"""
Email notification service — sends alerts when new quotes/contacts come in.
"""

import html
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.config import get_settings

logger = logging.getLogger(__name__)


async def send_email(to: str, subject: str, html_body: str) -> bool:
    settings = get_settings()

    if not settings.smtp_user or not settings.smtp_password:
        logger.warning("SMTP not configured — skipping email send.")
        return False

    if not to:
        logger.warning("NOTIFICATION_EMAIL is not set — skipping email send.")
        return False

    try:
        import aiosmtplib

        msg = MIMEMultipart("alternative")
        msg["From"] = f"Aurelia Logistics <{settings.smtp_user}>"
        msg["To"] = to
        msg["Subject"] = subject
        msg.attach(MIMEText(html_body, "html"))

        await aiosmtplib.send(
            msg,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_user,
            password=settings.smtp_password,
            start_tls=True,
        )
        logger.info(f"Email sent to {to}: {subject}")
        return True

    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False


async def notify_new_quote(quote: dict) -> bool:
    """`quote` is a plain dict snapshot, not an ORM object — this runs after the
    response is sent and the DB session has already been closed."""
    settings = get_settings()
    products = quote.get("products") or []
    products_list = ", ".join(html.escape(str(p)) for p in products) if products else "Not specified"

    name = html.escape(str(quote.get("name") or ""))
    email_addr = html.escape(str(quote.get("email") or ""))
    company = html.escape(str(quote.get("company") or "—"))
    phone = html.escape(str(quote.get("phone") or "—"))
    volume = html.escape(str(quote.get("volume") or "—"))
    frequency = html.escape(str(quote.get("frequency") or "—"))
    destination = html.escape(str(quote.get("destination") or "—"))
    message_html = (
        "<div style='margin-top: 16px; padding: 16px; background: white; border-radius: 4px; border-left: 3px solid #C8963E;'>"
        f"<strong>Message:</strong><br/>{html.escape(str(quote['message']))}</div>"
        if quote.get("message") else ""
    )

    body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0A2E1C; padding: 24px 32px; border-radius: 8px 8px 0 0;">
            <h1 style="color: #C8963E; margin: 0; font-size: 20px;">New Quote Request</h1>
        </div>
        <div style="background: #f9f9f6; padding: 32px; border: 1px solid #e0ddd5; border-top: none; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #666; width: 130px;">Name</td><td style="padding: 8px 0; font-weight: 600;">{name}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;">{email_addr}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Company</td><td style="padding: 8px 0;">{company}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Phone</td><td style="padding: 8px 0;">{phone}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Products</td><td style="padding: 8px 0; font-weight: 600; color: #0A2E1C;">{products_list}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Volume</td><td style="padding: 8px 0;">{volume}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Frequency</td><td style="padding: 8px 0;">{frequency}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Destination</td><td style="padding: 8px 0;">{destination}</td></tr>
            </table>
            {message_html}
        </div>
    </div>
    """

    return await send_email(
        to=settings.notification_email,
        subject=f"[Aurelia] New Quote — {name} ({products_list})",
        html_body=body,
    )


async def notify_new_contact(contact: dict) -> bool:
    """`contact` is a plain dict snapshot — see notify_new_quote."""
    settings = get_settings()

    name = html.escape(str(contact.get("name") or ""))
    email_addr = html.escape(str(contact.get("email") or ""))
    company = html.escape(str(contact.get("company") or "—"))
    subject_text = html.escape(str(contact.get("subject") or "—"))
    message_body = html.escape(str(contact.get("message") or ""))

    body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0A2E1C; padding: 24px 32px; border-radius: 8px 8px 0 0;">
            <h1 style="color: #C8963E; margin: 0; font-size: 20px;">New Contact Message</h1>
        </div>
        <div style="background: #f9f9f6; padding: 32px; border: 1px solid #e0ddd5; border-top: none; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #666; width: 130px;">Name</td><td style="padding: 8px 0; font-weight: 600;">{name}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;">{email_addr}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Company</td><td style="padding: 8px 0;">{company}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Subject</td><td style="padding: 8px 0;">{subject_text}</td></tr>
            </table>
            <div style="margin-top: 16px; padding: 16px; background: white; border-radius: 4px; border-left: 3px solid #C8963E;">
                {message_body}
            </div>
        </div>
    </div>
    """

    return await send_email(
        to=settings.notification_email,
        subject=f"[Aurelia] Contact — {name}: {contact.get('subject') or 'General Enquiry'}",
        html_body=body,
    )
