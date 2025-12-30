# Database Storage for Application Forms and Digital Cards

## How Forms Are Stored in the Database

### Application Forms Table Structure

The `application_forms` table stores all application forms with the following key fields:

```sql
- id (PRIMARY KEY)
- title
- description
- fields (JSON - contains all form field configurations)
- isPublished (BOOLEAN)
- createdBy (INTEGER - user who created the form)
- planId (INTEGER, NULLABLE) ← KEY FIELD
- createdAt, updatedAt (timestamps)
```

### Storage Logic

**YES, forms are saved in the database for each specific plan, but with a flexible structure:**

1. **General Forms (planId = NULL)**
   - Stored as a single record in `application_forms` table
   - `planId` field is `NULL`
   - Can be used by ANY plan
   - Example: One general form record can serve multiple plans

2. **Plan-Specific Forms (planId = specific plan ID)**
   - Stored as separate records in `application_forms` table
   - Each plan-specific form has its own row with `planId` set to that plan's ID
   - Example: 
     - Form ID 1: planId = NULL (general form)
     - Form ID 2: planId = 5 (form for Plan A)
     - Form ID 3: planId = 6 (form for Plan B)

### Database Examples

**Scenario 1: One General Form**
```
application_forms table:
┌────┬─────────────────────┬────────┬─────────────┐
│ id │ title               │ planId │ isPublished │
├────┼─────────────────────┼────────┼─────────────┤
│ 1  │ Membership Form     │ NULL   │ true        │
└────┴─────────────────────┴────────┴─────────────┘
```
- This one form can be used by all plans

**Scenario 2: General + Plan-Specific Forms**
```
application_forms table:
┌────┬─────────────────────┬────────┬─────────────┐
│ id │ title               │ planId │ isPublished │
├────┼─────────────────────┼────────┼─────────────┤
│ 1  │ Membership Form     │ NULL   │ true        │
│ 2  │ Premium Form        │ 5      │ true        │
│ 3  │ Basic Form          │ 6      │ true        │
└────┴─────────────────────┴────────┴─────────────┘
```
- Form 1: General (used by plans without specific forms)
- Form 2: Specific to Plan ID 5
- Form 3: Specific to Plan ID 6

### How Plans Reference Forms

The `plans` table has:
```sql
- applicationFormId (INTEGER, NULLABLE) - Direct link to form ID
- useDefaultForm (BOOLEAN) - If true, use organization default
```

**When a plan uses a form:**
- If `useDefaultForm = true`: Uses organization's general form (planId = NULL)
- If `useDefaultForm = false`: Uses the form specified in `applicationFormId`

## How Digital Cards Are Stored

### Digital Cards Table Structure

The `digital_cards` table stores templates and user-specific cards:

```sql
- id (PRIMARY KEY)
- logo, organizationName, cardTitle, etc. (design fields)
- userId (INTEGER, NULLABLE)
- subscriptionId (INTEGER, NULLABLE)
- isTemplate (BOOLEAN) - true for templates, false for user cards
- planId (INTEGER, NULLABLE) ← KEY FIELD (for templates only)
- createdAt, updatedAt (timestamps)
```

### Storage Logic

**Similar to forms, digital card templates are stored per plan:**

1. **General Templates (planId = NULL)**
   - One template record with `planId = NULL`
   - Used by all plans that don't have a specific template

2. **Plan-Specific Templates (planId = specific plan ID)**
   - Separate template records, one per plan
   - Each has `planId` set to that plan's ID

### Database Examples

**Digital Card Templates:**
```
digital_cards table (isTemplate = true):
┌────┬─────────────────────┬────────┬─────────────┐
│ id │ organizationName    │ planId │ isTemplate  │
├────┼─────────────────────┼────────┼─────────────┤
│ 1  │ My Organization     │ NULL   │ true         │
│ 2  │ My Organization     │ 5      │ true         │
│ 3  │ My Organization     │ 6      │ true         │
└────┴─────────────────────┴────────┴─────────────┘
```

## Key Points

✅ **Each plan-specific form/card is a separate database record**
- Changing a form's plan association creates a NEW record
- Original records are preserved

✅ **General forms/cards (planId = NULL) are shared**
- One record can serve multiple plans
- More efficient storage

✅ **Plans reference forms/cards via foreign keys**
- `plans.applicationFormId` → `application_forms.id`
- `plans.digitalCardTemplateId` → `digital_cards.id`

✅ **Database relationships:**
- One-to-many: One plan can reference one form/card
- Many-to-one: Many forms/cards can exist (general + plan-specific)
- Forms/cards are NOT duplicated per plan - they're stored once per plan association

## Summary

**Question: Are forms saved in the database for each specific plan?**

**Answer:** Yes, but not duplicated. Each form is stored as a separate record:
- **General forms**: 1 record (planId = NULL) shared by all plans
- **Plan-specific forms**: 1 record per plan (planId = plan ID)

The same applies to digital card templates. This design allows:
- Efficient storage (no duplication)
- Flexibility (general or plan-specific)
- Easy management (each form/card is a distinct database record)

