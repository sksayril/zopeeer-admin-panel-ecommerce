# Admin Panel E-commerce - Authentication System

A modern React-based admin panel with JWT authentication, built with TypeScript, Tailwind CSS, and React Hot Toast for notifications.

## Features

### 🔐 Authentication System
- **JWT-based authentication** with secure token storage
- **Persistent login** - users stay logged in across browser sessions
- **Automatic token validation** and refresh
- **Secure logout** with token cleanup
- **Admin profile management** with real-time data fetching
- **Password change functionality** with validation
- **React Hot Toast notifications** for user feedback

### 🏪 Vendor Management
- **Create vendor accounts** with comprehensive form validation
- **View all vendors** with real-time data fetching
- **Vendor profile information** including shop details and address
- **Status management** (Active/Inactive, Verified/Pending)
- **Search and filter** vendors by name, email, or shop name
- **Professional vendor cards** with complete information display

### 📂 Category Management
- **Create product categories** with hierarchical structure support
- **View all categories** with nested subcategories display
- **Expandable category tree** with collapsible subcategories
- **Category information** including name, description, slug, and creator
- **Status management** (Active/Inactive) for categories and subcategories
- **Search functionality** across categories and subcategories
- **Professional category cards** with complete information display

### 🎨 Modern UI/UX
- **Responsive design** with Tailwind CSS
- **Professional admin interface** with sidebar navigation
- **Loading states** and error handling
- **Form validation** with visual feedback
- **Password strength indicator** with real-time feedback
- **Profile management interface** with comprehensive admin information
- **Accessible components** with proper ARIA labels

### 🏗️ Architecture
- **Context-based state management** for authentication
- **Centralized API service** with Axios interceptors
- **TypeScript** for type safety
- **Modular component structure**

## API Integration

### Base URL
```
https://z7s50012-5000.inc1.devtunnels.ms/api
```

### Authentication Endpoints

#### Admin Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "admin": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Admin",
      "email": "admin@example.com",
      "role": "admin",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Admin Logout
```http
POST /api/admin/logout
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Admin logout successful. Please remove the token from client storage."
}
```

#### Get Current Admin Profile
```http
GET /api/admin/me
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Admin profile retrieved successfully",
  "data": {
    "admin": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Admin",
      "email": "admin@example.com",
      "role": "admin",
      "isActive": true,
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

#### Change Admin Password
```http
POST /api/admin/change-password
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "currentPassword": "currentPassword123",
  "newPassword": "newPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "adminId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "admin@example.com",
    "updatedAt": "2023-09-06T12:00:00.000Z"
  }
}
```

#### Create Vendor
```http
POST /api/admin/vendor
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "messo",
  "email": "messo@gmail.com",
  "password": "messo123",
  "phone": "9632589632",
  "address": {
    "street": "Hooghly",
    "city": "Kolkata",
    "state": "West Bengal",
    "zipCode": "784512",
    "country": "India"
  },
  "shopName": "Messo Shop"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor created successfully",
  "data": {
    "vendor": {
      "_id": "68d5156e9f809dbd63c0ba34",
      "name": "messo",
      "email": "messo@gmail.com",
      "shopName": "Messo Shop",
      "phone": "9632589632",
      "role": "vendor",
      "isActive": true,
      "isVerified": false,
      "createdBy": "68d50f4c091c883d8d53426f",
      "createdAt": "2025-09-25T10:11:58.012Z",
      "updatedAt": "2025-09-25T10:11:58.012Z",
      "address": {
        "street": "Hooghly",
        "city": "Kolkata",
        "state": "West Bengal",
        "zipCode": "784512",
        "country": "India"
      },
      "__v": 0
    }
  }
}
```

#### Get All Vendors
```http
GET /api/admin/vendors
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Vendors retrieved successfully",
  "data": {
    "vendors": [
      {
        "_id": "68d5156e9f809dbd63c0ba34",
        "name": "messo",
        "email": "messo@gmail.com",
        "shopName": "Messo Shop",
        "phone": "9632589632",
        "role": "vendor",
        "isActive": true,
        "isVerified": false,
        "createdBy": "68d50f4c091c883d8d53426f",
        "createdAt": "2025-09-25T10:11:58.012Z",
        "updatedAt": "2025-09-25T10:11:58.012Z",
        "address": {
          "street": "Hooghly",
          "city": "Kolkata",
          "state": "West Bengal",
          "zipCode": "784512",
          "country": "India"
        },
        "__v": 0
      }
    ],
    "count": 1
  }
}
```

#### Create Category
```http
POST /api/admin/category
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Book"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "category": {
      "id": "68d65bc5c1a0ff45303b7b7e",
      "name": "Book",
      "slug": "book",
      "isActive": true,
      "createdBy": {
        "_id": "68d50f4c091c883d8d53426f",
        "name": "admin",
        "email": "admin@gamil.com"
      },
      "createdAt": "2025-09-26T09:24:21.982Z",
      "updatedAt": "2025-09-26T09:24:21.982Z",
      "subcategory": []
    }
  }
}
```

#### Get All Categories
```http
GET /api/admin/categories
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": {
    "categories": [
      {
        "id": "68d65bc5c1a0ff45303b7b7e",
        "name": "Book",
        "slug": "book",
        "isActive": true,
        "createdBy": {
          "_id": "68d50f4c091c883d8d53426f",
          "name": "admin",
          "email": "admin@gamil.com"
        },
        "createdAt": "2025-09-26T09:24:21.982Z",
        "updatedAt": "2025-09-26T09:24:21.982Z",
        "subcategory": []
      },
      {
        "id": "68d635a655a3f58724e487c3",
        "name": "Electronics",
        "description": "Electronic devices and gadgets",
        "slug": "electronics",
        "isActive": true,
        "createdBy": {
          "_id": "68d50f4c091c883d8d53426f",
          "name": "admin",
          "email": "admin@gamil.com"
        },
        "createdAt": "2025-09-26T06:41:42.310Z",
        "updatedAt": "2025-09-26T06:41:42.310Z",
        "subcategory": [
          {
            "id": "68d635a655a3f58724e487c8",
            "name": "Smartphones",
            "description": "Mobile phones and accessories",
            "slug": "smartphones",
            "isActive": true,
            "createdBy": {
              "_id": "68d50f4c091c883d8d53426f",
              "name": "admin",
              "email": "admin@gamil.com"
            },
            "createdAt": "2025-09-26T06:41:42.504Z",
            "updatedAt": "2025-09-26T06:41:42.504Z",
            "subcategory": []
          }
        ]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalCategories": 4,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

## Installation & Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Build for production:**
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── AdminLayout.tsx      # Main admin layout wrapper
│   ├── LoginForm.tsx        # Login form component
│   ├── Sidebar.tsx          # Navigation sidebar
│   ├── forms/               # Form components
│   │   ├── CreateVendorForm.tsx # Vendor creation form
│   │   └── CreateCategoryForm.tsx # Category creation form
│   └── pages/               # Page components
│       ├── Profile.tsx      # Admin profile management
│       ├── ChangePassword.tsx # Password change form
│       ├── Vendors.tsx      # Vendor management page
│       └── Categories.tsx   # Category management page
├── contexts/
│   └── AuthContext.tsx      # Authentication context
├── services/
│   └── api.ts              # API service with Axios configuration
├── App.tsx                 # Main app component
└── main.tsx               # App entry point
```

## Key Components

### AuthContext
- Manages global authentication state
- Handles login/logout operations
- Provides loading states
- Manages token storage in localStorage
- Profile management and refresh functionality
- Password change operations

### API Service
- Centralized HTTP client with Axios
- Automatic token injection in requests
- Response/request interceptors
- Error handling and token validation

### LoginForm
- Email/password authentication
- Form validation
- Loading states
- Demo credentials for testing

### Sidebar
- Navigation menu with main and account sections
- Admin profile display with name and email
- Logout functionality
- Active state management
- Profile and settings navigation

### Profile Component
- Complete admin profile information display
- Real-time profile data refresh
- Account creation and update timestamps
- Integrated password change functionality
- Professional UI with status indicators

### ChangePassword Component
- Secure password change form
- Current password verification
- New password validation with strength indicator
- Password confirmation matching
- Real-time form validation and error handling

### CreateVendorForm Component
- Comprehensive vendor creation form
- Complete address information collection
- Real-time form validation with error handling
- Password strength indicator
- Professional form layout with sections
- Modal integration for seamless UX

### Vendors Page
- Real-time vendor listing with API integration
- Search and filter functionality
- Vendor status indicators (Active/Inactive, Verified/Pending)
- Professional vendor cards with complete information
- Create vendor modal integration
- Empty state handling with call-to-action
- Refresh functionality for real-time updates

### CreateCategoryForm Component
- Simple category creation form with name and description
- Real-time form validation with error handling
- Category preview with slug generation
- Professional form layout with visual feedback
- Modal integration for seamless UX

### Categories Page
- Real-time category listing with API integration
- Hierarchical display of categories and subcategories
- Expandable/collapsible category tree structure
- Search functionality across categories and subcategories
- Category status indicators (Active/Inactive)
- Creator information and creation timestamps
- Professional category cards with complete information
- Empty state handling with call-to-action
- Refresh functionality for real-time updates

## Security Features

- **JWT token storage** in localStorage
- **Automatic token cleanup** on logout
- **Request interceptors** for token injection
- **Response interceptors** for token validation
- **Secure logout** with server-side token invalidation

## Demo Credentials

For testing purposes, use these credentials:
- **Email:** admin@example.com
- **Password:** admin123

## Error Handling

- **Network errors** are caught and displayed via toast notifications
- **Authentication errors** automatically redirect to login
- **Form validation** provides immediate feedback
- **Loading states** prevent multiple submissions

## Browser Compatibility

- Modern browsers with ES6+ support
- localStorage support required
- Responsive design works on all screen sizes

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Code Quality

- **ESLint** for code linting
- **TypeScript** for type safety
- **Prettier** for code formatting
- **Tailwind CSS** for consistent styling

## Contributing

1. Follow the existing code structure
2. Use TypeScript for all new components
3. Add proper error handling
4. Include loading states for async operations
5. Test authentication flows thoroughly

## License

This project is licensed under the MIT License.
