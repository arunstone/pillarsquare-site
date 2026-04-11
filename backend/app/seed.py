"""
Seed script for Pillar Square Properties.

Usage (from the backend/ directory or inside the container):
    python -m app.seed

It is idempotent — running it multiple times will not create duplicate rows.
Existing rows with the same key/slug/name are skipped.
"""
import asyncio
import logging
import sys
import os
from datetime import datetime, timezone

# Allow running as a standalone script from backend/
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy import select
from app.database import AsyncSessionLocal, engine, Base
from app.models.service import Service
from app.models.testimonial import Testimonial
from app.models.site_settings import SiteSetting
from app.models.project import Project, ProjectImage, ProjectCategory, ProjectStatus
from app.models.blog import BlogPost

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
log = logging.getLogger("seed")


# ── Seed data ──────────────────────────────────────────────────────────────────

SERVICES = [
    {
        "title": "End-to-End Construction",
        "slug": "end-to-end-construction",
        "description": (
            "Complete construction solutions from initial planning and designing "
            "through to final execution — for both commercial and residential projects."
        ),
        "icon_name": "building-2",
        "image": "/uploads/service-01.jpg",
        "sort_order": 1,
    },
    {
        "title": "Labour Contract",
        "slug": "labour-contract",
        "description": (
            "Skilled and experienced labour provided on a contract basis. "
            "All materials are supplied by the client; we deliver the workforce and expertise."
        ),
        "icon_name": "hard-hat",
        "image": "/uploads/service-02.jpg",
        "sort_order": 2,
    },
    {
        "title": "Financial Planning",
        "slug": "financial-planning",
        "description": (
            "Expert guidance on budgeting, cost estimation, and financing options "
            "to help you make the most of your investment."
        ),
        "icon_name": "indian-rupee",
        "image": "/uploads/service-03.jpg",
        "sort_order": 3,
    },
    {
        "title": "Renovation & Maintenance",
        "slug": "renovation-maintenance",
        "description": (
            "Modernise and revitalise your existing property with our comprehensive "
            "renovation and ongoing maintenance services."
        ),
        "icon_name": "wrench",
        "image": "/uploads/service-04.jpg",
        "sort_order": 4,
    },
]

TESTIMONIALS = [
    {
        "client_name": "Ramesh Kumar",
        "client_role": "Homeowner",
        "content": "Delivered our dream home on time and within budget. Truly professional team.",
        "rating": 5,
        "is_featured": True,
    },
    {
        "client_name": "Anjali",
        "client_role": "Business Owner",
        "content": "Extremely satisfied with the commercial building. Quality workmanship throughout.",
        "rating": 5,
        "is_featured": True,
    },
    {
        "client_name": "Dinesh",
        "client_role": "Office Manager",
        "content": "Office renovation completed smoothly with minimal disruption to our operations.",
        "rating": 5,
        "is_featured": True,
    },
    {
        "client_name": "Ananya K",
        "client_role": "Homeowner",
        "content": "They turned our dream home into reality with remarkable dedication and attention to detail.",
        "rating": 5,
        "is_featured": True,
    },
    {
        "client_name": "Ravi",
        "client_role": "Client",
        "content": "Professional and approachable from start to finish. Highly recommended.",
        "rating": 5,
        "is_featured": False,
    },
    {
        "client_name": "Surya",
        "client_role": "Client",
        "content": "Exceptional service, quality construction, and delivered right on time.",
        "rating": 5,
        "is_featured": False,
    },
]

PROJECTS = [
    {
        "title": "Modern Villa in ECR",
        "slug": "modern-villa-ecr",
        "description": (
            "A stunning contemporary villa set along the scenic East Coast Road, this project "
            "showcases clean architectural lines, open-plan living, and premium finishes throughout. "
            "The 2,400 sq.ft residence features floor-to-ceiling glazing that floods every room with "
            "natural light, a landscaped courtyard, and a rooftop terrace offering panoramic sea views. "
            "Pillar Square managed the project from foundation to handover, delivering on schedule with "
            "zero compromise on material quality."
        ),
        "category": ProjectCategory.residential,
        "status": ProjectStatus.completed,
        "location": "Chennai",
        "area_sqft": 2400,
        "is_featured": True,
        "featured_image": "/uploads/ps.jpg",
        "images": [
            {"url": "/uploads/ps.jpg", "caption": "Front elevation", "sort_order": 0},
            {"url": "/uploads/ps2.jpg", "caption": "Living area", "sort_order": 1},
        ],
    },
    {
        "title": "Commercial Complex Pallikaranai",
        "slug": "commercial-complex-pallikaranai",
        "description": (
            "An 8,000 sq.ft multi-tenant commercial complex designed for mixed retail and office use. "
            "The building incorporates modern façade glazing, centralised HVAC, dedicated fire suppression "
            "systems, and ample underground parking. Pillar Square delivered this landmark project through "
            "rigorous project management, coordinating 12 sub-contractors while meeting all municipal "
            "compliance milestones ahead of schedule. Today it houses five thriving businesses."
        ),
        "category": ProjectCategory.commercial,
        "status": ProjectStatus.completed,
        "location": "Chennai",
        "area_sqft": 8000,
        "is_featured": True,
        "featured_image": "/uploads/ps3.jpg",
        "images": [
            {"url": "/uploads/ps3.jpg", "caption": "Building exterior", "sort_order": 0},
            {"url": "/uploads/ps4.jpg", "caption": "Lobby interior", "sort_order": 1},
        ],
    },
    {
        "title": "Heritage Home Renovation",
        "slug": "heritage-home-renovation",
        "description": (
            "This sensitive renovation of a 40-year-old traditional home in Chennai required equal parts "
            "craftsmanship and structural ingenuity. The 1,800 sq.ft property was modernised with new "
            "electrical and plumbing infrastructure, reinforced RCC framing, and premium Mangalore tile "
            "re-roofing — all while preserving the home's original Chettinad-inspired woodwork and "
            "hand-carved door frames. The result is a home that honours its heritage while meeting the "
            "demands of contemporary living."
        ),
        "category": ProjectCategory.renovation,
        "status": ProjectStatus.completed,
        "location": "Chennai",
        "area_sqft": 1800,
        "is_featured": True,
        "featured_image": "/uploads/ps5.jpg",
        "images": [
            {"url": "/uploads/ps5.jpg", "caption": "Restored façade", "sort_order": 0},
        ],
    },
    {
        "title": "Luxury Apartment Velachery",
        "slug": "luxury-apartment-velachery",
        "description": (
            "Currently under active construction, this 3,200 sq.ft luxury apartment in the heart of "
            "Velachery sets a new benchmark for urban living in Chennai. The project features double-height "
            "ceilings in the living and dining areas, a private swimming pool terrace, smart home automation, "
            "and Italian marble finishes throughout. Pillar Square is on track to deliver this flagship "
            "residential project within the agreed timeline, with structural work 70% complete."
        ),
        "category": ProjectCategory.residential,
        "status": ProjectStatus.ongoing,
        "location": "Chennai",
        "area_sqft": 3200,
        "is_featured": True,
        "featured_image": "/uploads/ps6.jpg",
        "images": [
            {"url": "/uploads/ps6.jpg", "caption": "Structural progress", "sort_order": 0},
            {"url": "/uploads/ps7.jpg", "caption": "Interior mock-up", "sort_order": 1},
        ],
    },
    {
        "title": "Office Space OMR",
        "slug": "office-space-omr",
        "description": (
            "Designed for a fast-growing tech firm on Old Mahabalipuram Road, this 5,000 sq.ft office "
            "fitout prioritised collaboration, acoustics, and biophilic design. The open-plan workspace "
            "incorporates modular workstations, glass-walled meeting rooms, a high-spec server room, and "
            "a dedicated breakout lounge with green walls. Pillar Square completed the full interior build "
            "in 14 weeks, enabling the client to onboard 120 employees without delay."
        ),
        "category": ProjectCategory.commercial,
        "status": ProjectStatus.completed,
        "location": "Chennai",
        "area_sqft": 5000,
        "is_featured": False,
        "featured_image": "/uploads/ps8.jpg",
        "images": [
            {"url": "/uploads/ps8.jpg", "caption": "Open workspace", "sort_order": 0},
        ],
    },
    {
        "title": "Traditional Home Tambaram",
        "slug": "traditional-home-tambaram",
        "description": (
            "Built for a multigenerational family in Tambaram, this 2,000 sq.ft traditional home blends "
            "Dravidian architectural motifs with efficient modern construction. A central courtyard ('thinnai') "
            "anchors the layout, drawing natural ventilation through every room. Features include hand-laid "
            "Athangudi tiles, teak joinery, and a dedicated puja room with a hand-sculpted gopuram-inspired "
            "entrance arch. Pillar Square delivered this project as a complete turnkey build within a "
            "14-month timeline."
        ),
        "category": ProjectCategory.residential,
        "status": ProjectStatus.completed,
        "location": "Chennai",
        "area_sqft": 2000,
        "is_featured": False,
        "featured_image": "/uploads/ps9.jpg",
        "images": [
            {"url": "/uploads/ps9.jpg", "caption": "Front view", "sort_order": 0},
        ],
    },
]

BLOG_POSTS = [
    {
        "title": "RERA 2026: What Every Homebuyer in Tamil Nadu Should Know",
        "slug": "rera-2026-what-every-homebuyer-in-tamil-nadu-should-know",
        "excerpt": (
            "RERA has reshaped the real estate landscape across India, and Tamil Nadu is no exception. "
            "Here is what every homebuyer needs to understand about their rights, builder obligations, "
            "and how to use TNRERA to protect their investment in 2026."
        ),
        "content": """The Real Estate (Regulation and Development) Act has been in force since 2017, but many homebuyers in Tamil Nadu still do not fully understand how it protects them — or how to invoke it when things go wrong. With regulatory enforcement tightening in 2026, this guide covers everything you need to know before signing on any dotted line.

**What RERA Requires of Builders**

Every residential project with more than eight units or a plot exceeding 500 sq.m must be registered with the Tamil Nadu Real Estate Regulatory Authority (TNRERA) before any marketing or sale can begin. Registration forces developers to disclose approved layouts, completion timelines, financial statements, and the names of architects and engineers on record. This information is publicly accessible on the TNRERA portal — always verify it before making any advance payment.

**Escrow Protection: Your Money Is Ring-Fenced**

One of RERA's most powerful provisions requires developers to deposit 70% of all buyer payments into a dedicated escrow account that can only be used for that specific project's land and construction costs. This prevents the common malpractice of diverting funds from one project to fund another. Ask your builder for the escrow account details and confirm they are compliant before paying any instalment beyond the booking amount.

**Timeline Commitments Are Legally Binding**

Under RERA, the possession date stated in your sale agreement is a legal commitment. If your builder misses it, you are entitled to a full refund with interest (currently pegged at the State Bank of India's marginal cost lending rate plus 2%) or continued possession with monthly compensation. Do not accept vague "expected possession" language — insist on a specific date written into the agreement.

**Structural Defect Warranty**

RERA mandates a five-year structural defect warranty from the date of possession. If cracks, seepage, or structural failures emerge within this window, the developer must rectify them at no cost. Document any defects in writing to the builder within the warranty period and file with TNRERA if repairs are not completed within 30 days.

**How to File a Complaint**

TNRERA complaints can be filed online at tnrera.in. The adjudicating officer must decide within 60 days. Penalties for non-compliant developers can reach up to 10% of the project cost, and repeat violations can result in imprisonment. Keep all payment receipts, sale agreements, and written correspondence — these are your evidence.

**Pillar Square's Commitment**

Every project Pillar Square undertakes is fully RERA-registered, escrow-compliant, and delivered with a complete documentation package at handover. We believe regulatory compliance is not a burden — it is the foundation of the trust our clients place in us.""",
        "featured_image": "/uploads/ps.jpg",
        "is_published": True,
        "published_at": datetime(2026, 3, 15, 9, 0, tzinfo=timezone.utc),
    },
    {
        "title": "Construction Cost Trends in Chennai: 2026 Update",
        "slug": "construction-cost-trends-chennai-2026-update",
        "excerpt": (
            "Material prices and labour rates have shifted significantly heading into 2026. "
            "Here is an honest breakdown of what it costs to build in Chennai today, and how "
            "to budget smartly without compromising on quality."
        ),
        "content": """If you commissioned a construction cost estimate two years ago and are only now starting your project, that number is out of date. Chennai's construction economy has seen meaningful price movements across key materials and trades. Here is what the market looks like in early 2026 and how to plan around it.

**Cement and Steel: The Structural Backbone**

Ordinary Portland Cement (OPC 53 grade) is trading at ₹380–420 per 50 kg bag in Chennai as of Q1 2026, up roughly 8% year-on-year. TMT steel bars (Fe 500D) are priced at ₹58,000–63,000 per metric tonne, stabilised after a volatile 2024–25 period driven by global demand. For a typical 2,000 sq.ft residence, steel and cement together represent approximately 18–22% of total civil cost — so even a 10% swing meaningfully impacts your budget.

**Sand and Aggregate**

Manufactured sand (M-sand) has become the dominant fine aggregate in Chennai construction following continued restrictions on river sand quarrying. M-sand costs ₹55–65 per cubic foot delivered to site. Blue metal aggregate (20 mm) is approximately ₹50–58 per cubic foot. Factor higher wastage rates for M-sand compared to river sand in your estimate — typically 10–15% more material is required.

**Labour Rates in 2026**

Skilled masons command ₹950–1,100 per day in Chennai, up from ₹800–900 in 2023. Steel fixers and carpenters are similarly priced. Unskilled helpers range from ₹550–650 per day. Labour typically accounts for 25–30% of total construction cost, and shortages of skilled trades in Chennai are keeping rates elevated. Locking in a labour contract early — before peak construction season (October–February) — can save 10–15% on this line item.

**All-In Construction Cost Benchmarks**

| Grade | Cost per sq.ft (built-up) |
|-------|--------------------------|
| Basic residential | ₹1,900–2,200 |
| Mid-range residential | ₹2,400–2,900 |
| Premium residential | ₹3,200–4,500 |
| Commercial fit-out | ₹2,000–3,500 |

These figures exclude land, statutory approvals, interior furniture, and landscaping.

**How to Budget Wisely**

Lock material prices early through a back-to-back supply agreement with your contractor or directly with dealers. Build a 12–15% contingency into your total budget. Prioritise the structural and waterproofing budget — cutting corners here creates disproportionate long-term costs. Finishes and fixtures can be value-engineered more safely than the structural shell.

Pillar Square provides clients with a detailed bill of quantities at project initiation, updated quarterly to reflect current market rates. Transparency on cost is not optional — it is the foundation of every successful project we deliver.""",
        "featured_image": "/uploads/ps2.jpg",
        "is_published": True,
        "published_at": datetime(2026, 2, 20, 9, 0, tzinfo=timezone.utc),
    },
    {
        "title": "Traditional vs Modern Construction in Chennai: A Complete Guide",
        "slug": "traditional-vs-modern-construction-chennai-complete-guide",
        "excerpt": (
            "The choice between contemporary architecture and traditional Tamil design is more than "
            "aesthetic — it affects budget, timeline, maintenance, and how your home feels to live in "
            "for decades. Here is a complete guide to help you decide."
        ),
        "content": """Walk through any neighbourhood in Chennai and you will find two distinct architectural languages in conversation: the clean geometries of modern construction and the ornate heritage of traditional Tamil design. Both have profound merit. Choosing between them — or blending the two — is one of the most personal decisions a homeowner makes.

**What We Mean by 'Modern' Construction**

Modern construction in the Chennai context typically means RCC (reinforced concrete) framing with flat or low-pitch roofs, large glazed openings, minimal ornamentation, and an open-plan interior layout. It is faster to build, easier to waterproof, and readily accommodates integrated smart-home systems. Modern homes are well-suited to compact urban plots where maximising floor area ratio is a priority.

**What We Mean by 'Traditional' Construction**

Traditional Tamil homes — inspired by Chettinad, Brahmin agraharam, and vernacular courtyard house typologies — are characterised by load-bearing brick or stone walls, sloped Mangalore-tiled roofs, carved timber elements, central courtyards for ventilation, and Athangudi or Cuddapah stone flooring. They are thermally superior in Chennai's climate, relying on passive cooling rather than energy-intensive HVAC systems, and carry immense cultural resonance that modern homes cannot replicate.

**Cost and Timeline Comparison**

| Factor | Modern | Traditional |
|--------|--------|-------------|
| Build cost per sq.ft (2026) | ₹2,000–2,900 | ₹2,500–4,000 |
| Timeline | 14–18 months | 20–30 months |
| Skilled artisans required | Moderate | High |
| 20-year maintenance cost | Higher | Lower |
| Thermal comfort | HVAC-dependent | Passive cooling |
| Resale appeal | Broad market | Niche premium |

**The Case for a Hybrid Approach**

Many of our best projects in 2025–26 have blended both idioms: an RCC structural frame for speed and seismic resilience, Mangalore tile roofing for thermal performance, Athangudi tile flooring in living areas for character, and a central skylight in place of a traditional open courtyard. This hybrid delivers 70–80% of the traditional aesthetic at modern construction timescales.

**Our Recommendation**

For plots under 2,000 sq.ft in urban Chennai — Anna Nagar, Velachery, Pallikaranai — modern or hybrid construction makes practical sense. For larger plots in Tambaram, ECR, or peri-urban areas where land is more generous, a traditional or hybrid design delivers superior long-term value and a living quality that purely modern construction cannot match.

Pillar Square has delivered excellence in both idioms across Chennai. What matters most is that your home reflects your values, your family's way of life, and the neighbourhood it will inhabit for generations. We are happy to walk you through both options before you commit to either.""",
        "featured_image": "/uploads/ps3.jpg",
        "is_published": True,
        "published_at": datetime(2026, 1, 10, 9, 0, tzinfo=timezone.utc),
    },
]

SITE_SETTINGS = {
    "phone":     "9841621326",
    "email":     "contact@example.com",
    "address":   "No 4D, Annora Flats, LIC Nagar, 2nd Main Rd, Madipakkam, Chennai 600091",
    "facebook":  "",
    "instagram": "",
    "youtube":   "",
    "whatsapp":  "9841621326",
}


# ── Helpers ────────────────────────────────────────────────────────────────────

async def seed_services(db) -> None:
    for data in SERVICES:
        exists = await db.scalar(select(Service).where(Service.slug == data["slug"]))
        if exists:
            log.info("  skip  service '%s' (already exists)", data["title"])
            continue
        row = {k: v for k, v in data.items() if k != "image"}
        db.add(Service(**row))
        log.info("  add   service '%s'", data["title"])
    await db.commit()


async def seed_testimonials(db) -> None:
    for data in TESTIMONIALS:
        exists = await db.scalar(
            select(Testimonial).where(Testimonial.client_name == data["client_name"])
        )
        if exists:
            log.info("  skip  testimonial from '%s' (already exists)", data["client_name"])
            continue
        db.add(Testimonial(**data))
        log.info("  add   testimonial from '%s'", data["client_name"])
    await db.commit()


async def seed_projects(db) -> None:
    for data in PROJECTS:
        exists = await db.scalar(select(Project).where(Project.slug == data["slug"]))
        if exists:
            log.info("  skip  project '%s' (already exists)", data["title"])
            continue
        images_data = data.pop("images")
        project = Project(**data)
        db.add(project)
        await db.flush()  # get project.id before adding images
        for img in images_data:
            db.add(ProjectImage(
                project_id=project.id,
                image_url=img["url"],
                caption=img.get("caption"),
                sort_order=img.get("sort_order", 0),
            ))
        log.info("  add   project '%s'", project.title)
    await db.commit()


async def seed_blog_posts(db) -> None:
    for data in BLOG_POSTS:
        existing = await db.scalar(select(BlogPost).where(BlogPost.slug == data["slug"]))
        if existing:
            for key, value in data.items():
                setattr(existing, key, value)
            log.info("  update blog post '%s'", data["title"])
        else:
            db.add(BlogPost(**data))
            log.info("  add   blog post '%s'", data["title"])
    await db.commit()


async def seed_settings(db) -> None:
    for key, value in SITE_SETTINGS.items():
        existing = await db.scalar(select(SiteSetting).where(SiteSetting.key == key))
        if existing:
            # Update value if it's been left blank previously
            if existing.value != value:
                existing.value = value
                log.info("  update setting '%s'", key)
            else:
                log.info("  skip  setting '%s' (unchanged)", key)
        else:
            db.add(SiteSetting(key=key, value=value))
            log.info("  add   setting '%s'", key)
    await db.commit()


# ── Main ───────────────────────────────────────────────────────────────────────

async def run() -> None:
    # Ensure tables exist (safe no-op if already created by Alembic)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        log.info("── Seeding services…")
        await seed_services(db)

        log.info("── Seeding testimonials…")
        await seed_testimonials(db)

        log.info("── Seeding projects…")
        await seed_projects(db)

        log.info("── Seeding blog posts…")
        await seed_blog_posts(db)

        log.info("── Seeding site settings…")
        await seed_settings(db)

    await engine.dispose()
    log.info("── Done. ✓")


if __name__ == "__main__":
    asyncio.run(run())
