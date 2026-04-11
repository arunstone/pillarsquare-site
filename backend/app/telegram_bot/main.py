"""
Pillar Square Properties — Telegram Bot
Handles user inquiries, project browsing, and lead capture via Telegram.
"""
import asyncio
import logging
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    ConversationHandler,
    CallbackQueryHandler,
    filters,
)

from app.config import settings
from .handlers import (
    start_handler,
    help_handler,
    projects_handler,
    contact_handler,
    inquiry_name_handler,
    inquiry_phone_handler,
    inquiry_message_handler,
    inquiry_cancel_handler,
    button_handler,
    INQUIRY_NAME,
    INQUIRY_PHONE,
    INQUIRY_MESSAGE,
)

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)


def build_app() -> Application:
    app = Application.builder().token(settings.TELEGRAM_BOT_TOKEN).build()

    # Conversation handler for inquiry flow
    inquiry_conv = ConversationHandler(
        entry_points=[CommandHandler("contact", contact_handler)],
        states={
            INQUIRY_NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, inquiry_name_handler)],
            INQUIRY_PHONE: [MessageHandler(filters.TEXT & ~filters.COMMAND, inquiry_phone_handler)],
            INQUIRY_MESSAGE: [MessageHandler(filters.TEXT & ~filters.COMMAND, inquiry_message_handler)],
        },
        fallbacks=[CommandHandler("cancel", inquiry_cancel_handler)],
    )

    app.add_handler(CommandHandler("start", start_handler))
    app.add_handler(CommandHandler("help", help_handler))
    app.add_handler(CommandHandler("projects", projects_handler))
    app.add_handler(inquiry_conv)
    app.add_handler(CallbackQueryHandler(button_handler))

    return app


def main() -> None:
    if not settings.TELEGRAM_BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN is not set. Bot will not start.")
        return

    app = build_app()
    logger.info("Starting Pillar Square Telegram bot…")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
