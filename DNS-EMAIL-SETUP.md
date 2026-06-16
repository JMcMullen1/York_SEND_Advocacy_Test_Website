# Email DNS Setup — yorksendadvocacy.co.uk

Mail for this domain is hosted on **Microsoft 365**. DNS is managed at **IONOS**
(nameservers `ns*.ui-dns.*`). The website itself is on GitHub Pages and is
unrelated to email delivery.

This document records the records required to fix mail authentication. Missing
DKIM and DMARC weaken the domain's reputation and make Microsoft 365's spam
filter more likely to **quarantine or junk inbound mail** from some senders —
the most common cause of "occasional problems receiving emails".

## Current state (audited 2026-06-16)

| Record | Status | Value |
|--------|--------|-------|
| MX | ✅ OK | `yorksendadvocacy-co-uk.mail.protection.outlook.com` |
| SPF (TXT) | ✅ OK | `v=spf1 include:spf.protection.outlook.com -all` |
| Autodiscover | ✅ OK | `autodiscover.outlook.com` |
| **DKIM** | ❌ Missing | no `selector1` / `selector2` CNAMEs |
| **DMARC** | ❌ Missing | no `_dmarc` TXT record |

Tenant ID: `e9061fe3-3f1f-4514-a208-f9ad1042110e` (brand: "York SEND Advocacy").

---

## 1. DKIM — two CNAME records + portal toggle

DKIM signs outbound mail and builds sender reputation. Two steps:

### a) Add the CNAME records at IONOS

> Targets confirmed from the M365 Defender DKIM page (this tenant uses the newer
> `a-v1.dkim.mail.microsoft` key-hosting format, NOT the legacy `onmicrosoft.com`
> pattern). Note Microsoft's spelling "ad**ov**cacy" — copy it exactly.

| Type | Host name (IONOS) | Points to / Value |
|------|-------------------|-------------------|
| CNAME | `selector1._domainkey` | `selector1-yorksendadvocacy-co-uk._domainkey.YorkSENDAdovcacy.a-v1.dkim.mail.microsoft` |
| CNAME | `selector2._domainkey` | `selector2-yorksendadvocacy-co-uk._domainkey.YorkSENDAdovcacy.a-v1.dkim.mail.microsoft` |

The targets won't resolve until DKIM is switched on in step (b) — that's normal.
DNS is case-insensitive, so capitalisation in the target does not matter.

### b) Enable DKIM in the portal

1. Go to **https://security.microsoft.com** → **Email & collaboration** →
   **Policies & rules** → **Threat policies** → **Email authentication settings**
   → **DKIM**.
2. Select `yorksendadvocacy.co.uk`.
3. The page shows the **exact two CNAME targets** — make sure they match what you
   published at IONOS, then switch **"Sign messages for this domain with DKIM
   signatures"** to **On**.

(DKIM does nothing until this toggle is enabled — the CNAMEs alone are inert.)

---

## 2. DMARC — one TXT record

DMARC tells receivers what to do with mail that fails SPF/DKIM and gives you
reporting. Start in monitor-only mode (`p=none`) so nothing legitimate breaks.

| Type | Host / Name | Value |
|------|-------------|-------|
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:enquiries@yorksendadvocacy.co.uk; fo=1` |

### Tightening over time

Once DKIM is enabled and reports (the `rua` address) show legitimate mail is
passing — typically after 2–4 weeks — tighten the policy:

1. `v=DMARC1; p=quarantine; pct=50; rua=mailto:enquiries@yorksendadvocacy.co.uk; fo=1`
2. `v=DMARC1; p=quarantine; rua=mailto:enquiries@yorksendadvocacy.co.uk; fo=1`
3. `v=DMARC1; p=reject; rua=mailto:enquiries@yorksendadvocacy.co.uk; fo=1`

---

## 3. Don't forget the inbound side

Fixing DNS improves reputation but won't retrieve mail already filtered. Also
check, in Microsoft 365:

- **Junk Email** folder in the `jamie@` mailbox.
- **Quarantine**: https://security.microsoft.com → **Review → Quarantine** — this
  is where Microsoft puts inbound mail from senders that fail their own checks.
- **Inbox rules** on the mailbox (Outlook → Settings → Rules) that may be moving
  or deleting messages.
- **Mailbox storage quota** — a full mailbox causes senders to get bounce-backs.

---

## How to verify after changes

DNS changes can take up to ~24h to propagate. Re-check with any DNS lookup tool,
or:

```
# MX / SPF / DMARC / DKIM
https://dns.google/resolve?name=yorksendadvocacy.co.uk&type=MX
https://dns.google/resolve?name=yorksendadvocacy.co.uk&type=TXT
https://dns.google/resolve?name=_dmarc.yorksendadvocacy.co.uk&type=TXT
https://dns.google/resolve?name=selector1._domainkey.yorksendadvocacy.co.uk&type=CNAME
```

Or use MXToolbox (https://mxtoolbox.com/SuperTool.aspx) → "dmarc:", "dkim:",
"spf:" lookups.
