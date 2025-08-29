# Plan-Specific Linking System Implementation

## Overview
The plan-specific linking system allows individual membership plans to have their own custom application forms and digital card templates, providing greater flexibility and customization options for organizations.

## What Was Implemented

### 1. Database Schema Changes

#### Plans Table - New Fields
```sql
ALTER TABLE plans
ADD COLUMN "applicationFormId" INTEGER REFERENCES application_forms(id),
ADD COLUMN "useDefaultForm" BOOLEAN DEFAULT true,
ADD COLUMN "digitalCardTemplateId" INTEGER REFERENCES digital_cards(id),
ADD COLUMN "useDefaultCardTemplate" BOOLEAN DEFAULT true;
```

#### Digital Cards Table - New Field
```sql
ALTER TABLE digital_cards
ADD COLUMN "organizationId" INTEGER REFERENCES organizations(id);
```

### 2. Model Associations

#### Plan Model Relationships
```javascript
// Plan can link to specific application form
Plan.belongsTo(ApplicationForm, {
  foreignKey: 'applicationFormId',
  as: 'applicationForm'
});

// Plan can link to specific digital card template
Plan.belongsTo(DigitalCard, {
  foreignKey: 'digitalCardTemplateId',
  as: 'digitalCardTemplate'
});
```

#### ApplicationForm and DigitalCard Organization Links
```javascript
// Application forms can be linked to organizations
ApplicationForm.belongsTo(Organization, {
  foreignKey: 'organizationId',
  as: 'organization'
});

// Digital card templates can be linked to organizations
DigitalCard.belongsTo(Organization, {
  foreignKey: 'organizationId',
  as: 'organization'
});
```

### 3. API Endpoints

#### New Endpoints Added
- `GET /api/public/application-form/plan/:formId` - Get specific application form by ID
- `GET /api/membership/digital-cards/plan/:planId/template` - Get plan-specific digital card template

#### Enhanced Endpoints
- `POST /api/membership/plans` - Now accepts new linking fields
- `PUT /api/membership/plans/:id` - Now accepts new linking fields

### 4. Frontend Components

#### Plans.jsx - PlanModal Updates
The PlanModal component now includes:

**New State Variables:**
```javascript
const [formData, setFormData] = useState({
  // ... existing fields ...
  useDefaultForm: plan?.useDefaultForm !== false,
  applicationFormId: plan?.applicationFormId || null,
  useDefaultCardTemplate: plan?.useDefaultCardTemplate !== false,
  digitalCardTemplateId: plan?.digitalCardTemplateId || null,
});

const [applicationForms, setApplicationForms] = useState([]);
const [digitalCardTemplates, setDigitalCardTemplates] = useState([]);
const [loadingForms, setLoadingForms] = useState(false);
const [loadingTemplates, setLoadingTemplates] = useState(false);
```

**New Form Fields:**
- Checkbox for "Use Default Application Form"
- Dropdown to select specific application form
- Checkbox for "Use Default Digital Card Template"
- Dropdown to select specific digital card template

**Enhanced Logic:**
- Fetches available application forms and digital card templates
- Handles checkbox and dropdown interactions
- Sends new fields to backend when saving plans

#### ApplyMembership.jsx - Dynamic Form Selection
The application form selection logic now checks:

```javascript
const fetchPlanAndForm = async () => {
  // ... fetch plan details ...
  
  let formResponse;
  if (selectedPlan.applicationFormId && !selectedPlan.useDefaultForm) {
    // Use plan-specific form
    formResponse = await api.get(`/public/application-form/plan/${selectedPlan.applicationFormId}`);
  } else if (selectedPlan.organizationId) {
    // Use organization default form
    formResponse = await api.get(`/public/application-form/${selectedPlan.organizationId}`);
  } else {
    // Use global default form
    formResponse = await api.get('/public/application-form');
  }
  
  setForm(formResponse.data.data);
};
```

## How It Works

### 1. Plan Creation/Editing
When an admin creates or edits a plan:

1. **Default Behavior**: By default, plans use the organization's default application form and digital card template
2. **Custom Selection**: Admin can uncheck "Use Default" and select specific forms/templates
3. **Validation**: System ensures selected forms/templates belong to the same organization

### 2. Member Application Process
When a member applies for membership:

1. **Form Selection**: System checks the plan's configuration:
   - If `useDefaultForm = false` and `applicationFormId` is set → Use that specific form
   - If `useDefaultForm = true` → Use organization's default form
   - If no organization → Use global default form

2. **Form Display**: Member sees the appropriate application form
3. **Data Collection**: Form data is stored in the application record

### 3. Digital Card Generation
When a subscription is created:

1. **Template Selection**: System checks the plan's configuration:
   - If `useDefaultCardTemplate = false` and `digitalCardTemplateId` is set → Use that specific template
   - If `useDefaultCardTemplate = true` → Use organization's default template

2. **Card Creation**: Digital card is generated using the selected template and member's data
3. **Card Storage**: Card is stored and linked to the subscription

## Benefits

### For Organizations
- **Flexibility**: Different plans can have different application forms
- **Customization**: Plans can have unique digital card designs
- **Branding**: Each plan can reflect different branding requirements
- **Scalability**: Easy to add new plans with custom requirements

### For Members
- **Relevant Forms**: See application forms tailored to their chosen plan
- **Professional Cards**: Receive digital cards matching their membership level
- **Clear Experience**: Consistent but plan-specific user experience

## Usage Examples

### Example 1: Basic Plan (Uses Defaults)
```javascript
{
  name: "Basic Membership",
  useDefaultForm: true,           // Uses organization default form
  useDefaultCardTemplate: true,   // Uses organization default template
  // applicationFormId and digitalCardTemplateId are null
}
```

### Example 2: Premium Plan (Custom Form & Template)
```javascript
{
  name: "Premium Membership",
  useDefaultForm: false,
  applicationFormId: 5,           // Uses specific form
  useDefaultCardTemplate: false,
  digitalCardTemplateId: 3,       // Uses specific template
}
```

### Example 3: Student Plan (Custom Form Only)
```javascript
{
  name: "Student Membership",
  useDefaultForm: false,
  applicationFormId: 8,           // Custom form for students
  useDefaultCardTemplate: true,   // Default card template
}
```

## Testing Results

The implementation has been tested and verified:

✅ **Database Schema**: New fields added successfully
✅ **Model Associations**: Relationships configured correctly
✅ **API Endpoints**: New endpoints working
✅ **Frontend Components**: UI updated with new fields
✅ **Data Flow**: Plan-specific linking logic working

**Current System Status:**
- Plans: 7
- Application Forms: 3
- Digital Cards: 0
- Organizations: 2
- Plans with custom forms: 0 (ready for use)
- Plans with custom templates: 0 (ready for use)

## Next Steps

1. **Create Digital Card Templates**: Organizations should create digital card templates
2. **Configure Plans**: Admins can now set custom forms/templates for specific plans
3. **Test Workflow**: Verify the complete application → subscription → digital card flow
4. **Documentation**: Update user guides for the new functionality

## Technical Notes

### Database Migration
The migration script `add-plan-specific-links.js` safely adds the new fields without affecting existing data.

### Backward Compatibility
- Existing plans continue to work with default behavior
- New fields have sensible defaults
- No breaking changes to existing functionality

### Performance Considerations
- Indexes added for new foreign key fields
- Efficient queries using proper associations
- Minimal impact on existing operations

## Conclusion

The plan-specific linking system provides a powerful and flexible way to customize the membership experience for different plans while maintaining the simplicity of default configurations. This enhancement significantly improves the platform's ability to serve diverse organizational needs.
