# 23. Mock Data Catalogue (complete dataset for the frontend phase)

| | |
|---|---|
| **Status** | Draft, awaiting review |
| **Version** | 0.1 |
| **Date** | 2026-11-02 |
| **Extracted** | 2026-11-02, about 02:00 to 02:05 IST, from the reference site's public pages (7 pages and all 42 puppy detail pages listed in its sitemap) |
| **Related** | `docs/02-architecture/20-mock-data-spec.md` (data shapes and repository boundary), `docs/02-architecture/21-modular-monolith-architecture.md`, `docs/07-planning/22-frontend-development-plan.md` |

## 1. Purpose

`20-mock-data-spec.md` defines the **shapes** of the mock data. This catalogue is the **complete inventory of the records themselves**, extracted from the reference site, so the frontend can be built and tested against a dataset that is complete, with exact counts and known quirks. It is the acceptance reference for the mock data layer (phase F3 of `22`): the fixtures must reproduce these tables exactly.

**What is and is not copied.** Text, structure, field values, slugs, counts, image dimensions, alt text, focal points and dominant colours are recorded here. **No photo, video or illustration file is downloaded or committed** (decision D13: placeholders). Customer-identifying details are handled as described in section 12.

## 2. Dataset summary

| Dataset | Count | Source on the reference | Notes |
|---|---|---|---|
| Available puppies | **15** | `/puppies` payload and 15 detail pages | All have status `available`; **all 15 are `Imported`** |
| Gone-home puppies | **27** | `/gone-home` list and 27 detail pages | 15 imported, 12 in Dubai; slugs include two odd ones (`puppy`, `maltipo`) |
| Puppy detail pages | **42** | `sitemap.xml` | 15 + 27; unknown slug returns 404 "Puppy not found" |
| Media items on detail pages | **132** references, **130** unique ids | Detail page payloads | **126** images and **6** videos; 2 media ids are shared by two gone-home puppies each |
| Puppies with video | **4** | Detail pages | `maltipoo-max-male` (1), `korean-teacup-maltipoo-female` (1), `maltipoo-cavapoo-male` (1), `maltipoo-female-2` (3) |
| Family photos | **64** | `/happy-families` payload | **8** have captions, 56 have none |
| FAQs | **9** | `/faq` JSON-LD | Also 3 shown on the home page |
| Testimonial | **1** | Home and families pages | Real customer attribution (see section 12) |
| Site settings | 1 set | Footer, contact page | Phone, WhatsApp text, email, address, Maps link, 3 social links |
| Contact form puppy options | **16** | Contact page `<select>` | "any puppy (not sure yet)" plus the 15 available puppies in list order |
| Filters | 3 groups, 10 chips | `/puppies` | where (Everywhere, Imported, Korean Teacup), breed (5), sex (Boys, Girls) |
| Static pages | 7 | Markup | Word counts in section 9 |

## 3. Data rules and quirks discovered

These are facts about the reference's data that the mock layer must reproduce; several differ from what earlier documents assumed.

1. **Only 2 of the 15 available puppies have a personal name** (`Max`, `Copper`). The other 13 have an empty `name`; their `displayName` equals the breed (for example "Korean Teacup Maltipoo"). The UI uses `displayName` for the heading and list card. For named puppies the detail page shows a breed subtitle under the name; for unnamed ones it does not.
2. **All 15 available puppies are imported** (`origin` = Imported, "Where" = "Imported for you"). The home page links "Meet local puppies" to `/puppies?origin=local`, but **no available puppy is local** and the filter bar has **no "Local" chip**. The behaviour of `?origin=local` is therefore unknown (gap G1 in section 14); the clone must decide (show everything, or an empty state) after checking the reference.
3. **Exactly 5 of the 15 puppies belong to the "Korean Teacup" collection** (`korean-teacup-maltipoo-female`, `korean-teacup-poodle-female` and the three `korean-teacup-pomeranian*` entries). The "Korean Teacup" filter chip works on the collection slug `korean-teacup`; the other 10 puppies have no collection.
4. `gender` has **three values**: `male` (label "Boy"), `female` ("Girl") and `male-female` ("Boy & girl", used by `toy-poodle-male-female`). A "Boys" filter and a "Girls" filter must decide how the pair entry is treated (to confirm on the reference).
5. `age` is **free text** and is shown verbatim: "3 months", "2.5 months", and "3 months Maltipoo & 2 months Cavapoo" (a pair of different breeds). Do not parse it.
6. A puppy can have **more than one breed** (`maltipoo-cavapoo-male`: Maltipoo and Cavapoo) and so appears under both breed filters.
7. `status` is `available` for all 15; gone-home puppies are not in the `/puppies` payload's main list and are shown through the "already gone home" strip (the 5 most recent) and `/gone-home` (all 27).
8. Gone-home puppies have **two "Where" values**: `Imported for you` (15) and `In Dubai` (12). The ticket's source label maps one to one: "TeddyPups" ↔ imported, "Dubai showroom" ↔ in Dubai.
9. Two gone-home puppies carry an extra fact **Colour** (`blue-marle-pomeranian`: Marble; `maltipoo-mia-girl`: Golden Cream); the fact grid shows five facts for them and four for the rest.
10. **Three gone-home puppies have no personal name**: `blue-marle-pomeranian` (heading "Pomeranian"), `puppy` ("Maltipoo") and `maltipo` ("Poodle"). Their `name` equals their breed; the page and WhatsApp text then read "the {Breed}" (for example "I loved the Maltipoo") and the meta text reads "this {Breed}".
11. **Detail page copy depends on state**: the status pill ("Available" or "Gone home ♥"), the breadcrumb root ("Available puppies" or "Gone home"), the first section tag ("hello, it's me" or "the day they went home"), the primary button label ("Ask about {Name} on WhatsApp" / "Ask about this puppy" / "Ask about a puppy like this"), and the enquiry form title ("Ask about {Name}" / "Ask about this puppy" / "Looking for a puppy like this?"). Patterns are in section 8.
12. `prev` and `next` pups follow list order and **wrap around**: for `maltipoo-max-male` (first) the previous pup is the last one (Korean Teacup Pomeranian) and the next is the second (Korean Teacup Maltipoo). Available pages use the available list and gone-home pages the gone-home list (names in sections 4 and 5; G4 asks to confirm the gone-home chain).
13. Media: the reference serves **AVIF (75), JPEG/JPG (50), WebP (1) and MP4 (6)**; there are **no empty alt texts** and **no captions** on puppy media; every media item has a dominant colour and focal point; most gone-home gallery items are 720×405 landscape.
14. The families wall mixes sizes (17 square 433×433, 14 portrait 2142×2856, 9 of 960×1280, others), and **only 8 of 64 have captions**, all with emoji.
15. The reference page titles and descriptions follow templates (section 8) that include the age, sex, breed and origin text.

## 4. Available puppies (15)

List order is the display order on the home page, the puppies page, the contact form select and the previous/next navigation.

| # | Slug | Display name | Name field | Breed | Sex label | Age (text as shown) | Where | Collections | Breed refs | Photos | Videos | Cover (w×h, kind) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `maltipoo-max-male` | Max | Max | Maltipoo | Boy | 3 months | Imported for you | none | Maltipoo | 1 | 1 | 607×700, image |
| 2 | `korean-teacup-maltipoo-female` | Korean Teacup Maltipoo | (empty) | Korean Teacup Maltipoo | Girl | 2 months | Imported for you | Korean Teacup | Maltipoo | 10 | 1 | 1200×1600, image |
| 3 | `korean-teacup-poodle-female` | Korean Teacup Poodle | (empty) | Korean Teacup Poodle | Girl | 2 months | Imported for you | Korean Teacup | Poodle | 4 | 0 | 960×1280, image |
| 4 | `maltipoo-cavapoo-male` | Maltipoo & Cavapoo | (empty) | Maltipoo & Cavapoo | Boy | 3 months Maltipoo & 2 months Cavapoo | Imported for you | none | Maltipoo, Cavapoo | 2 | 1 | 960×1280, image |
| 5 | `toy-poodle-male-female` | Toy Poodle | (empty) | Toy Poodle | Boy & girl | 2 months | Imported for you | none | Poodle | 3 | 0 | 960×1280, image |
| 6 | `maltipoo-female-2` | Maltipoo | (empty) | Maltipoo | Girl | 3 months | Imported for you | none | Maltipoo | 4 | 3 | 960×1280, image |
| 7 | `pomeranian-female` | Pomeranian | (empty) | Pomeranian | Girl | 3 months | Imported for you | none | Pomeranian | 3 | 0 | 720×1280, image |
| 8 | `copper-male` | Copper | Copper | Cavapoo | Boy | 2 months | Imported for you | none | Cavapoo | 4 | 0 | 836×1280, image |
| 9 | `shitzu-female` | Shih Tzu | (empty) | Shih Tzu | Girl | 2 months | Imported for you | none | Shih Tzu | 2 | 0 | 1200×1600, image |
| 10 | `shitzu-male` | Shih Tzu | (empty) | Shih Tzu | Boy | 2 months | Imported for you | none | Shih Tzu | 2 | 0 | 1200×1600, image |
| 11 | `maltipoo-female-1` | Maltipoo | (empty) | Maltipoo | Girl | 2.5 months | Imported for you | none | Maltipoo | 4 | 0 | 1200×1600, image |
| 12 | `maltipoo-female` | Maltipoo | (empty) | Maltipoo | Girl | 2 months | Imported for you | none | Maltipoo | 4 | 0 | 1200×1600, image |
| 13 | `korean-teacup-pomeranian-1` | Korean Teacup Pomeranian | (empty) | Korean Teacup Pomeranian | Girl | 2 months | Imported for you | Korean Teacup | Pomeranian | 2 | 0 | 960×1280, image |
| 14 | `korean-teacup-pomeranian` | Korean Teacup Pomeranian | (empty) | Korean Teacup Pomeranian | Girl | 2 months | Imported for you | Korean Teacup | Pomeranian | 2 | 0 | 1260×1598, image |
| 15 | `korean-teacup-pomeranian-male` | Korean Teacup Pomeranian | (empty) | Korean Teacup Pomeranian | Boy | 2 months | Imported for you | Korean Teacup | Pomeranian | 4 | 0 | 1200×1600, image |

Korean Teacup collection members: 5 (`korean-teacup-maltipoo-female`, `korean-teacup-poodle-female`, `korean-teacup-pomeranian-1`, `korean-teacup-pomeranian`, `korean-teacup-pomeranian-male`). Breed filter counts (breed refs): Maltipoo 6, Pomeranian 4, Poodle 2, Cavapoo 2, Shih Tzu 2 (a puppy with two breeds counts in both). Sex counts (verified): **Boy 5, Girl 9, Boy & girl 1** (`toy-poodle-male-female`). These totals are acceptance numbers in the F3 tests.

## 5. Gone-home puppies (27)

Order follows the reference's `/gone-home` listing (and its previous/next navigation).

| # | Slug | Name | Breed | Sex | Age | Where | Source label | Extra fact | Photos | Prev / next target names |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `pomeranian-ace-boy` | Ace | Pomeranian | Boy | 3 months | Imported for you | TeddyPups |  | 4 | Poodle / Leo |
| 2 | `poodle-leo-male` | Leo | Poodle | Boy | 3 months | Imported for you | TeddyPups |  | 4 | Ace / Mia |
| 3 | `maltipoo-mia-girl` | Mia | Maltipoo | Girl | 3 months | In Dubai | Dubai showroom | Colour: Golden Cream | 4 | Leo / Sadie |
| 4 | `maltipoo-sadie-girl` | Sadie | Maltipoo | Girl | 3 months | Imported for you | TeddyPups |  | 4 | Mia / Pomeranian |
| 5 | `blue-marle-pomeranian` | Pomeranian | Pomeranian | Boy | 3 months | Imported for you | TeddyPups | Colour: Marble | 1 | Sadie / Ollie |
| 6 | `pomsky-ollie-boy` | Ollie | Pomsky | Boy | 3 months | Imported for you | TeddyPups |  | 3 | Pomeranian / Bruno |
| 7 | `maltipoo-bruno-boy` | Bruno | Maltipoo | Boy | 3 months | In Dubai | Dubai showroom |  | 4 | Ollie / Buddy |
| 8 | `maltese-buddy-male` | Buddy | Maltese | Boy | 2 months | In Dubai | Dubai showroom |  | 1 | Bruno / Charlie |
| 9 | `maltese-charlie-male` | Charlie | Maltese | Boy | 3.5 months | Imported for you | TeddyPups |  | 1 | Buddy / Daisy |
| 10 | `pomeranian-daisy-girl` | Daisy | Pomeranian | Girl | 2 months | In Dubai | Dubai showroom |  | 1 | Charlie / Bella |
| 11 | `pomeranian-bella-female` | Bella | Pomeranian | Girl | 4 months | Imported for you | TeddyPups |  | 1 | Daisy / Teddy |
| 12 | `poodle-teddy-male` | Teddy | Poodle | Boy | 3 months | Imported for you | TeddyPups |  | 1 | Bella / Molly |
| 13 | `poodle-molly-female` | Molly | Poodle | Girl | 3 months | In Dubai | Dubai showroom |  | 1 | Teddy / Coco |
| 14 | `pomski-coco-girl` | Coco | Pomsky | Girl | 3 months | Imported for you | TeddyPups |  | 3 | Molly / Rosie |
| 15 | `pomsky-rosie-girl` | Rosie | Pomsky | Girl | 3 months | In Dubai | Dubai showroom |  | 4 | Coco / Leo |
| 16 | `pomeranian-leo-boy` | Leo | Pomeranian | Boy | 3 months | In Dubai | Dubai showroom |  | 5 | Rosie / Molly |
| 17 | `poodle-molly-girl` | Molly | Poodle | Girl | 3 months | Imported for you | TeddyPups |  | 3 | Leo / Rocky |
| 18 | `poodle-rocky-boy` | Rocky | Poodle | Boy | 3 months | Imported for you | TeddyPups |  | 3 | Molly / Sophie |
| 19 | `maltipoo-sophie-girl` | Sophie | Maltipoo | Girl | 3 months | In Dubai | Dubai showroom |  | 3 | Rocky / Lola |
| 20 | `maltipoo-lola-girl` | Lola | Maltipoo | Girl | 3 months | In Dubai | Dubai showroom |  | 4 | Sophie / Rex |
| 21 | `pomeranian-rex-boy` | Rex | Pomeranian | Boy | 5 months | Imported for you | TeddyPups |  | 3 | Lola / Finn |
| 22 | `pomsky-finn-male` | Finn | Pomsky | Boy | 3 months | Imported for you | TeddyPups |  | 1 | Rex / Zoe |
| 23 | `maltipoo-zoe-girl` | Zoe | Maltipoo | Girl | 3 months | Imported for you | TeddyPups |  | 5 | Finn / Mimi |
| 24 | `pomeranian-mimi-girl` | Mimi | Pomeranian | Girl | 3 months | In Dubai | Dubai showroom |  | 6 | Zoe / Bailey |
| 25 | `bichon-bailey-boy` | Bailey | Bichon | Boy | 3 months | In Dubai | Dubai showroom |  | 3 | Mimi / Maltipoo |
| 26 | `puppy` | Maltipoo | Maltipoo | Girl | 3 months | Imported for you | TeddyPups |  | 1 | Bailey / Poodle |
| 27 | `maltipo` | Poodle | Poodle | Girl | 3 months | In Dubai | Dubai showroom |  | 1 | Maltipoo / Ace |

Distributions: where: imported 15, in Dubai 12; sex: Boy 13, Girl 14; ages: 3 months 22, 2 months 2, 3.5 months 1, 4 months 1, 5 months 1; breeds: Maltipoo 7, Pomeranian 7, Poodle 6, Pomsky 4, Maltese 2, Bichon 1. The home and puppies pages show the first 5 as the "already gone home" strip (Ace, Leo, Mia, Sadie and the unnamed Pomeranian).

## 6. Family photos (64)

Placeholders replace the images (decision D13). Only the metadata below is kept. The reference shows the wall in this order; 8 items have captions, all with emoji, and the other 56 have none.

| # | Media id | Size (w×h) | Format | Caption |
|---|---|---|---|---|
| 1 | `TUslu26Ueaq-` | 960×1280 | jpeg | (none) |
| 2 | `OcgEePeBmGuu` | 1320×1254 | jpeg | (none) |
| 3 | `RYkyuv4DBCTC` | 960×1280 | jpeg | (none) |
| 4 | `d267R4d3lMSv` | 1320×1254 | jpeg | (none) |
| 5 | `XqxhmNftVKic` | 960×1280 | jpeg | (none) |
| 6 | `1II_yVrwWdOG` | 1320×1587 | jpeg | (none) |
| 7 | `bKP7vwN0R2OU` | 960×1280 | jpeg | (none) |
| 8 | `ToVkYw_K3UrY` | 1200×1600 | jpeg | (none) |
| 9 | `stDfO2jMfvb_` | 1289×1481 | jpeg | (none) |
| 10 | `K-U7RwW9j2A9` | 1289×1330 | jpeg | (none) |
| 11 | `s23WYu0qJQ_h` | 433×433 | jpg | (none) |
| 12 | `ab5hEGUKO4aY` | 960×1280 | jpeg | (none) |
| 13 | `yEfM9sdMluCX` | 1306×1600 | jpeg | (none) |
| 14 | `_41LE-nBf847` | 433×433 | jpg | (none) |
| 15 | `tuarxe-C9j5H` | 433×433 | jpg | (none) |
| 16 | `UuJqjsRN-wKL` | 2150×2686 | jpg | (none) |
| 17 | `qZ5mPGpLO-G9` | 1200×1600 | jpg | (none) |
| 18 | `xHEMhVTwflC_` | 844×1327 | jpg | (none) |
| 19 | `QYUwdroeZC35` | 787×1339 | jpg | (none) |
| 20 | `rZE7ypWUH0wz` | 959×1280 | jpg | (none) |
| 21 | `Sg8iy_EOrJah` | 3120×4160 | jpg | (none) |
| 22 | `CVsVLsnCV0L3` | 2142×2856 | jpg | (none) |
| 23 | `1ziQH1fmyl-k` | 2142×2856 | jpg | (none) |
| 24 | `2BoSaeBhLer8` | 2142×2856 | jpg | (none) |
| 25 | `QLO4DWvoWlJY` | 960×1280 | jpg | (none) |
| 26 | `xaIi_2gMoj_N` | 2142×2856 | jpg | (none) |
| 27 | `GyAYtgNRGHUw` | 2142×2856 | jpg | (none) |
| 28 | `NCnzIyNwzZiC` | 2142×2856 | jpg | (none) |
| 29 | `2RCKCPAW7oIk` | 2142×2856 | jpg | (none) |
| 30 | `d9RWhCKfRHOc` | 2142×2856 | jpg | (none) |
| 31 | `tI7E08CB-sVp` | 960×1280 | jpg | (none) |
| 32 | `uL-D7uBZjs12` | 960×1280 | jpg | (none) |
| 33 | `AK4nDMw3v53a` | 960×1280 | jpg | (none) |
| 34 | `SXZSpIZJimpQ` | 1200×1600 | jpg | (none) |
| 35 | `NBeJ3y_g-Iee` | 720×1280 | jpg | (none) |
| 36 | `6Abv8pfqHoEA` | 2142×2856 | jpg | (none) |
| 37 | `UFzHrheMHQmi` | 720×1280 | jpg | (none) |
| 38 | `937wIvKxefpy` | 2142×2856 | jpg | (none) |
| 39 | `BxM75hECdt9p` | 2142×2856 | jpg | (none) |
| 40 | `O88qTc2s7KH8` | 2142×2856 | jpg | (none) |
| 41 | `PAAMBTTfmXOK` | 2142×2856 | jpg | (none) |
| 42 | `9A74-QBbi78w` | 2142×2856 | jpg | (none) |
| 43 | `0wEBefsp1F5j` | 784×1280 | jpg | (none) |
| 44 | `hu2K_kmYs7s9` | 958×1280 | jpg | (none) |
| 45 | `LpUvbTEyekwN` | 480×640 | jpg | (none) |
| 46 | `dI8Jv0KRTiLJ` | 433×433 | jpg | Lulu 🧸 with her new mummy ❤️ |
| 47 | `TI-WtaFssfQt` | 433×433 | jpg | Adorable Maltipoo baby 🧸❤️ |
| 48 | `j6T9eswP2eS8` | 433×433 | jpg | My new teddy puppy 🥰🧸 |
| 49 | `HJgL4rRnmReV` | 433×433 | jpg | Our new puppies 🧸🥰🤗 |
| 50 | `uc5ANs5jm7r7` | 433×433 | jpg | New puppy 🧸😍 |
| 51 | `pRJubyqHw8p7` | 433×433 | jpg | Gang of 3 😍🧸 |
| 52 | `4wOJk9azop_-` | 433×433 | jpg | So happy 😍😍 |
| 53 | `2ZpD4FCAriYZ` | 433×433 | jpg | (none) |
| 54 | `BarQuR6VS6XX` | 433×433 | jpg | (none) |
| 55 | `l_M8IYdzFJHb` | 433×433 | jpg | (none) |
| 56 | `aAf69e7YtFrb` | 433×433 | jpg | (none) |
| 57 | `qesMnrX7cliq` | 433×433 | jpg | (none) |
| 58 | `sqPa3JOR3OPc` | 433×433 | jpg | (none) |
| 59 | `3h20rIasJCOa` | 433×433 | jpg | New pup 🤗💫 |
| 60 | `NaV9L3-u1vss` | 340×403 | avif | (none) |
| 61 | `EINH5_Xbws14` | 535×467 | avif | (none) |
| 62 | `wyDhW6yEQ6ef` | 1618×809 | png | (none) |
| 63 | `n6BJMOg_-QYI` | 1512×1321 | jpg | (none) |
| 64 | `nTiIYDlSaIjG` | 720×405 | avif | (none) |

## 7. FAQs (9) and testimonial

Order is the display order on `/faq`; the home page shows the first 3. The same text appears as `FAQPage` JSON-LD.

1. **Are your puppies vaccinated and health-checked?**  
   Yes. All our puppies come with a verified health certificate from licensed vets. Every puppy is vaccinated, dewormed, and thoroughly checked before joining your family.
2. **Can I meet a puppy before I decide?**  
   Yes. Come meet our locally available puppies in our Downtown Dubai showroom and spend time bonding before making your decision.
3. **Can I take my puppy home the same day?**  
   Local puppies are available immediately, so you can take your puppy home the same day.
4. **Do you import puppies from abroad?**  
   Yes. Through our Order Upon Request service we source rare and premium teacup breeds from the most reputable, certified breeders across Europe, Korea, and beyond — and we handle the import for you.
5. **How does an imported puppy travel to Dubai?**  
   We manage every part of the import process, including health checks, travel arrangements, and the necessary documentation, so your puppy arrives happy, healthy, and stress-free.
6. **Will I see photos and health details first?**  
   Yes. Photos, videos, and health certificates are shared before your puppy travels, and our team sends real photos and health details directly on WhatsApp.
7. **Do you deliver?**  
   Yes. We deliver within Dubai, and our trusted international cargo partners deliver puppies safely to loving homes all around the world.
8. **Which breeds do you usually have?**  
   Breeds we regularly have include Maltipoo, Pomeranian, Poodle and Bichon, plus rare teacup lines such as Korean teacup poodles, Maltese, Pom and Yorkie.
9. **Is there help after my puppy comes home?**  
   Yes. Our team is available 24/7 and offers advice on training, nutrition, and general care to ensure a smooth transition for you and your new furry friend.

**Testimonial (1):** "TeddyPups truly made our dream a reality. They supported us at every step of the import journey. Our Maltipoo arrived healthy, cheerful, and absolutely perfect. Having 24/7 support throughout the process gave us complete peace of mind." The reference attributes it to a real customer ("Sarah M., Dubai, UAE"); the mock uses a fictitious attribution (section 12).

## 8. Settings, links and templates

| Item | Value |
|---|---|
| WhatsApp number | `971541676733` (display "+971 54 167 6733"; `tel:+971541676733`) |
| Generic WhatsApp text | "Hi TeddyPups! I'd love to know more about your puppies." (`https://wa.me/971541676733?text=…`) |
| Email | `teddypupsadmin@gmail.com` |
| Address | "Downtown Dubai, United Arab Emirates" |
| Maps link | `https://maps.app.goo.gl/ZdJvwHBSQWWZT54s7` |
| Instagram | `https://www.instagram.com/teddypups.worldwide/` |
| TikTok | `https://www.tiktok.com/@teddypupsuae` |
| Facebook | `https://www.facebook.com/profile.php?id=61567496944539` |
| Tagline | "every puppy is family"; footer line "Home, at last." |

**Per-puppy WhatsApp text and enquiry form copy (patterns observed):**

| Slug (example) | WhatsApp text on the detail page | Form prefilled message | Form title |
|---|---|---|---|
| `maltipoo-max-male` | Hi TeddyPups! I'm interested in Max, the Maltipoo: https://puppy.instabizweb.com/puppies/maltipoo-max-male | Hi! I'd love to know more about Max (Maltipoo). | Ask about Max |
| `korean-teacup-pomeranian` | Hi TeddyPups! I'm interested in the Korean Teacup Pomeranian (girl): https://puppy.instabizweb.com/puppies/korean-teacup-pomeranian | Hi! I'd love to know more about Korean Teacup Pomeranian. | Ask about this puppy |
| `toy-poodle-male-female` | Hi TeddyPups! I'm interested in the Toy Poodle (boy & girl): https://puppy.instabizweb.com/puppies/toy-poodle-male-female | Hi! I'd love to know more about Toy Poodle. | Ask about this puppy |
| `copper-male` | Hi TeddyPups! I'm interested in Copper, the Cavapoo: https://puppy.instabizweb.com/puppies/copper-male | Hi! I'd love to know more about Copper (Cavapoo). | Ask about Copper |
| `pomeranian-ace-boy` | Hi TeddyPups! I loved Ace (https://puppy.instabizweb.com/puppies/pomeranian-ace-boy). Do you have a puppy like them? | Hi! I'd love to know more about Ace (Pomeranian). | Looking for a puppy like this? |
| `puppy` | Hi TeddyPups! I loved the Maltipoo (https://puppy.instabizweb.com/puppies/puppy). Do you have a puppy like them? | Hi! I'd love to know more about Maltipoo. | Looking for a puppy like this? |
| `maltipo` | Hi TeddyPups! I loved the Poodle (https://puppy.instabizweb.com/puppies/maltipo). Do you have a puppy like them? | Hi! I'd love to know more about Poodle. | Looking for a puppy like this? |
| `blue-marle-pomeranian` | Hi TeddyPups! I loved the Pomeranian (https://puppy.instabizweb.com/puppies/blue-marle-pomeranian). Do you have a puppy like them? | Hi! I'd love to know more about Pomeranian. | Looking for a puppy like this? |

Patterns: named available puppy: `Hi TeddyPups! I'm interested in {Name}, the {Breed}: {url}`, message `Hi! I'd love to know more about {Name} ({Breed}).`, title `Ask about {Name}`; unnamed available puppy: `Hi TeddyPups! I'm interested in the {displayName} ({sex}): {url}`, message `Hi! I'd love to know more about {displayName}.`, title `Ask about this puppy`; gone-home: `Hi TeddyPups! I loved {Name or "the " + Breed} ({url}). Do you have a puppy like them?`, message `Hi! I'd love to know more about {Name or Breed}[ ({Breed})].`, title `Looking for a puppy like this?`.

**Page metadata templates:**

| Page | Title | Description |
|---|---|---|
| Named puppy detail | `{Name}, {Breed} puppy \| TeddyPups U.A.E.` | `Meet {Name}: {Breed}, {sex}, {age} old, {imported \| in Dubai}. Real photos[ and video] from TeddyPups U.A.E.` |
| Unnamed puppy detail | `{displayName} puppy ({sex}) \| TeddyPups U.A.E.` | `Meet this {Breed}: {displayName}, {sex}, {age} old, {imported \| in Dubai}. Real photos from TeddyPups U.A.E.` |
| Unknown slug | `Puppy not found \| TeddyPups U.A.E.` | not observed |

Both detail page types add a `BreadcrumbList` JSON-LD (Puppies, then the puppy name); the home page adds `PetStore` with `PostalAddress`.

## 9. Page copy inventory (static content)

Text that is not in a dataset but must be reproduced is held in typed content files under `modules/content/infrastructure/static/`. Word counts show the size of each page's copy; headings are extracted; the full text is produced by the F3 extraction script and verified against these counts.

| Page | Title | Meta description | Words | H2 count | H2 headings (first 8) |
|---|---|---|---|---|---|
| home | TeddyPups U.A.E. — Premium teacup puppies in Dubai | Teddy bear and teacup puppies in Dubai. Meet local puppies in our Downtown Dubai showroom or bring home a rare breed imported from trusted breeders. | 570 | 7 | Meet the pups; Two ways to meet your puppy; Your puppy journey; Why families trust TeddyPups; Happy families & puppies; Questions, answered; Ready to meet your new best friend? |
| puppies | Available puppies | TeddyPups U.A.E. | Teacup and teddy bear puppies available now in Dubai and imported from trusted breeders — every listing shows real photos of the puppy. | 123 | 1 | Already gone home |
| gone-home | Gone home | TeddyPups U.A.E. | TeddyPups puppies who have already joined their families. | 172 | 0 |  |
| happy-families | Happy families | TeddyPups U.A.E. | Real photos shared by TeddyPups families after welcoming their new puppy home. | 106 | 0 |  |
| how-it-works | How it works | TeddyPups U.A.E. | Meet a local puppy in our Downtown Dubai showroom or reserve a premium teacup breed imported for you — every step, from choosing to coming home. | 701 | 5 | Two ways home; Our premium puppy promise; Delivery & collection; Why choose us; Unique and high quality puppies |
| faq | Questions & answers | TeddyPups U.A.E. | Answers about TeddyPups puppies: health checks and vaccinations, meeting local puppies, imported teacup breeds and delivery. | 285 | 9 | Are your puppies vaccinated and health-checked?; Can I meet a puppy before I decide?; Can I take my puppy home the same day?; Do you import puppies from abroad?; How does an imported puppy travel to Dubai?; Will I see photos and health details first?; Do you deliver?; Which breeds do you usually have? |
| contact | Visit & contact | TeddyPups U.A.E. | Visit TeddyPups in Downtown Dubai or get in touch on WhatsApp, by phone or email. | 147 | 1 | Visit us in Downtown Dubai |

Static copy blocks to be captured as content files: home (hero, meet, two ways, journey steps with three phone states, passport entries, families intro, FAQ preview, CTA), puppies (header, filter labels, gone-home strip), gone-home (header, kiosk), happy families (header, count line), how it works (anchors, toggle labels, both panels with four steps each, promise stamps, delivery blocks, why choose us, CTA card), FAQ (header, search labels), contact (header, shopfront card, letter sentence template), footer, detail page fixed copy (checklist, four steps, form labels), 404.

## 10. Media metadata and placeholder plan

| Item | Spec |
|---|---|
| Items needing a placeholder | 132 puppy media references (130 unique ids) and 64 family photos; plus 4 to 6 video posters |
| Generated by | A script in the F3 phase that reads the media metadata and writes one small SVG per item |
| Placeholder content | Dominant colour as background, a soft shape at the recorded focal point, the item's width and height as the SVG viewBox (so aspect ratios and layout match), small caption of the breed or "photo n", and a play marker for videos with a poster SVG |
| Dimensions seen | Puppies: 720×405 (68 items), 1200×1600 (21), 960×1280 (16), 980×551 (4), others; families: 433×433 (17), 2142×2856 (14), 960×1280 (9), 1200×1600 (3), others |
| Blur placeholders | Not copied; the placeholder SVG itself is the blur-up stage |
| Size budget | Under 3 KB per SVG, about 600 KB for the whole set |
| Alt text | Kept from the reference ("Male Maltipoo puppy" style); families keep "A happy TeddyPups family with their new puppy" |
| Video | Placeholder poster plus a short silent placeholder clip is **not** generated; the gallery shows the poster with a play control that reveals an "example video" notice, to be replaced when real media is approved |
| Replacement later | Real media can replace placeholders by changing `url` fields, with no code change |

## 11. Fixture layout and validation

| Fixture file (target) | Module | Records |
|---|---|---|
| `modules/catalog/infrastructure/mock/fixtures/puppies.available.json` | catalog | 15 |
| `modules/catalog/infrastructure/mock/fixtures/puppies.gone-home.json` | catalog | 27 |
| `modules/catalog/infrastructure/mock/fixtures/media.json` | catalog | 132 references |
| `modules/content/infrastructure/mock/fixtures/families.json` | content | 64 |
| `modules/content/infrastructure/mock/fixtures/faqs.json` | content | 9 |
| `modules/content/infrastructure/mock/fixtures/settings.json` | content | 1 (+ testimonial) |
| `modules/content/infrastructure/static/*.ts` | content | Page copy per section 9 |
| `modules/crm/infrastructure/mock/` | crm | Enquiry form options (derived from available puppies) |

**Fixture acceptance tests (F3):**

1. Counts: 15 available, 27 gone-home, 42 slugs, 132 media references, 64 family photos, 9 FAQs, 16 contact options.
2. Every slug unique; every detail slug resolves; unknown slug returns `null`.
3. Every media item has `url`, `width`, `height`, `alt`, `focalX`, `focalY`, `color`, `kind`.
4. 4 puppies have at least one video; total videos 6.
5. Filters: `?breed=maltipoo` returns the puppies with Maltipoo in their breed list; the previous/next chain visits all 15 available puppies in order.
6. The WhatsApp text, form prefill, page title and description templates in section 8 produce the observed strings for the sample slugs listed there.
7. No fixture contains an email, phone number or full personal name other than the business's own contact details.

## 12. Privacy handling of the dataset (`06` section 6.15)

| Item | Handling |
|---|---|
| Customer photos and the faces of customers and children on the families wall | **Never copied.** Placeholders only |
| Testimonial attribution "Sarah M., Dubai, UAE" | Replace with a fictitious attribution (for example "A. K., Dubai, UAE") |
| Family captions (pet names with emoji such as "Lulu with her new mummy") | Pet names are not personal data; captions are kept for layout and tone, reviewed once for any person's name |
| Puppy names (Ace, Leo, Mia and so on) | Animals; kept |
| Business phone, email, address and social links | Business contact details are public; kept |
| Evidence snapshots (extracted JSON, saved HTML) | Stored in the **untracked** `docs/05-research/evidence/` folder only |

## 13. Reproducibility

The extraction (scratch scripts used on 2026-11-02) read the reference pages' embedded data and rendered markup. In F3 the extraction script is added to the repository (`scripts/extract-fixtures`), writes the fixtures, and is run by hand; fixtures are committed, the script is not part of the app. A local JSON snapshot of this extraction is kept in the untracked evidence folder (`docs/05-research/evidence/data-snapshot/`) for comparison.

## 14. Known gaps (do not invent)

| # | Gap | How to close |
|---|---|---|
| G1 | Behaviour of `/puppies?origin=local` (no local puppies, no Local chip) | Check the live page in a browser; copy its behaviour |
| G2 | How the "Boys" and "Girls" filters treat the pair entry (`male-female`) | Check live behaviour |
| G3 | Whether multi-select within a filter row is OR or AND (`Imported` + `Korean Teacup` showed 1 puppy in the video) | Check live behaviour with controlled selections |
| G4 | Previous/next order for gone-home pages (confirm it is list order) | Compare with the live page |
| G5 | Exact text for unnamed gone-home puppies' headings and breadcrumbs | Check three samples live |
| G6 | Empty-result state of the filters | Select a combination with no match (for example Korean Teacup + Shih Tzu) |
| G7 | Static copy for home, how it works and contact sections | Produced by the F3 extraction and diffed against section 9 counts |
| G8 | Whether the two shared media ids (`9w3Xrwp8VCQp`, `4vu6_PGfL64H`) are intentional duplicates | Not important for placeholders |

## Open questions

1. Approve a fictitious testimonial attribution (and which)?
2. Keep the two odd gone-home slugs `puppy` and `maltipo`, and the unnamed entries, exactly as the reference has them?
3. For `?origin=local`, copy the reference's behaviour once checked, or show a friendly empty state with a link to imported puppies?
4. Should the contact form's puppy options always mirror the available puppies (as on the reference)?
