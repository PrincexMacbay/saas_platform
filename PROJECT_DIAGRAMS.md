# Project Diagrams

This document contains all system diagrams for the SaaS Platform project. These diagrams can be rendered using Mermaid in markdown viewers or exported as images.

---

## 1. System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        A[React Frontend<br/>Port 5173]
        A1[User Interface]
        A2[Context Providers]
        A3[Components]
        A --> A1
        A --> A2
        A --> A3
    end
    
    subgraph "API Layer"
        B[Node.js/Express Backend<br/>Port 5000]
        B1[Authentication Middleware]
        B2[Route Handlers]
        B3[Controllers]
        B4[Business Logic]
        B --> B1
        B --> B2
        B --> B3
        B --> B4
    end
    
    subgraph "Data Layer"
        C[(PostgreSQL Database)]
        C1[User Tables]
        C2[Membership Tables]
        C3[Social Tables]
        C4[Career Tables]
        C --> C1
        C --> C2
        C --> C3
        C --> C4
    end
    
    subgraph "External Services"
        D[File Storage<br/>Local/Cloud]
        E[Email Service]
        F[Payment Gateway]
    end
    
    A1 -->|HTTP/REST API| B
    A2 -->|State Management| B
    A3 -->|Component Data| B
    
    B1 -->|JWT Tokens| A
    B2 -->|Request Routing| B3
    B3 -->|Data Processing| B4
    B4 -->|SQL Queries| C
    
    C1 -->|User Data| B4
    C2 -->|Membership Data| B4
    C3 -->|Social Data| B4
    C4 -->|Career Data| B4
    
    B4 -->|File Uploads| D
    B4 -->|Notifications| E
    B4 -->|Payment Processing| F
    
    style A fill:#3498db,stroke:#2980b9,color:#fff
    style B fill:#2ecc71,stroke:#27ae60,color:#fff
    style C fill:#e74c3c,stroke:#c0392b,color:#fff
    style D fill:#f39c12,stroke:#e67e22,color:#fff
    style E fill:#9b59b6,stroke:#8e44ad,color:#fff
    style F fill:#1abc9c,stroke:#16a085,color:#fff
```

---

## 2. Component Hierarchy

```mermaid
graph TD
    A[App.jsx] --> B[LanguageProvider]
    A --> C[AuthProvider]
    A --> D[Router]
    
    B --> E[LanguageContext]
    C --> F[AuthContext]
    
    D --> G[Navbar]
    D --> H[Routes]
    
    H --> I[Public Routes]
    H --> J[Protected Routes]
    
    I --> I1[Login]
    I --> I2[Register]
    I --> I3[Homepage]
    I --> I4[BrowseMemberships]
    
    J --> J1[Dashboard]
    J --> J2[Profile]
    J --> J3[Membership]
    J --> J4[CareerCenter]
    J --> J5[AdminDashboard]
    
    J3 --> K[Membership Components]
    K --> K1[MembershipDashboard]
    K --> K2[Plans]
    K --> K3[Applications]
    K --> K4[Payments]
    K --> K5[DigitalCard]
    
    J4 --> L[Career Components]
    L --> L1[JobBoard]
    L --> L2[JobCard]
    L --> L3[IndividualDashboard]
    L --> L4[CompanyDashboard]
    
    J5 --> M[Admin Components]
    M --> M1[UserManagement]
    M --> M2[MembershipManagement]
    M --> M3[FinancialManagement]
    M --> M4[JobManagement]
    
    G --> N[Reusable Components]
    N --> N1[PostCard]
    N --> N2[FileUpload]
    N --> N3[ProtectedRoute]
    N --> N4[ErrorBoundary]
    
    style A fill:#3498db,stroke:#2980b9,color:#fff
    style B fill:#2ecc71,stroke:#27ae60,color:#fff
    style C fill:#2ecc71,stroke:#27ae60,color:#fff
    style D fill:#e74c3c,stroke:#c0392b,color:#fff
    style K fill:#f39c12,stroke:#e67e22,color:#fff
    style L fill:#9b59b6,stroke:#8e44ad,color:#fff
    style M fill:#1abc9c,stroke:#16a085,color:#fff
```

---

## 3. API Endpoint Map

```mermaid
graph LR
    subgraph "Authentication"
        A1[POST /api/auth/register]
        A2[POST /api/auth/login]
        A3[GET /api/auth/verify-email]
        A4[POST /api/auth/forgot-password]
        A5[POST /api/auth/reset-password]
        A6[GET /api/auth/profile]
    end
    
    subgraph "Users"
        U1[GET /api/users]
        U2[GET /api/users/:id]
        U3[PUT /api/users/profile]
        U4[POST /api/users/:id/follow]
        U5[GET /api/users/:id/followers]
    end
    
    subgraph "Membership"
        M1[GET /api/membership/plans]
        M2[POST /api/membership/plans]
        M3[GET /api/membership/subscriptions]
        M4[POST /api/membership/subscriptions]
        M5[GET /api/membership/payments]
        M6[POST /api/membership/payments]
        M7[GET /api/membership/applications]
        M8[POST /api/membership/applications]
        M9[GET /api/membership/dashboard]
    end
    
    subgraph "Social Networking"
        S1[GET /api/spaces]
        S2[POST /api/spaces]
        S3[POST /api/spaces/:id/join]
        S4[GET /api/posts]
        S5[POST /api/posts]
        S6[POST /api/posts/:id/comments]
        S7[POST /api/posts/:model/:id/like]
    end
    
    subgraph "Career Center"
        C1[GET /api/career/jobs]
        C2[POST /api/career/jobs]
        C3[GET /api/career/jobs/:id]
        C4[POST /api/career/jobs/:id/apply]
        C5[GET /api/career/applications]
        C6[POST /api/career/jobs/:id/save]
    end
    
    subgraph "Admin"
        AD1[GET /api/admin/dashboard/stats]
        AD2[GET /api/admin/users]
        AD3[PUT /api/admin/users/:id/status]
        AD4[GET /api/admin/membership/plans]
        AD5[POST /api/admin/membership/applications/:id/approve]
        AD6[GET /api/admin/financial]
        AD7[GET /api/admin/jobs]
        AD8[GET /api/admin/coupons]
    end
    
    subgraph "Public"
        P1[GET /api/public/plans]
        P2[GET /api/public/organizations]
        P3[POST /api/public/apply]
        P4[POST /api/public/validate-coupon]
    end
    
    subgraph "Upload"
        UP1[POST /api/upload/profile-image]
        UP2[POST /api/upload/post-attachment]
    end
    
    style A1 fill:#3498db,stroke:#2980b9,color:#fff
    style M1 fill:#2ecc71,stroke:#27ae60,color:#fff
    style S1 fill:#e74c3c,stroke:#c0392b,color:#fff
    style C1 fill:#f39c12,stroke:#e67e22,color:#fff
    style AD1 fill:#9b59b6,stroke:#8e44ad,color:#fff
    style P1 fill:#1abc9c,stroke:#16a085,color:#fff
```

---

## 4. Membership Application Workflow

```mermaid
flowchart TD
    Start([User Visits Platform]) --> Browse[Browse Membership Plans]
    Browse --> Select[Select Plan]
    Select --> View[View Plan Details]
    View --> Apply{Apply for Membership?}
    
    Apply -->|Yes| FillForm[Fill Application Form]
    Apply -->|No| Browse
    
    FillForm --> Submit[Submit Application]
    Submit --> Notify1[Admin Notification Sent]
    Notify1 --> Wait[Application Status: Pending]
    
    Wait --> Review{Admin Reviews}
    
    Review -->|Approved| CreateUser[Create User Account]
    Review -->|Rejected| Reject[Application Rejected]
    Review -->|Needs Info| RequestInfo[Request More Information]
    
    RequestInfo --> FillForm
    
    CreateUser --> Notify2[User Account Created]
    Notify2 --> Payment[Process Application Fee Payment]
    
    Payment --> PaymentSuccess{Payment Successful?}
    
    PaymentSuccess -->|Yes| CreateSub[Create Subscription]
    PaymentSuccess -->|No| PaymentRetry[Retry Payment]
    
    PaymentRetry --> Payment
    
    CreateSub --> GenerateCard[Generate Digital Membership Card]
    GenerateCard --> Activate[Activate Subscription]
    Activate --> Notify3[Welcome Email Sent]
    Notify3 --> Complete([Membership Active])
    
    Reject --> Notify4[Rejection Email Sent]
    Notify4 --> End([Process Complete])
    
    style Start fill:#3498db,stroke:#2980b9,color:#fff
    style Complete fill:#2ecc71,stroke:#27ae60,color:#fff
    style End fill:#e74c3c,stroke:#c0392b,color:#fff
    style Review fill:#f39c12,stroke:#e67e22,color:#fff
    style PaymentSuccess fill:#9b59b6,stroke:#8e44ad,color:#fff
```

---

## 5. Payment Processing Workflow

```mermaid
flowchart TD
    Start([Payment Initiated]) --> Validate[Validate Payment Data]
    Validate --> Valid{Valid?}
    
    Valid -->|No| Error1[Return Validation Error]
    Valid -->|Yes| Method{Payment Method?}
    
    Method -->|Cash| Cash[Record Cash Payment]
    Method -->|Bank Transfer| Bank[Record Bank Transfer]
    Method -->|Credit/Debit Card| Card[Process Card Payment]
    Method -->|Mobile Payment| Mobile[Process Mobile Payment]
    Method -->|Crypto| Crypto[Process Crypto Payment]
    
    Cash --> Process[Process Payment]
    Bank --> Process
    Card --> Process
    Mobile --> Process
    Crypto --> Process
    
    Process --> Gateway{External Gateway?}
    
    Gateway -->|Yes| CallGateway[Call Payment Gateway API]
    Gateway -->|No| DirectProcess[Direct Processing]
    
    CallGateway --> GatewayResponse{Response?}
    DirectProcess --> ProcessResult{Result?}
    
    GatewayResponse -->|Success| Success1[Payment Successful]
    GatewayResponse -->|Failed| Failed1[Payment Failed]
    GatewayResponse -->|Pending| Pending1[Payment Pending]
    
    ProcessResult -->|Success| Success1
    ProcessResult -->|Failed| Failed1
    ProcessResult -->|Pending| Pending1
    
    Success1 --> UpdateStatus[Update Payment Status: Completed]
    UpdateStatus --> UpdateSubscription[Update Subscription Status]
    UpdateSubscription --> CreateInvoice[Create/Update Invoice]
    CreateInvoice --> SendReceipt[Send Payment Receipt]
    SendReceipt --> Complete([Payment Complete])
    
    Failed1 --> CreateDebt[Create Debt Record]
    CreateDebt --> UpdateStatus2[Update Payment Status: Failed]
    UpdateStatus2 --> UpdateSubscription2[Update Subscription: Past Due]
    UpdateSubscription2 --> GenerateReminder[Generate Payment Reminder]
    GenerateReminder --> NotifyUser[Notify User of Failure]
    NotifyUser --> Retry{Retry Payment?}
    
    Retry -->|Yes| Start
    Retry -->|No| End([Payment Failed])
    
    Pending1 --> Wait[Wait for Confirmation]
    Wait --> CheckStatus[Check Payment Status]
    CheckStatus --> GatewayResponse
    
    Error1 --> End
    
    style Start fill:#3498db,stroke:#2980b9,color:#fff
    style Complete fill:#2ecc71,stroke:#27ae60,color:#fff
    style End fill:#e74c3c,stroke:#c0392b,color:#fff
    style Success1 fill:#2ecc71,stroke:#27ae60,color:#fff
    style Failed1 fill:#e74c3c,stroke:#c0392b,color:#fff
    style Pending1 fill:#f39c12,stroke:#e67e22,color:#fff
```

---

## 6. Subscription Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Pending: Application Approved
    
    Pending --> Active: Payment Received
    Pending --> Cancelled: Application Rejected
    
    Active --> Active: Renewal Success
    Active --> Past_Due: Payment Failed
    Active --> Cancelled: User Cancels
    Active --> Expired: End Date Reached
    
    Past_Due --> Active: Payment Received
    Past_Due --> Past_Due: Reminder Sent
    Past_Due --> Cancelled: Grace Period Expired
    Past_Due --> Expired: No Payment After Reminders
    
    Cancelled --> [*]: Subscription Terminated
    Expired --> [*]: Subscription Ended
    
    note right of Pending
        Initial state after
        application approval
    end note
    
    note right of Active
        Subscription is active
        and user has access
    end note
    
    note right of Past_Due
        Payment overdue
        Reminders generated
    end note
    
    note right of Cancelled
        Subscription cancelled
        by user or admin
    end note
    
    note right of Expired
        Subscription period
        has ended
    end note
```

---

## Diagram Usage Instructions

### Rendering Mermaid Diagrams

1. **In Markdown Viewers:**
   - GitHub, GitLab, and many markdown viewers support Mermaid natively
   - Simply include the code blocks in your markdown file

2. **In VS Code:**
   - Install the "Markdown Preview Mermaid Support" extension
   - Preview the markdown file to see rendered diagrams

3. **Online Tools:**
   - Copy the Mermaid code to [Mermaid Live Editor](https://mermaid.live)
   - Export as PNG, SVG, or PDF

4. **Export as Images:**
   - Use [Mermaid CLI](https://github.com/mermaid-js/mermaid-cli) to generate images
   - Or use online tools to convert to PNG/SVG

### Integration with PROJECT_REPORT.md

To include these diagrams in your project report, you can:

1. **Option 1:** Reference this file in the report
2. **Option 2:** Copy individual diagram code blocks into the report
3. **Option 3:** Export diagrams as images and reference them as screenshots

Example reference in PROJECT_REPORT.md:
```markdown
**System Architecture Diagram**
- **Mermaid Code**: See `PROJECT_DIAGRAMS.md` section 1
- **Description**: High-level architecture diagram showing...
```

---

## Notes

- All diagrams are created based on the current project structure
- Diagrams reflect actual routes, components, and workflows
- Colors are consistent with the project's color scheme (#3498db, #2ecc71, etc.)
- Diagrams can be customized by modifying the Mermaid code
