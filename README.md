# AI-Powered RFP Management System

> **SDE Assignment Submission**  
> A complete end-to-end procurement automation system that leverages AI to streamline the RFP workflow from creation to vendor selection.

## 📹 Demo Video

**[Watch Demo Video Here](#)** *(5-10 minute walkthrough)*

The demo covers:
1. Creating an RFP from natural language input
2. Managing vendors and sending RFPs via email
3. Automatic vendor response parsing from Gmail
4. AI-powered proposal comparison and recommendation
5. Code walkthrough of key integrations

---

## 🎯 Problem Statement

Traditional procurement through RFPs is:
- **Slow and error-prone**: Manual data entry and comparison
- **Unstructured**: Emails, PDFs, and free-form vendor responses
- **Repetitive**: Similar evaluations for every procurement cycle

This system automates the entire RFP workflow using AI to:
- Generate structured RFPs from natural language
- Automatically parse vendor email responses
- Provide intelligent vendor comparisons and recommendations

## ✨ Key Features (Assignment Requirements)

### 1. ✅ Create RFPs from Natural Language
- **Natural Language Input**: Describe procurement needs in plain English
- **AI-Powered Structuring**: GPT-4o-mini converts text into structured RFP format
- **Structured Representation**: Extracts items, quantities, budget, delivery timeline, payment terms, warranty
- **Example**: *"I need 20 laptops with 16GB RAM, 15 monitors 27-inch. Budget $50,000, delivery in 30 days"*

### 2. ✅ Vendor Management & RFP Distribution
- **Vendor Master Data**: Store vendor names and email addresses
- **Vendor Selection**: Choose which vendors receive each RFP
- **Email Integration**: Automated SMTP email sending via Gmail
- **Message Tracking**: Unique Message-ID for each sent RFP to track responses

### 3. ✅ Receive & Parse Vendor Responses
- **Inbound Email Processing**: IMAP integration with Gmail for automatic monitoring
- **Background Polling**: Checks inbox every 60 seconds for new responses
- **Manual Refresh**: On-demand Gmail sync with visual loading indicators
- **AI Parsing**: Extracts pricing, delivery time, warranty, line items from free-form email text
- **Automatic Updates**: Proposals automatically transition from "pending" to "received"

### 4. ✅ Compare Proposals & Recommend Vendor
- **Side-by-Side Comparison**: View all vendor proposals in a structured table
- **AI-Powered Scoring**: Each proposal scored 0-100 based on multiple criteria
- **Strengths & Weaknesses**: AI identifies key pros and cons for each vendor
- **Intelligent Recommendation**: System suggests best vendor with detailed reasoning
- **Evaluation Criteria**: Price, delivery time, warranty, completeness, overall value

## 🏗️ Tech Stack

### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Styling**: TailwindCSS 4.1.17 (with @tailwindcss/vite plugin)
- **HTTP Client**: Axios 1.13.2
- **Icons**: Lucide React 0.555.0
- **Linting**: ESLint 9.39.1

### Backend
- **Runtime**: Node.js (v16+)
- **Framework**: Express.js 5.2.1
- **Database**: MongoDB with Mongoose 9.0.0
- **Email Sending**: Nodemailer 7.0.11 (SMTP)
- **Email Receiving**: imap-simple 5.1.0 (IMAP)
- **Email Parsing**: mailparser 3.9.0
- **AI Integration**: OpenRouter API (via Axios)
- **Environment**: dotenv 17.2.3
- **Dev Tools**: Nodemon 3.1.11

### AI & Email Services
- **AI Provider**: OpenRouter (https://openrouter.ai/)
- **AI Models**: 
  - GPT-4o for complex RFP generation
  - GPT-4o-mini for fast proposal parsing and comparison
- **Email Service**: Gmail (SMTP + IMAP)
- **Authentication**: Gmail App Passwords (2FA required)

### Why These Choices?

**React + Vite**: Fast development with hot module replacement, modern build tooling  
**TailwindCSS**: Rapid UI development with utility-first approach  
**MongoDB**: Flexible schema for varying RFP structures and proposal formats  
**OpenRouter**: Access to multiple AI models with single API, cost-effective  
**Gmail**: Widely available, reliable, free tier sufficient for testing  
**imap-simple**: Robust IMAP client with good error handling

### Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── AI.prompts.js       # AI prompt templates
│   │   │   └── ConnectDB.js        # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── Email.controller.js # Email processing logic
│   │   │   ├── Rfp.controller.js   # RFP CRUD operations
│   │   │   └── Vendor.controller.js # Vendor management
│   │   ├── models/
│   │   │   ├── Proposal.model.js   # Proposal schema
│   │   │   ├── Rfp.model.js        # RFP schema
│   │   │   └── Vendor.model.js     # Vendor schema
│   │   ├── routes/
│   │   │   ├── Email.route.js      # Email endpoints
│   │   │   ├── Rfp.route.js        # RFP endpoints
│   │   │   └── Vendor.route.js     # Vendor endpoints
│   │   ├── service/
│   │   │   ├── AI.service.js       # OpenRouter AI integration
│   │   │   ├── EmailPoller.service.js # Background email polling
│   │   │   ├── EmailReceiver.service.js # IMAP email fetching
│   │   │   └── Mailer.service.js   # SMTP email sending
│   │   ├── utils/
│   │   └── index.js                # Server entry point
│   ├── .env                        # Environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/             # Reusable UI components
    │   ├── layout/
    │   │   └── DashboardLayout.jsx # Main layout wrapper
    │   ├── pages/
    │   │   ├── Compare.jsx         # Proposal comparison page
    │   │   ├── CreateRFP.jsx       # RFP creation page
    │   │   ├── SendRFP.jsx         # RFP distribution page
    │   │   └── Vendors.jsx         # Vendor management page
    │   ├── utils/                  # Helper functions
    │   ├── api.js                  # API client
    │   ├── App.jsx                 # Main app component
    │   ├── main.jsx                # React entry point
    │   └── index.css               # Global styles
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 🚀 Project Setup

### Prerequisites

Before running this project, ensure you have:

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** - Choose one:
   - Local installation: [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free tier available)
3. **Gmail Account** with:
   - 2-Factor Authentication enabled
   - App Password generated (see setup below)
4. **OpenRouter API Key** - [Sign up at OpenRouter](https://openrouter.ai/)
   - Create account and add credits ($5 minimum recommended)
5. **Git** - For cloning the repository

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd rfp-management-system
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

### Configuration

#### Step 1: Gmail Setup (Required for Email Integration)

**Enable 2-Factor Authentication:**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification"

**Generate App Password:**
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Other (Custom name)"
3. Name it "RFP System"
4. Copy the 16-character password (remove spaces)
5. This will be used for both `SMTP_PASS` and `IMAP_PASS`

**Enable IMAP:**
1. Open Gmail → Settings (gear icon) → See all settings
2. Go to "Forwarding and POP/IMAP" tab
3. Enable "IMAP access"
4. Save changes

#### Step 2: OpenRouter API Setup

1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for an account
3. Go to [API Keys](https://openrouter.ai/keys)
4. Create a new API key
5. Add credits (minimum $5 recommended for testing)
6. Copy the API key

#### Step 3: MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Server
# Start MongoDB service
mongod --dbpath /path/to/data/directory
```

**Option B: MongoDB Atlas (Recommended)**
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier M0)
3. Create database user with password
4. Whitelist your IP address (or use 0.0.0.0/0 for testing)
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/rfp-management`

#### Step 4: Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000

# MongoDB Connection
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/rfp-management

# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rfp-management

# Gmail SMTP Configuration (for sending emails)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password

# Gmail IMAP Configuration (for receiving emails)
IMAP_USER=your-email@gmail.com
IMAP_PASS=your-16-char-app-password
IMAP_HOST=imap.gmail.com
IMAP_PORT=993

# OpenRouter AI Configuration
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
AI_MODEL=openai/gpt-4o
AI_MODEL_MINI=openai/gpt-4o-mini
```

**Important Notes:**
- Use the **same Gmail account** for both SMTP and IMAP
- Use the **same App Password** for both SMTP_PASS and IMAP_PASS
- Never commit the `.env` file to version control
- See `.env.example` for reference

### Running the Application Locally

#### Terminal 1: Start Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
Server running on port 5000
MongoDB connected successfully
Email polling started - monitoring for vendor replies
```

The backend API will be available at: `http://localhost:5000`

#### Terminal 2: Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v7.2.4  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Open your browser and navigate to: `http://localhost:5173`

#### Verify Setup

1. **Check MongoDB Connection**: Backend console should show "MongoDB connected"
2. **Check Email Polling**: Backend console should show "Email polling started"
3. **Check Frontend**: Browser should display the RFP Management dashboard
4. **Check API**: Visit `http://localhost:5000/api/vendors` (should return empty array `[]`)

### Seed Data (Optional)

To quickly test the system, you can add sample vendors via the UI or use the API:

```bash
# Add a test vendor
curl -X POST http://localhost:5000/api/vendors \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Vendor","email":"vendor@example.com"}'
```

## 📖 Usage Guide

### 1. Create RFP

1. Navigate to the "Create RFP" section
2. Enter your requirements in natural language, for example:
   ```
   We need 10 laptops with 16GB RAM and 512GB SSD,
   5 monitors (24 inch), and 10 keyboards.
   Budget is ₹50,000. Delivery needed in 30 days.
   ```
3. Click "Generate RFP Draft" - AI will structure your requirements
4. Review and edit the generated RFP
5. Click "Create RFP" to save

### 2. Manage Vendors

1. Go to "Vendors" section
2. Add vendors with:
   - Name
   - Email address
3. Edit or delete vendors as needed

### 3. Send RFP

1. Navigate to "Send RFP" section
2. Select an RFP from the dropdown
3. Choose vendors to send to
4. Click "Send RFP to Selected Vendors"
5. System creates pending proposals and sends emails

### 4. Compare Proposals

1. Go to "Compare" section
2. Select an RFP
3. Click "Refresh from Gmail" to check for new responses
   - System fetches emails from Gmail
   - AI parses vendor responses
   - Proposals are updated automatically
   - Loading indicators show processing status
4. Click "Load proposals" to view all proposals
5. Click "Compare & Recommend" for AI analysis
6. View rankings, scores, and recommendations

## 🔄 Email Processing Flow

### Sending RFPs
1. User selects RFP and vendors
2. System creates "pending" proposals in database
3. Emails sent to vendors with unique Message-ID
4. Message-ID stored in proposal for tracking

### Receiving Responses
1. **Automatic Polling**: Background service checks Gmail every 60 seconds
2. **Manual Refresh**: User clicks "Refresh from Gmail" button
3. System searches for emails matching:
   - Subject contains RFP ID
   - Message-ID or In-Reply-To matches sent email
4. AI parses email content to extract:
   - Total price
   - Delivery time
   - Warranty information
   - Line items
   - Summary
5. Proposal status updated from "pending" to "received"

### Processing States
- **Pending**: RFP sent, awaiting vendor response
- **Processing**: Email found, AI parsing in progress (with loader)
- **Received**: Response parsed and stored
- **Failed**: Error during processing

##  AI Integration

### AI Models Used
- **GPT-4o**: For complex RFP generation and comparison
- **GPT-4o-mini**: For faster proposal parsing

### AI Capabilities

1. **RFP Generation**
   - Converts natural language to structured format
   - Extracts items, quantities, budget, timeline
   - Generates professional RFP text

2. **Proposal Parsing**
   - Extracts pricing information
   - Identifies delivery timelines
   - Captures warranty terms
   - Summarizes key points

3. **Proposal Comparison**
   - Scores each proposal (0-100)
   - Identifies strengths and weaknesses
   - Provides recommendation with reasoning
   - Considers price, delivery, warranty, and quality

## � API Docuomentation

### Vendor Management

#### `GET /api/vendors`
List all vendors

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Acme Corp",
    "email": "vendor@acme.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

#### `POST /api/vendors`
Create a new vendor

**Request Body:**
```json
{
  "name": "Acme Corp",
  "email": "vendor@acme.com"
}
```

**Success Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Acme Corp",
  "email": "vendor@acme.com",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (400):**
```json
{
  "error": "name and email required"
}
```

#### `PUT /api/vendors/:id`
Update vendor details

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@acme.com"
}
```

#### `DELETE /api/vendors/:id`
Delete a vendor

**Success Response (200):**
```json
{
  "message": "Vendor deleted successfully"
}
```

---

### RFP Management

#### `POST /api/rfps/generate`
Generate structured RFP from natural language (AI-powered)

**Request Body:**
```json
{
  "text": "I need 20 laptops with 16GB RAM, 15 monitors 27-inch. Budget $50,000, delivery in 30 days."
}
```

**Success Response (200):**
```json
{
  "rfpDraft": {
    "title": "Procurement of Laptops and Monitors",
    "raw_input": "I need 20 laptops...",
    "budget": 50000,
    "items": [
      {
        "name": "Laptop",
        "quantity": 20,
        "specs": "16GB RAM"
      },
      {
        "name": "Monitor",
        "quantity": 15,
        "specs": "27-inch"
      }
    ],
    "delivery_days": 30,
    "payment_terms": "Net 30",
    "warranty": "1 year"
  }
}
```

#### `POST /api/rfps`
Create an RFP

**Request Body:**
```json
{
  "title": "Procurement of Laptops and Monitors",
  "budget": 50000,
  "items": [...],
  "delivery_days": 30,
  "payment_terms": "Net 30",
  "warranty": "1 year"
}
```

#### `GET /api/rfps`
List all RFPs

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Procurement of Laptops and Monitors",
    "budget": 50000,
    "items": [...],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

#### `POST /api/rfps/:id/send`
Send RFP to selected vendors via email

**Request Body:**
```json
{
  "vendorIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439013"]
}
```

**Success Response (200):**
```json
{
  "sent": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439013"],
  "failed": []
}
```

---

### Proposal Management

#### `GET /api/rfps/:id/proposals`
Get all proposals for a specific RFP

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "rfpId": "507f1f77bcf86cd799439012",
    "vendorId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Acme Corp",
      "email": "vendor@acme.com"
    },
    "status": "received",
    "parsed": {
      "total_price": 45000,
      "delivery_days": 25,
      "warranty": "2 years",
      "line_items": [...]
    },
    "ai_summary": "Competitive pricing with extended warranty",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "receivedAt": "2024-01-15T14:20:00.000Z"
  }
]
```

#### `GET /api/rfps/:id/comparison`
Get AI-powered comparison of all proposals for an RFP

**Response:**
```json
{
  "summary": "Three vendors submitted proposals. Acme Corp offers the best value...",
  "recommendation": {
    "vendorId": "507f1f77bcf86cd799439011",
    "reason": "Best combination of price, delivery time, and warranty terms"
  },
  "scores": [
    {
      "vendorId": "507f1f77bcf86cd799439011",
      "score": 92,
      "strengths": "Competitive pricing, fast delivery, extended warranty",
      "weaknesses": "Slightly higher than budget"
    }
  ]
}
```

---

### Email Processing

#### `POST /api/email/process-pending`
Manually trigger processing of pending proposals (checks Gmail for responses)

**Success Response (200):**
```json
{
  "message": "Pending proposals processed successfully"
}
```

#### `GET /api/email/list-inbox`
List all emails in inbox (diagnostic tool)

**Response:**
```json
{
  "count": 5,
  "emails": [
    {
      "messageId": "CABc123...",
      "from": "vendor@acme.com",
      "subject": "Re: RFP [RFP-507f1f77bcf86cd799439012]",
      "date": "Mon, 15 Jan 2024 14:20:00 +0000"
    }
  ]
}
```

#### `POST /api/email/simulate`
Simulate vendor response (for testing without real emails)

**Request Body:**
```json
{
  "rfpId": "507f1f77bcf86cd799439012",
  "vendorId": "507f1f77bcf86cd799439011",
  "emailBody": "Dear Team, Our proposal: Total Price: $45,000, Delivery: 25 days, Warranty: 2 years"
}
```

#### `POST /api/email/poll/start`
Start automatic email polling (runs every 60 seconds)

#### `POST /api/email/poll/stop`
Stop automatic email polling

## 🎨 UI Features

### Loading States
- **Global Loader**: Shows when loading proposals or comparing
- **Refresh Loader**: Animated icon during Gmail sync
- **Row-Level Loaders**: Individual proposal rows show processing state
- **Status Badges**: Visual indicators for pending proposals

### Responsive Design
- Mobile-friendly interface
- Adaptive layouts for all screen sizes
- Touch-optimized controls

### Visual Feedback
- Color-coded scores (green/amber/orange/red)
- Success/error notifications
- Debug information panel
- Processing status indicators

## 🐛 Troubleshooting

### Email Not Receiving

1. **Check IMAP Settings**
   - Verify IMAP is enabled in Gmail
   - Confirm app password is correct
   - Check firewall isn't blocking port 993

2. **Check Message-ID Matching**
   - Use `/api/email/list-inbox` to see inbox emails
   - Compare Message-IDs with proposals in database
   - Ensure vendor replies to the correct email

3. **Check Backend Logs**
   - Look for IMAP connection errors
   - Check for parsing errors
   - Verify AI API responses

### AI Parsing Issues

1. **Check OpenRouter Credits**
   - Ensure you have sufficient credits
   - Verify API key is valid

2. **Review Email Content**
   - Ensure vendor email contains pricing info
   - Check for unusual formatting
   - Try with simpler email format

### Database Connection

1. **MongoDB Not Running**
   ```bash
   # Start MongoDB locally
   mongod
   ```

2. **Connection String Issues**
   - Verify MONGODB_URI in .env
   - Check network connectivity for Atlas
   - Ensure database user has proper permissions

## 🔐 Security Considerations

- Store sensitive credentials in `.env` file
- Never commit `.env` to version control
- Use app passwords instead of main Gmail password
- Implement rate limiting for production
- Add authentication/authorization for multi-user scenarios
- Validate and sanitize all user inputs
- Use HTTPS in production

## 📊 Database Schema

### Vendor
```javascript
{
  name: String,
  email: String (unique, lowercase),
  createdAt: Date
}
```

### RFP
```javascript
{
  title: String,
  raw_input: String,
  budget: Number,
  items: [{
    name: String,
    quantity: Number,
    specs: String
  }],
  delivery_days: Number,
  payment_terms: String,
  warranty: String,
  createdAt: Date
}
```

### Proposal
```javascript
{
  rfpId: ObjectId (ref: Rfp),
  vendorId: ObjectId (ref: Vendor),
  status: String (pending/received/failed),
  raw_email: String,
  parsed: {
    total_price: Number,
    delivery_days: Number,
    warranty: String,
    line_items: Array,
    summary: String
  },
  ai_summary: String,
  messageId: String,
  createdAt: Date,
  receivedAt: Date
}
```


## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on the repository.

---

**Built using React, Node.js, MongoDB, and AI**


## 🧠 Key Design Decisions & Assumptions

### Architecture Decisions

**1. Monorepo Structure with Separate Frontend/Backend**
- **Decision**: Keep frontend and backend in separate directories but same repo
- **Reasoning**: Easier development, clear separation of concerns, simpler deployment
- **Alternative Considered**: Monolithic Next.js app (rejected due to clearer API boundaries needed)

**2. MongoDB for Data Storage**
- **Decision**: Use MongoDB with Mongoose ODM
- **Reasoning**: 
  - Flexible schema for varying RFP structures
  - Vendor proposals can have different formats
  - Easy to add new fields without migrations
  - Good for rapid prototyping
- **Alternative Considered**: PostgreSQLejected due to rigid schema requirements)

**3. OpenRouter for AI Integration**
- **Decision**: Use OpenRouter instead of direct OpenAI API
- **Reasoning**:
  - Access to multiple models (GPT-4o, GPT-4o-mini, Claude, etc.)
  - Cost optimization by choosing appropriate model per task
  - Fallback options if one provider hs
  - Single API for multiple providers
- **Cost Optimization**: Use GPT-4o-mini for parsing (cheaper, faster) and GPT-4o for complex generation

**4. Gmail IMAP/SMTP for Email**
- **Decision**: Use Gmail with App Passwords
- **Reasoning**:
  - Widely available and free
  - Reliable infrastructure
  - Easy to test and debug
  - No additional service costs
- **Alternative Considered**: SendGrid/Mailgun (rejected for simplicity in assignment)

**5. Background Polling vs Webhooks**
- **Decision**: Implement background polling (60-second intervals)
- **Reasoning**:
  - Gmail doesn't support webhooks for IMAP
  - Simpler to implement and debug
  - Sufficient for assignment requirements
  - Manual refresh option for immediate updates
- **Trade-off**: Slight delay in processing vs real-time webhooks

**6. Message-ID Tracking**
- **Decision**: Store normalized Message-ID from sent emails to match responses
- **Reasoning**:
  - Reliable way to link vendor responses to original RFPs
  - Works even if subject line is modified
  - Supports In-Reply-To header matching as fallback
- **Implementation**: Normalize by removing angle brackets for consistent matching

### Data Model Decisions

**RFP Structure:**
```javascript
{
  title: String,           // Human-readable title
  raw_input: String,       // Original natural language input
  budget: Number,          // Numeric for easy comparison
  items: Array,            // Flexible array for any number of items
  delivery_days: Number,   // Numeric for AI comparison
  payment_terms: String,   // Free-form text
  warranty: String         // Free-form text
}
```

**Proposal Status Flow:**
- `pending` → RFP sent, awaiting response
- `received` → Email found and parsed successfully
- `failed` → Error during processing (not implemented in current version)

**Why This Structure:**
- Balances structure with flexibility
- Numeric fields enable AI comparison
- Raw input preserved for audit trail
- Items array supports any procurement type

### AI Integration Decisions

**1. Prompt Engineering Approach**
- **Decision**: Centralize all prompts in `AI.prompts.js`
- **Reasoning**: Easy to iterate and improve prompts without touching business logic
- **Format**: Always request JSON-only responses to avoid parsing issues

**2. Three Distinct AI Use Cases**
```javascript
// 1. RFP Generation (GPT-4o-mini)
Natural Language → Structured RFP

// 2. Proposal Parsing (GPT-4o-mini)  
Email Text → Structured Data

// 3. Proposal Comparison (GPT-4o-mini)
Multiple Proposals → Scores + Recommendation
```

**3. Error Handling Strategy**
- Regex extraction of JSON from AI responses (handles markdown code blocks)
- Fallback to raw response if JSON parsing fails
- Detailed logging for debugging AI issues

### Assumptions Made

**Email Assumptions:**
1. Vendors will reply to the email (not create new thread)
2. Vendor responses are in email body (not attachments)
3. Pricing information is in text format (not images/PDFs)
4. Subject line contains RFP ID or In-Reply-To header is preserved
5. Gmail account has IMAP enabled and App Password configured

**Vendor Assumptions:**
1. Vendor email addresses are unique
2. Vendors are pre-registered in the system
3. One vendor = one email address (no multiple contacts per vendor)
4. Vendors respond within reasonable timeframe (no auto-expiry)

**RFP Assumptions:**
1. Single currency (₹ or $) per RFP
2. Delivery time in days (not hours/weeks)
3. All items in one RFP are related (same delivery timeline)
4. Budget is total budget (not per-item)

**AI Assumptions:**
1. OpenRouter API is available and has credits
2. AI responses are generally accurate (no extensive validation)
3. English language for all communications
4. Vendor responses contain key information (price, delivery, warranty)

**System Assumptions:**
1. Single user (no authentication needed)
2. Single timezone (no timezone conversion)
3. Internet connectivity available
4. MongoDB is running and accessible

### Known Limitations

1. **No Attachment Support**: Cannot parse PDFs or Excel files from vendors
2. **No Multi-Currency**: All prices assumed in same currency
3. **No Email Templates**: Fixed email format for RFPs
4. **No Vendor Authentication**: Anyone can reply to RFP emails
5. **No Audit Trail**: No history of changes to RFPs or proposals
6. **No Concurrent Users**: Not designed for multiple simultaneous users
7. **Limited Error Recovery**: Failed email processing requires manual intervention
8. **No Rate Limiting**: AI API calls not rate-limited (could hit quotas)

### What I Would Do Next (Production Readiness)

**Short Term (1-2 weeks):**
- [ ] Add user authentication (JWT)
- [ ] Implement attachment parsing (PDF/Excel)
- [ ] Add email templates with customization
- [ ] Improve error handling and retry logic
- [ ] Add comprehensive logging (Winston/Pino)
- [ ] Implement rate limiting for AI calls

**Medium Term (1-2 months):**
- [ ] Multi-currency support
- [ ] Vendor portal for direct proposal submission
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced filtering and search
- [ ] Export to PDF/Excel
- [ ] Audit trail and version history

**Long Term (3-6 months):**
- [ ] Multi-tenant architecture
- [ ] Integration with ERP systems
- [ ] Advanced analytics dashboard
- [ ] Machine learning for vendor scoring
- [ ] Automated follow-up workflows
- [ ] Mobile app

---

## 🤖 AI Tools Usage During Development

### Tools Used

**1. GitHub Copilot**
- **Usage**: Code completion, boilerplate generation
- **Helped With**:
  - Express route handlers (saved ~30% typing)
  - Mongoose schema definitions
  - React component structure
  - Error handling patterns
- **Example**: Generated initial CRUD operations for vendors

**2. ChatGPT (GPT-4)**
- **Usage**: Architecture decisions, debugging, documentation
- **Helped With**:
  - Designing the Message-ID tracking approach
  - Debugging IMAP connection issues
  - Writing comprehensive README sections
  - Explaining complex email parsing logic
- **Notable Prompt**: *"How to reliably match email responses to sent emails using IMAP?"*
  - Led to Message-ID + In-Reply-To approach

**3. Claude (Anthropic)**
- **Usage**: Prompt engineering for the AI features
- **Helped With**:
  - Crafting effective prompts for RFP generation
  - Optimizing JSON extraction from AI responses
  - Designing the proposal comparison scoring system
- **Notable Prompt**: *"Design a prompt that extracts structured pricing data from free-form vendor emails"*
  - Resulted in the current `parseProposalPrompt` structure

**4. Cursor IDE / Kiro AI**
- **Usage**: AI-powered code editing and refactoring
- **Helped With**:
  - Refactoring email processing logic
  - Adding comprehensive documentation
  - Code organization and structure
  - Quick fixes for linting issues

### What I Learned

**1. AI for Boilerplate is Excellent**
- Copilot saved significant time on repetitive CRUD operations
- Generated consistent error handling patterns
- Reduced typos and syntax errors

**2. AI for Architecture Requires Validation**
- ChatGPT suggested good starting points but needed refinement
- Had to validate email matching approach through testing
- AI suggestions for database schema were too generic initially

**3. Prompt Engineering is Critical**
- Spent ~20% of AI integration time on prompt refinement
- "Return ONLY valid JSON" instruction was crucial
- Adding examples in prompts improved AI accuracy significantly

**4. AI for Documentation is Powerful**
- ChatGPT helped structure this README
- Generated comprehensive API documentation examples
- Improved clarity of technical explanations

**5. Debugging with AI is Hit-or-Miss**
- Good for common errors (IMAP connection, CORS issues)
- Less helpful for domain-specific logic (Message-ID matching)
- Best used as "second pair of eyes" not primary debugger

### Specific Examples

**Example 1: IMAP Connection Debugging**
```
Me: "Getting 'Timed out while authenticating with server' error with imap-simple"

ChatGPT: Suggested checking:
1. App Password vs regular password
2. IMAP enabled in Gmail settings  
3. Firewall blocking port 993
4. Increasing authTimeout in config

Result: Issue was using regular password instead of App Password
```

**Example 2: AI Prompt Optimization**
```
Initial Prompt: "Parse this email and extract pricing"
Result: Inconsistent JSON structure, sometimes markdown

Improved Prompt (with Claude's help):
"Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{ total_price: <number>, delivery_days: <number>, ... }"

Result: 95%+ consistent JSON responses
```

**Example 3: React State Management**
```
Copilot Suggestion for loading states:
const [loading, setLoading] = useState(false)

My Addition (after testing):
const [processingProposals, setProcessingProposals] = useState(new Set())

Reason: Needed granular loading state per proposal row, not just global
```

### Impact on Development

**Time Saved**: ~30-40% overall
- Boilerplate: 50% faster
- Documentation: 60% faster  
- Debugging: 20% faster
- Architecture: 10% faster (still needed deep thinking)

**Quality Impact**:
- ✅ More consistent code patterns
- ✅ Better error handling (AI suggested edge cases)
- ✅ Comprehensive documentation
- ⚠️ Had to verify AI suggestions (especially for email logic)

**What Changed Because of AI**:
1. **Centralized Prompts**: AI suggested separating prompts from business logic
2. **Message-ID Normalization**: ChatGPT identified angle bracket issue
3. **Fallback Matching**: Claude suggested In-Reply-To as backup
4. **Loading States**: Copilot pattern led to better UX with row-level loaders

---

## 📧 Contact & Submission

**GitHub Repository**: [Link to Repository]  
**Demo Video**: [Link to Demo Video]  
**Submitted By**: [Your Name]  
**Date**: December 2024

---

**Assignment Completed for SDE Role - AI-Powered RFP Management System**
