# Local Care nomination form → Zapier → Monday.com: setup guide

Everything needed to make the nomination form at the bottom of
**tlbcleaning.com.au/local-care/** create an item in a Monday.com board, using
Zapier. Allow about 30 minutes.

The website side is built. **The form will not submit until step 5 is done.**
Until then it renders normally but tells the reader it is not connected and
gives them the phone number and email, rather than thanking them for a
nomination that went nowhere.

Same Zapier plan requirement as the contact form: **"Webhooks by Zapier" needs
Starter or above.** See MONDAY-FORM-SETUP.md for the detail behind every step
here; this guide only covers what is different.

> ### Keep nominations out of the enquiry board
> Build a **new Zap with its own catch hook** and a **new board**. Do not
> reuse the contact form's hook or the "Website Enquiries" board. A
> nomination is not a lead: in the enquiries board it would be quoted,
> chased and counted as a conversion, and the person who wrote in about a
> struggling neighbour would get a sales call.

---

## How it fits together

```
Reader fills the nomination form on /local-care/
        │  POST  (application/x-www-form-urlencoded)
        ▼
Zapier trigger: Webhooks by Zapier → Catch Hook     ← its OWN hook (step 2)
        │
        ▼
Zapier action: monday.com → Create Item
        │
        ▼
Monday.com board: "Local Care Nominations"
```

The page is not linked from the menu and is kept out of Google until James
signs it off, but anyone with the URL can use the form, so it is worth
connecting before the page is shared for review.

---

## Step 1: Build the Monday board

Create a board called **Local Care Nominations** with these columns.

| Column name | Monday column type | Holds |
|---|---|---|
| *(item name)* | (built in) | The nominee's name. |
| **Town** | Text | The nominee's town. |
| **Why they could use a hand** | Long Text | The nominator's story. |
| **Nominated by** | Text | The nominator's name. |
| **Nominator phone** | Phone | Set the country to **Australia (+61)**. |
| **Nominator email** | Email | |
| **Nominee knows** | Checkbox | Ticked = Yes. (A Dropdown with labels `Yes` and `No` also works.) |
| **Happy to be contacted** | Checkbox | Ticked when the nominator ticked the box. |
| **Status** | Status | Your selection process. Suggested labels below. |
| **Source Page** | Text | Always `/local-care/` today. |
| **Submitted** | Date | Tick **"Show time"** when creating it. |

> ### ⚠️ If you use Dropdowns instead of Checkboxes
> Monday silently drops a dropdown value it does not already have. Type the
> labels as `Yes` and `No` with a capital first letter and nothing else, or
> those two cells will arrive blank and nothing will warn you.

**Suggested Status labels** (Zapier sets every new item to **New**):

```
New
Shortlisted
Chosen this month
Contacted
Clean booked
Done
Not this time
```

Avoid "winner" or "won" as labels. The page avoids "win" and "prize" so
Local Care reads as a choice, not a chance giveaway under NSW and QLD
promotion rules, and the board is where that wording leaks out (into a
reply email, a screenshot, a post).

> **Restrict who can see this board.** Nominations describe people who are
> unwell, older, grieving or short of money, often written by someone else
> without them reading it. Make it a private board, shared only with the
> people who choose each month.

---

## Step 2: Create the Zap and copy the webhook URL

1. **Zapier → Create → Zaps → New Zap.** Name it `TLB Local Care nominations`.
2. **Trigger:** **Webhooks by Zapier**, event **Catch Hook** (not Catch Raw
   Hook). Leave "Pick off a Child Key" empty.
3. Copy **"Your webhook URL"**. It looks like
   `https://hooks.zapier.com/hooks/catch/12345678/abcdefg/`.
4. Do not click **Test trigger** yet. Zapier needs a real submission first
   (step 3).

---

## Step 3: Send a test nomination

> ### ⚠️ Fill in every field AND tick "They're happy to be contacted"
> Zapier builds its list of fields from the test submission, and a field
> that was empty in the test does not appear when you map the Monday
> columns. The tick box is the one that catches people out: unticked, it
> arrives empty and Zapier will not offer it. Tick it on the test.

1. Put the webhook URL in your local `.env`:

   ```
   PUBLIC_NOMINATION_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/...
   ```

   Then run `npm run dev` and open `http://localhost:4321/local-care/`.
   (Or set the variable on the **staging** Render service and test there.)
2. Fill in every field, choose **Yes** for "Do they know you're nominating
   them?", tick **"They're happy to be contacted"**, and press
   **Nominate a property**. The form should be replaced by "Thank you for
   telling us."
3. In Zapier, click **Test trigger**. You should see the ten fields below.

### What arrives

| Field | Example | Notes |
|---|---|---|
| `yourName` | `Sam Taylor` | Required. The nominator. |
| `yourPhone` | `0400 000 000` | Required. Accepted as typed, not reformatted. |
| `yourEmail` | `sam@example.com` | Required. Checked as a valid address. |
| `nomineeName` | `Margaret` | Required. The person or place nominated. |
| `nomineeTown` | `Casino` | Required. Free text; the form suggests the site's towns but any town can be typed. |
| `whyTheyNeedAHand` | `Margaret had a hip replacement in...` | Required. |
| `nomineeKnows` | `Yes` | Required. Always `Yes` or `No`. |
| `happyToBeContacted` | `Yes` | **Optional.** `Yes` when ticked, empty when not. |
| `sourcePage` | `/local-care/` | Added by the page. |
| `submittedAt` | `2026-11-03T04:12:33.481Z` | Added by the page. ISO 8601, **UTC**. |

All ten are sent on every submission, the unticked box as an empty string.
The list lives in `src/data/nominationForm.ts` (`nominationFields`).

> **Read `nomineeKnows` and `happyToBeContacted` together before anyone
> calls a nominee.** "No" means the nominee has no idea they were put
> forward. A surprise call about a free clean of someone's home can land
> badly; speak to the nominator first.

---

## Step 4: Add the Monday action and map the fields

1. **Action:** **monday.com**, event **Create Item**. Use the same monday.com
   connection as the enquiry Zap.
2. **Board:** `Local Care Nominations`. **Group:** wherever new nominations
   should land.
3. Map the columns:

| Monday column | Map to |
|---|---|
| **Item Name** | `nomineeName` |
| **Town** | `nomineeTown` |
| **Why they could use a hand** | `whyTheyNeedAHand` |
| **Nominated by** | `yourName` |
| **Nominator phone** | `yourPhone` |
| **Nominator email** | `yourEmail` (if Zapier shows separate email and text boxes, put it in both) |
| **Nominee knows** | `nomineeKnows` |
| **Happy to be contacted** | `happyToBeContacted` |
| **Status** | type `New` (a fixed value, not a field) |
| **Source Page** | `sourcePage` |
| **Submitted** | `submittedAt` |

   **Checkbox columns show as a fixed Yes / No toggle in Zapier.** To map
   a field into one, click the **⋮** beside it, choose **Custom** (or
   "Enter custom value"), then insert `nomineeKnows` or
   `happyToBeContacted` from the trigger. Zapier reads `Yes` as ticked and
   `No` or empty as unticked. If the test leaves the boxes unticked anyway,
   add a **Formatter by Zapier → Utilities → Lookup Table** step first
   (`Yes` → `true`, fallback `false`) and map its output instead.

4. **Timezone:** `submittedAt` is UTC. If your Zapier account timezone is
   already **Australia/Sydney** from the enquiry Zap, nothing to do.
   Otherwise follow the timezone note in MONDAY-FORM-SETUP.md step 3.
5. **Test the action** and check the item in the board, especially the two
   Yes/No columns, since those are the ones that fail silently.
6. **Optional but recommended:** add a second action, **Email by Zapier →
   Send Outbound Email** (or Gmail), to whoever reads nominations, so a new
   story does not sit unseen in the board. One extra task per nomination.
7. **Publish the Zap.**

When the mapping is done, clear the `.env` line (or point it at a test Zap)
so local testing stops creating real nominations.

---

## Step 5: Point the live site at the webhook

In **Render → the `tlbcleaning` service → Environment**, add:

| Key | Value |
|---|---|
| `PUBLIC_NOMINATION_WEBHOOK_URL` | the Zapier hook URL from step 2 |

Save and let Render redeploy. `render.yaml` already declares this variable
with `sync: false`, so a Blueprint sync will also prompt for it.

**Check the build log** for:

```
[FORM] nomination form endpoint: CONFIGURED
```

`NOT SET` means the variable did not reach the build and the live form will
still refuse to submit.

Then send one real test nomination on the live page, confirm it lands in the
board, and delete the test item.

**Staging:** the `tlbcleaning-staging` service has its own
`PUBLIC_NOMINATION_WEBHOOK_URL` slot. Point it at a separate test Zap and
board, or leave it empty. Sharing the live hook means every review on staging
drops a fake nomination into the real board.

---

## What the reader sees

| Outcome | What happens |
|---|---|
| Sent, Zapier replied OK | The form is replaced by "Thank you for telling us." in place. No redirect to `/thank-you/`, which is the enquiry form's page and counts in GTM as a lead. |
| Sent, but the request failed | "That did not send." plus the phone and email, and no invitation to retry (the nomination may have arrived anyway; a retry would duplicate it). |
| No webhook set | "This form is not connected yet." plus the phone and email. Nothing is sent. |
| A required field missing | The field is marked with a message and the cursor goes to the first one. Nothing is sent. |

The wording is editable in Pages CMS → **TLB Local Care (not live yet)** →
**Nomination form (closing section)**. It is not in the Local Care copy doc
yet, so get it signed off with the rest of the page.

---

## Spam

- **Honeypot (automatic).** A hidden `website` field no person sees. If a bot
  fills it, the page shows the thank-you and sends nothing, so it never
  reaches Zapier or uses a task.
- **If spam gets through anyway** (someone posting straight to the hook URL,
  which is visible in the page source): add a **Filter by Zapier** step before
  the Monday action that only continues when `sourcePage` is exactly
  `/local-care/` and `nomineeKnows` is `Yes` or `No`. Filtered runs cost no
  task. Do this only if it becomes a problem.

There is no `elapsedMs` timing field on this form, unlike the contact form.

---

## Things that will bite you later

- **A field is missing in the Zapier picker.** It was empty in your test.
  Send another test with everything filled and the box ticked, then re-run
  **Test trigger**.
- **An item with empty `sourcePage` and `Submitted` cells.** A reader with
  JavaScript off. The nomination is real; the browser posted it natively and
  they saw Zapier's plain response instead of the thank-you. In that case an
  unticked box is left out of the request rather than sent empty, which
  Zapier treats the same way.
- **A nominator says they sent one that never arrived.** The Zap was off,
  paused or out of tasks: the page got an OK from Zapier and showed the
  thank-you. Zapier emails the Zap owner on errors and auto-pauses a Zap that
  keeps failing, so make sure that address is read. The optional email action
  in step 4 is the backstop.
- **Changing a field** is a four-place change, in this order:
  1. `src/components/sections/NominationForm.astro` (the markup)
  2. `src/data/nominationForm.ts` (`nominationFields`)
  3. The Zap: send a test with the new field filled, re-run Test trigger, map it
  4. The board: add the column, and every label for a dropdown

---

## Checklist

- [ ] Zapier plan includes **Webhooks by Zapier** (Starter or above)
- [ ] Private board **Local Care Nominations** created with all 11 columns
- [ ] "Nominee knows" and "Happy to be contacted" are Checkboxes (or Dropdowns with exact `Yes` / `No` labels)
- [ ] Both mapped through **⋮ → Custom**, not left on the fixed toggle
- [ ] New Zap with its **own Catch Hook** (not the enquiry one)
- [ ] Test sent with every field filled **and the tick box ticked**
- [ ] All ten fields visible in Zapier and mapped
- [ ] Status set to the fixed value `New`
- [ ] Zap **published**
- [ ] Local `.env` line cleared or pointed at a test Zap
- [ ] `PUBLIC_NOMINATION_WEBHOOK_URL` set on the Render **production** service
- [ ] Build log shows `[FORM] nomination form endpoint: CONFIGURED`
- [ ] Live test nomination lands in the board (then delete it)
- [ ] Staging points at a different hook, or none
- [ ] Zapier error emails go to an address someone reads
