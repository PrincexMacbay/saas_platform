# Plan-Coupon Association Implementation

## Overview

This implementation allows coupons to be associated directly with plans. When creating or editing a plan, you can select a coupon that will be available for that specific plan. Users entering the coupon code during application will get the discount if the code matches the plan's associated coupon and is still valid.

## Benefits

1. **Simplified Management**: Coupons are tied directly to plans, making it clear which coupon applies to which plan
2. **Better Validation**: The system checks if the entered coupon code matches the plan's associated coupon
3. **Flexible**: Coupons can be created before or after plans, and can be assigned later
4. **Backward Compatible**: Still supports the old `applicablePlans` method for legacy coupons

## Database Changes

### Plan Model
- Added `couponId` field (optional foreign key to `coupons` table)
- Allows plans to have one associated coupon

### Model Relationships
- `Plan.belongsTo(Coupon, { foreignKey: 'couponId', as: 'coupon' })`

## Backend Changes

### 1. Plan Model (`server/models/Plan.js`)
- Added `couponId` field with foreign key reference to coupons table

### 2. Plan Controller (`server/controllers/planController.js`)
- **createPlan**: Now accepts `couponId` in request body and validates it
- **updatePlan**: Now accepts `couponId` and allows updating/removing coupon association
- **getPlans**: Includes coupon information in response
- **getPlan**: Includes coupon information in response

### 3. Public Routes (`server/routes/public.js`)
- **GET /public/plans**: Includes coupon information
- **GET /public/plans/:id**: Includes coupon information
- **POST /public/validate-coupon**: 
  - **NEW**: Checks if plan has an associated coupon first
  - If plan has a coupon, validates that the entered code matches
  - Falls back to `applicablePlans` check for legacy support
- **POST /public/apply**: 
  - **NEW**: Checks plan's associated coupon when validating coupon code
- **POST /public/application-payment**: 
  - **NEW**: Prioritizes plan's associated coupon when calculating discount
  - Falls back to application's coupon if plan doesn't have one

## How It Works

### Creating a Plan with Coupon

1. Create a coupon first (or use an existing one)
2. When creating a plan, include `couponId` in the request body
3. The system validates that:
   - The coupon exists
   - The coupon is active
   - The user owns the coupon (createdBy matches)

### Applying a Coupon

1. User selects a plan
2. User enters a coupon code
3. System validates:
   - If plan has an associated coupon → code must match exactly
   - If plan doesn't have a coupon → checks `applicablePlans` (legacy)
   - Coupon is still valid (not expired, not maxed out)
4. Discount is calculated and applied

### Payment Processing

1. System checks plan's associated coupon first
2. If plan has a coupon and application's code matches → uses plan's coupon
3. Otherwise, falls back to application's stored coupon
4. Validates amount matches calculated discount

## Migration Required

You'll need to add the `couponId` column to the `plans` table. The system will automatically create it on next sync, or you can run:

```sql
ALTER TABLE plans 
ADD COLUMN couponId INTEGER REFERENCES coupons(id) ON DELETE SET NULL;
```

## Frontend Changes Needed

1. **Plan Creation/Edit Form**: Add a dropdown to select a coupon
2. **Plan Display**: Show associated coupon information
3. **Coupon Validation**: Update to show plan-specific coupon requirements

## API Changes

### Create Plan
```json
POST /api/membership/plans
{
  "name": "Premium Plan",
  "fee": 99.99,
  "couponId": 5,  // NEW: Optional coupon ID
  ...
}
```

### Update Plan
```json
PUT /api/membership/plans/:id
{
  "couponId": 5,  // NEW: Can set, update, or remove (null)
  ...
}
```

### Plan Response (includes coupon)
```json
{
  "id": 1,
  "name": "Premium Plan",
  "fee": 99.99,
  "coupon": {  // NEW: Associated coupon info
    "id": 5,
    "name": "Summer Sale",
    "couponId": "SUMMER50",
    "discount": 50,
    "discountType": "percentage"
  },
  ...
}
```

## Testing Checklist

- [ ] Create a coupon
- [ ] Create a plan with the coupon
- [ ] Verify plan includes coupon in response
- [ ] Apply with matching coupon code → should work
- [ ] Apply with wrong coupon code → should reject
- [ ] Update plan to change/remove coupon
- [ ] Test with plans that don't have coupons (legacy support)
- [ ] Test payment processing with plan's coupon
- [ ] Test payment processing with application's coupon (fallback)
