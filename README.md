<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="Logo/BitKids Logo Transparent Banner.png">
    <source media="(prefers-color-scheme: light)" srcset="Logo/BitKids Logo Black Banner.png">
    <img alt="BitKids" src="Logo/BitKids Logo Black Banner.png" width="600">
  </picture>
  <br>
  <strong>Free. Open Source. Built for Bitcoin Families.</strong>
</p>
<br>
BitKids is a Bitcoin chore and commission app for families. Kids earn real 
satoshis for real work. Parents verify completion and pay directly from their 
own wallet. No subscriptions. No custodial wallets. No middleman. Ever.

**Coming soon:** bitkids.us  
**Contact:** hello@bitkids.us

---

## The Problem

Existing chore apps either use fiat payment rails or gate self-custody Bitcoin 
behind a paywall. No one has built a free, open-source, self-custody-first 
chore app designed for both parents *and* kids.

- Fiat apps (Greenlight, BusyKid) ignore Bitcoin entirely
- The only live Bitcoin chore app requires a monthly subscription to use your 
  own wallet
- Every app in this space is designed for parents — the kid's experience is 
  an afterthought
- Closed source means Bitcoin families have to blindly trust a company with 
  their kids' sat balances

BitKids fixes all of this.

---

## How It Works

1. **Parent** creates an account and sets up the family
2. **Kids** are invited and input their own Bitcoin wallet address
3. **Parent** creates chores, one-off tasks, and learning assignments — each 
   with a sat value
4. **Kid** opens their dashboard, completes work, taps Done
5. **Parent** gets notified, verifies completion, sends sats from their own 
   wallet, marks paid

The app is a coordination layer only. BitKids never touches funds.

---

## Core Principles

- **Non-custodial always** — BitKids never holds funds. Wallet addresses are 
  stored strings. All payments happen in the user's own wallet app.
- **Parent as final authority** — No automatic payments. Every sat transfer 
  requires human review and approval.
- **Free forever** — No subscriptions, no freemium tiers, no paywalled 
  features. The full product is free for every family, always.
- **Open source, fully auditable** — Every line of code is public under MIT 
  license. Read it, audit it, fork it, contribute to it.
- **Designed for kids, not just about kids** — The child's UI is built to be 
  colorful, engaging, and motivating. Not a dark fintech dashboard.
- **Commission, not allowance** — Kids earn Bitcoin by doing real work. 
  Proof-of-work parenting.

---

## Features — V1.0

- [ ] Parent and child accounts
- [ ] Family setup with multiple child profiles
- [ ] Recurring chores (daily, weekly, custom)
- [ ] One-off tasks with optional due dates
- [ ] Learning tasks with YouTube link attachment
- [ ] Sat commission value per task
- [ ] BYO wallet — any Bitcoin address (on-chain or Lightning)
- [ ] Child task completion flow
- [ ] Parent push notification on completion
- [ ] Parent verification before payment
- [ ] Sat history log for parent and child
- [ ] Kid-first dashboard UI
- [ ] Progressive Web App (installable on phone from browser)

---

## Roadmap

| Version | Focus |
|---|---|
| **v1.0** | Core chore/task flow, learning tasks, BYO wallet, kid-first UI |
| **v1.5** | Streaks, savings goals, multi-child dashboard, native iOS + Android |
| **v2.0** | Bitcoin education library, Apple/Google Calendar integration |
| **v3.0** | Nostr integration, self-hostable backend, community curriculum |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend & Auth | Supabase |
| Hosting | Vercel |
| Repo | GitHub (MIT License) |

---

## Contributing

BitKids is a community project. Contributions are welcome and encouraged.

**A note from the founder:** I'm not a developer — I'm someone who believes 
in Bitcoin, believes in teaching kids sound money principles, and had an idea 
worth building. This project has been designed and planned with the help of AI 
tools, and I'm learning as I go. If you're a developer who shares this vision, 
I'd love to build this together. Your skills plus this vision could make 
BitKids real.

**To get started:**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature-name`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature-name`)
5. Open a Pull Request

**Areas where help is needed:**
- Frontend development (Next.js / TypeScript / Tailwind)
- Backend development (Supabase / PostgreSQL)
- UI/UX design — especially the kid-facing dashboard
- Bitcoin/Lightning technical guidance
- Documentation and translations

If you want to discuss before building, open an **Issue** or email 
hello@bitkids.us

---

## What BitKids Will Never Do

- Hold or custody user funds
- Charge a subscription or hide features behind a paywall
- Require KYC or identity verification
- Sell user data or display ads
- Make automatic payments without parent approval

---

## Support the Project

BitKids is free forever. If you believe in what we're building, voluntary 
donations help cover hosting, App Store fees, and contributor bounties.

Bitcoin donation address: bc1q26fkns4lj8ldnv2g5w4nhjuwpww56s58jxfym4

---

## License

MIT License — see [LICENSE](LICENSE) for details.

Copyright (c) 2026 BitKids

---

*Built in the USA. For Bitcoin families everywhere.*
