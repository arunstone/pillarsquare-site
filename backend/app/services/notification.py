import logging
from ..config import settings

logger = logging.getLogger(__name__)


async def notify_admin_new_inquiry(inquiry) -> None:
    """Send a Telegram message to admin when a new inquiry arrives."""
    if not settings.TELEGRAM_BOT_TOKEN or not settings.TELEGRAM_ADMIN_CHAT_ID:
        return

    try:
        from telegram import Bot

        bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
        text = (
            f"📩 *New Inquiry* from *{inquiry.name}*\n"
            f"📞 {inquiry.phone or 'N/A'}\n"
            f"✉️ {inquiry.email or 'N/A'}\n"
            f"💬 {inquiry.message or 'N/A'}\n"
            f"🌐 Source: {inquiry.source}"
        )
        await bot.send_message(
            chat_id=settings.TELEGRAM_ADMIN_CHAT_ID,
            text=text,
            parse_mode="Markdown",
        )
    except Exception as e:
        logger.warning("Failed to send Telegram notification: %s", e)
