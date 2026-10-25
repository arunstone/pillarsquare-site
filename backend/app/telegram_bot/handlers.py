"""Telegram bot conversation handlers."""
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes, ConversationHandler

from app.database import AsyncSessionLocal
from app.models.inquiry import Inquiry, InquirySource
from app.models.project import Project
from app.models.telegram_chat import TelegramChat
from app.config import settings
from app.services.notification import notify_admin_new_inquiry
from sqlalchemy import select

logger = logging.getLogger(__name__)

# Conversation states
INQUIRY_NAME, INQUIRY_PHONE, INQUIRY_MESSAGE = range(3)

WELCOME_TEXT = """
👋 Welcome to *Pillar Square Properties*!

We're Chennai's trusted construction & real estate company with 18+ years of excellence.

Use the menu below or type a command:
• /projects — Browse our portfolio
• /contact  — Send us an enquiry
• /help     — Get help
"""

HELP_TEXT = """
🏗 *Pillar Square Properties Bot*

Available commands:
/start    — Welcome message
/projects — Browse our projects
/contact  — Send us an enquiry
/cancel   — Cancel current operation
/help     — This message
"""


async def _upsert_chat(update: Update) -> None:
    """Record or update the chat in the database."""
    user = update.effective_user
    if not user:
        return
    async with AsyncSessionLocal() as db:
        chat = await db.scalar(
            select(TelegramChat).where(TelegramChat.chat_id == user.id)
        )
        if not chat:
            chat = TelegramChat(
                chat_id=user.id,
                username=user.username,
                first_name=user.first_name,
                last_name=user.last_name,
            )
            db.add(chat)
        else:
            chat.username = user.username
            chat.first_name = user.first_name
            chat.last_name = user.last_name
        await db.commit()


async def start_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    await _upsert_chat(update)
    keyboard = [
        [
            InlineKeyboardButton("🏗 Our Projects", callback_data="projects"),
            InlineKeyboardButton("📞 Contact Us", callback_data="contact"),
        ],
        [InlineKeyboardButton("🌐 Visit Website", url=settings.SITE_URL)],
    ]
    await update.message.reply_text(
        WELCOME_TEXT,
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup(keyboard),
    )


async def help_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(HELP_TEXT, parse_mode="Markdown")


async def projects_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    async with AsyncSessionLocal() as db:
        projects = (
            await db.scalars(
                select(Project)
                .order_by(Project.created_at.desc())
                .limit(5)
            )
        ).all()

    if not projects:
        msg = update.message or update.callback_query.message
        await msg.reply_text("No projects found yet. Check back soon!")
        return

    lines = ["🏗 *Our Recent Projects*\n"]
    for p in projects:
        status_emoji = {"completed": "✅", "ongoing": "🔨", "upcoming": "📅"}.get(
            p.status.value, "•"
        )
        lines.append(
            f"{status_emoji} *{p.title}*\n"
            f"   📍 {p.location or 'Chennai'}  |  {p.category.value.capitalize()}\n"
        )
    lines.append(f"\nView all: {settings.SITE_URL}/projects")

    msg = update.message or update.callback_query.message
    await msg.reply_text("\n".join(lines), parse_mode="Markdown")


async def contact_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    msg = update.message or update.callback_query.message
    await msg.reply_text(
        "📝 Let's get your enquiry started!\n\n"
        "What is your *full name*? (Type /cancel to abort)",
        parse_mode="Markdown",
    )
    return INQUIRY_NAME


async def inquiry_name_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    ctx.user_data["inquiry_name"] = update.message.text.strip()
    await update.message.reply_text(
        f"Thanks, *{ctx.user_data['inquiry_name']}*! 👍\n\n"
        "What is your *phone number*?",
        parse_mode="Markdown",
    )
    return INQUIRY_PHONE


async def inquiry_phone_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    ctx.user_data["inquiry_phone"] = update.message.text.strip()
    await update.message.reply_text(
        "Almost there! Please describe your *project or requirement* briefly:",
        parse_mode="Markdown",
    )
    return INQUIRY_MESSAGE


async def inquiry_message_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    user = update.effective_user
    name = ctx.user_data.get("inquiry_name", user.first_name or "Unknown")
    phone = ctx.user_data.get("inquiry_phone", "")
    message = update.message.text.strip()

    async with AsyncSessionLocal() as db:
        inquiry = Inquiry(
            name=name,
            phone=phone,
            message=message,
            source=InquirySource.telegram,
        )
        db.add(inquiry)
        await db.commit()
        await db.refresh(inquiry)

    await notify_admin_new_inquiry(inquiry)

    await update.message.reply_text(
        "✅ *Thank you!* Your enquiry has been submitted.\n\n"
        "Our team will contact you within 24 hours. 🙏\n\n"
        "In the meantime, browse our projects: /projects",
        parse_mode="Markdown",
    )
    ctx.user_data.clear()
    return ConversationHandler.END


async def inquiry_cancel_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> int:
    ctx.user_data.clear()
    await update.message.reply_text("❌ Enquiry cancelled. Type /start to begin again.")
    return ConversationHandler.END


async def button_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()

    if query.data == "projects":
        await projects_handler(update, ctx)
    elif query.data == "contact":
        await contact_handler(update, ctx)
