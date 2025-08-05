# Software Requirements Specification (SRS)

## Project Title: NaapBook – Offline Tailor Measurement App (MVP)

**Version:** 1.2  
**Date:** August 3, 2025  
**Document Status:** Final - Production Ready

---

## 13. Data Migration and Versioning

### 13.1 Data Version Management

The `data_version` field in `app_metadata` tracks the schema version of stored data. This enables future data migrations when the app structure evolves.

**Current Version:** 1.0  
**Migration Strategy:** Future consideration - will be implemented when schema changes are required in subsequent versions.

**Backwards Compatibility:** MVP version assumes clean installation. Future versions will include migration utilities to handle schema updates without data loss.

---

## 1. Introduction

### 1.1 Purpose

The purpose of this project is to develop a lightweight, offline-first mobile application tailored for individual tailors to record, store, and view client body measurements efficiently without relying on internet connectivity.

### 1.2 Scope

This application will be built using React Native CLI and will function entirely offline. It will allow tailors to:

* Add new client profiles with comprehensive measurement data
* Store multiple measurements under each client with validation
* View, edit, search, and delete client records
* Export data for backup purposes
* Switch between metric and imperial units

Data will be stored locally using `react-native-mmkv` with encryption. Future phases may introduce authentication, cloud backup, and advanced data management features.

### 1.3 Intended Audience

* Independent tailors or small tailoring businesses
* Developers contributing to future phases
* Potential investors or partners evaluating offline-first mobile solutions

### 1.4 Definitions, Acronyms, and Abbreviations

* **MMKV**: A fast, key-value storage library built by Meta
* **UUID**: Universally Unique Identifier
* **MVP**: Minimum Viable Product
* **Naap**: Urdu word for "measurement"
* **RTL**: Right-to-Left text direction
* **CRUD**: Create, Read, Update, Delete operations

---

## 2. Overall Description

### 2.1 Product Perspective

This is a standalone mobile application. It does not depend on any server or cloud infrastructure for its MVP version. The app will run on Android and optionally iOS in later phases.

### 2.2 Product Functions

* Add new clients with name, contact, and optional notes
* Store comprehensive body measurements per client with units
* List and search all saved clients
* View full measurement details with edit capabilities
* Export/import data for backup and migration
* Configure app settings (units, preferences)
* Data validation and error handling

### 2.3 User Characteristics

The target users are tailors with basic smartphone literacy. The interface must be intuitive and avoid complex workflows. All features must function reliably without internet access.

### 2.4 Constraints

* The application must run offline with no network dependencies
* Must be developed using React Native CLI
* Must use `react-native-mmkv` for local storage with encryption
* Must avoid third-party backend services for MVP
* Simple UI optimized for touch interactions
* Support both portrait and landscape orientations

### 2.5 Assumptions and Dependencies

* Future versions may integrate a cloud database (Firebase, Supabase)
* Localization support (e.g., Urdu) may be required later
* React Native version ≥ 0.73
* Android API Level 24+ (Android 7.0+)
* iOS 13+ for future iOS support

---

## 3. Specific Requirements

### 3.1 Functional Requirements

#### FR1: Client Profile Management

The system shall allow adding a new client with:
* Full name (required, 2-50 characters)
* Phone number (optional, valid format)
* Email (optional, valid format)
* Address (optional, max 200 characters)
* Notes (optional, max 300 characters)
* Automatic timestamp generation

#### FR2: Measurement Storage

The system shall allow storing measurements for a client with:

**Upper Body Measurements:**
* Chest/Bust (20-60 inches/50-150 cm)
* Shoulder Width (10-30 inches/25-75 cm)
* Arm Length (15-40 inches/40-100 cm)
* Collar/Neck (10-25 inches/25-65 cm)
* Shirt/Blouse Length (20-50 inches/50-125 cm)

**Lower Body Measurements:**
* Waist (20-60 inches/50-150 cm)
* Hips (25-70 inches/65-175 cm)
* Trouser Length (25-50 inches/65-125 cm)
* Inseam (20-40 inches/50-100 cm)

* **Additional Fields:**
  * Custom measurement fields (up to 5)
  * Notes per measurement
  * Global unit specification from app settings (inches/centimeters)

#### FR3: Search and List Functionality

* The system shall list all clients with name, phone, and creation date
* The system shall support searching clients by name or phone number
* The system shall support sorting by name (A-Z, Z-A) or date (newest/oldest first)
* The system shall display client count and last updated information

#### FR4: View and Edit Measurements

* The system shall display full measurements when a client is selected
* The system shall show measurement history and last updated timestamp for the client
* The system shall allow editing existing measurements with validation
* The system shall highlight recently modified clients

#### FR5: Data Management

* The system shall allow deleting a client with confirmation dialog
* The system shall support bulk operations (delete multiple clients)
* The system shall provide data export functionality (JSON format, .json file)
* The system shall support data import with validation (.json files)
* The system shall allow clearing all data with confirmation

#### FR6: Settings and Preferences

* The system shall allow switching between metric (cm) and imperial (inches) units
* The system shall remember user preferences across app sessions
* The system shall provide app information and version details
* The system shall support data backup/restore operations

#### FR7: Offline Availability

* The system must not require an internet connection
* All features should function fully offline
* Data must persist across app restarts and device reboots

#### FR8: Data Validation

* The system shall validate all measurement inputs within realistic ranges
* The system shall prevent saving clients with empty names
* The system shall show clear error messages for invalid inputs
* The system shall warn users before destructive operations

---

### 3.2 Non-Functional Requirements

#### NFR1: Performance

* All read operations should complete under 100ms using MMKV
* All write operations should complete under 200ms
* App launch time should be under 3 seconds on mid-range devices
* UI should remain responsive during data operations

#### NFR2: Usability

* Interface must use large touch-friendly inputs (minimum 44px touch targets)
* Clean and minimal design with NativeWind (Tailwind for React Native)
* Consistent navigation patterns throughout the app
* Clear visual feedback for all user actions
* Support for both light and dark themes

#### NFR3: Reliability

* App should handle graceful degradation if storage is corrupted
* Automatic data backup before major operations
* Crash recovery mechanisms
* Input validation to prevent data corruption

#### NFR4: Security

* All local data must be encrypted using MMKV encryption
* No sensitive data should be logged or cached insecurely
* App should handle device lock/unlock scenarios appropriately

#### NFR5: Scalability

* Codebase should allow migration from MMKV to SQLite or Firebase
* Component-based architecture for easy feature additions
* Support for up to 1000 clients without performance degradation

#### NFR6: Maintainability

* All storage logic must be abstracted for easy future replacement
* Comprehensive error handling and logging
* Modular component structure following React Native best practices
* Clear separation of business logic and UI components

---

## 4. System Architecture

### 4.1 Application Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Main app screens
├── navigation/         # Navigation configuration
├── services/           # Business logic and API calls
├── storage/           # Data storage abstraction
├── utils/             # Helper functions and constants
├── types/             # TypeScript type definitions
└── constants/         # App constants and configuration
```

### 4.2 Data Design

#### 4.2.1 Enhanced Data Schema (MMKV)

```json
{
  "app_settings": {
    "preferred_unit": "inches",
    "theme": "light",
    "language": "en",
    "version": "1.0.0",
    "created_at": "2025-08-03T14:00Z",
    "updated_at": "2025-08-03T14:30Z"
  },
  "users": {
    "uuid-1": {
      "id": "uuid-1",
      "name": "Ali Bhai",
      "phone": "03001234567",
      "email": "ali@example.com",
      "address": "123 Main Street, Karachi",
      "notes": "Prefers loose fitting clothes",
      "created_at": "2025-08-03T14:00Z",
      "updated_at": "2025-08-03T14:30Z",
      "measurements": {
        "chest": {
          "value": 38,
          "notes": "Extra room needed"
        },
        "shoulder": {
          "value": 18,
          "notes": ""
        },
        "arm_length": {
          "value": 24,
          "notes": "Measured with arm extended"
        },
        "collar": {
          "value": 16,
          "notes": ""
        },
        "shirt_length": {
          "value": 30,
          "notes": ""
        },
        "waist": {
          "value": 34,
          "notes": ""
        },
        "hips": {
          "value": 36,
          "notes": ""
        },
        "trouser_length": {
          "value": 42,
          "notes": ""
        },
        "inseam": {
          "value": 32,
          "notes": ""
        },
        "custom_fields": {
          "field_1": {
            "name": "Thigh",
            "value": 22,
            "notes": ""
          }
        }
      }
    }
  },
  "app_metadata": {
    "total_clients": 1,
    "last_backup": "2025-08-03T14:00Z",
    "data_version": "1.0"
  }
}
```

#### 4.2.2 Storage Abstraction Layer

```typescript
// Types
interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  measurements: Measurements;
}

interface Measurement {
  value: number;
  notes?: string;
}

interface AppSettings {
  preferred_unit: 'inches' | 'cm';
  theme: 'light' | 'dark';
  language: string;
  version: string;
  created_at: string;
  updated_at: string;
}

// Core CRUD Operations
export const saveUser = (user: User): Promise<void>;
export const getUser = (id: string): Promise<User | null>;
export const getAllUsers = (): Promise<User[]>;
export const updateUser = (id: string, updates: Partial<User>): Promise<void>;
export const deleteUser = (id: string): Promise<void>;

// Search and Filter Operations
export const searchUsers = (query: string): Promise<User[]>;
export const getUsersByDateRange = (start: Date, end: Date): Promise<User[]>;
export const sortUsers = (users: User[], sortBy: 'name' | 'date', order: 'asc' | 'desc'): User[];

// Settings Management
export const getAppSettings = (): Promise<AppSettings>;
export const updateAppSettings = (settings: Partial<AppSettings>): Promise<void>;
export const resetAppSettings = (): Promise<void>;

// Data Management
export const exportAllData = (): Promise<string>;
export const importData = (jsonData: string): Promise<{ success: boolean; message: string }>;
export const clearAllData = (): Promise<void>;
export const getDataStatistics = (): Promise<{ totalClients: number; totalMeasurements: number; lastBackup: string }>;

// Validation Functions
export const validateUser = (user: Partial<User>): { isValid: boolean; errors: string[] };
export const validateMeasurement = (value: number, field: string): { isValid: boolean; error?: string };
```

### 4.3 Screen Flow and Navigation

#### 4.3.1 Primary Navigation Flow

1. **Home Screen (ClientListScreen)**
   - List of all clients with search functionality
   - Floating action button to add new client
   - Sort and filter options

2. **Add/Edit Client Screen (ClientFormScreen)**
   - Form for client information and measurements
   - Real-time validation
   - Save/cancel actions

3. **Client Detail Screen (ClientDetailScreen)**
   - View all measurements in organized sections
   - Edit button for modifications
   - Delete option with confirmation

4. **Settings Screen (SettingsScreen)**
   - Unit preferences
   - Theme selection
   - Data management options
   - About information

#### 4.3.2 Input Validation Rules

**Client Information:**
- Name: Required, 2-50 characters, no special characters except spaces, hyphens, apostrophes
- Phone: Optional, valid phone number format (supports international formats)
- Email: Optional, valid email format
- Address: Optional, max 200 characters
- Notes: Optional, max 300 characters

**Measurements:**
- All measurements: Positive numbers only
- Range validation based on measurement type (see FR2)
- Unit consistency within client record
- Notes per measurement: max 100 characters

---

## 5. User Interface Requirements

### 5.1 Design Principles

* **Simplicity**: Clean, uncluttered interface
* **Accessibility**: High contrast, readable fonts, proper touch targets
* **Consistency**: Uniform design patterns across all screens
* **Efficiency**: Minimal taps to complete common tasks

### 5.2 Key UI Components

* **Navigation**: Bottom tab navigation or drawer navigation
* **Forms**: Large input fields with clear labels and validation feedback
* **Lists**: Card-based layout with search and sort capabilities
* **Buttons**: Clearly labeled with appropriate colors (primary, secondary, destructive)
* **Dialogs**: Confirmation dialogs for destructive actions

### 5.3 Responsive Design

* Support for various screen sizes (5" to 12" displays)
* Portrait and landscape orientations
* Proper keyboard handling and scroll behavior
* Touch-friendly interface elements

---

## 6. Error Handling and Data Integrity

### 6.1 Error Scenarios

* **Storage Failures**: MMKV read/write errors
* **Data Corruption**: Invalid JSON or missing required fields
* **Validation Errors**: Invalid user input
* **Memory Issues**: Low device storage
* **App Crashes**: Unexpected terminations

### 6.2 Error Handling Strategy

* Graceful degradation with user-friendly error messages
* Automatic retry mechanisms for transient failures
* Data backup before critical operations
* Crash reporting and recovery mechanisms
* User guidance for resolving common issues

---

## 7. Security and Privacy

### 7.1 Data Security

* Local data encryption using MMKV encryption features
* No data transmission over networks (offline-first)
* Secure storage of sensitive client information
* Protection against unauthorized access

### 7.2 Privacy Considerations

* No analytics or tracking in MVP version
* Client data remains on device only
* Clear data retention and deletion policies
* User control over data export and backup

---

## 8. Testing Requirements

### 8.1 Unit Testing

* Performance testing with mock datasets (100, 500, 1000 clients)
* Storage layer functions
* Validation logic
* Data transformation utilities
* Error handling mechanisms

### 8.2 Integration Testing

* Screen navigation flows
* Data persistence across app restarts
* Import/export functionality
* Settings persistence

### 8.3 User Acceptance Testing

* Core user workflows (add, edit, delete clients)
* Search and filter functionality
* Data export/import operations
* Error scenario handling

---

## 9. Deployment and Installation

### 9.1 Target Platforms

* **Primary**: Android (API Level 24+)
* **Future**: iOS 13+

### 9.2 Distribution

* MVP: Development builds for testing
* Future: Google Play Store, Apple App Store

### 9.3 Installation Requirements

* Minimum 50MB free storage
* Android 7.0+ with sufficient RAM (2GB+)
* No network connection required for app functionality

---

## 10. Future Enhancements (Phase 2+)

| Priority | Feature | Description |
|----------|---------|-------------|
| High | Cloud Backup | Firebase/Supabase integration for data sync |
| High | Multi-user Support | Authentication and user separation |
| High | Export Formats | PDF receipts, Excel export |
| Medium | Localization | Urdu language support, RTL layout |
| Medium | Media Support | Client photos, measurement diagrams |
| Medium | Advanced Measurements | 3D body scanning integration |
| Low | Analytics | Usage tracking and insights |
| Low | Appointment System | Booking and scheduling features |

---

## 11. Technical Dependencies

### 11.1 Core Libraries

```json
{
  "react-native": "^0.73.0",
  "react-native-mmkv": "^2.10.1",
  "nativewind": "^2.0.11",
  "uuid": "^9.0.0",
  "@react-navigation/native": "^6.1.0",
  "@react-navigation/bottom-tabs": "^6.5.0",
  "react-native-vector-icons": "^10.0.0",
  "react-native-toast-message": "^2.1.6",
  "react-hook-form": "^7.45.0",
  "react-native-confirmation-code-field": "^7.3.1"
}
```

### 11.2 Development Tools

```json
{
  "@types/react": "^18.2.0",
  "@types/react-native": "^0.72.0",
  "@typescript-eslint/eslint-plugin": "^6.0.0",
  "eslint": "^8.19.0",
  "prettier": "^3.0.0",
  "jest": "^29.0.0",
  "@testing-library/react-native": "^12.0.0"
}
```

---

## 12. Acceptance Criteria

### 12.1 MVP Success Criteria

* Successfully add, view, edit, and delete client profiles
* Store and retrieve measurements with validation
* Search and filter clients efficiently
* Export/import data functionality working
* App runs completely offline
* Data persists across app restarts
* No crashes during normal usage
* Performance meets specified requirements

### 12.2 Quality Gates

* 95%+ crash-free sessions
* < 3 second app launch time
* All core user journeys testable and working
* Proper error handling for edge cases
* Clean, intuitive user interface
* Comprehensive data validation

---

## Document Control

**Prepared by:** Development Team  
**Reviewed by:** Product Owner  
**Approved by:** Project Stakeholder  
**Next Review Date:** September 1, 2025

---

*This document serves as the definitive specification for NaapBook MVP development. Any changes to requirements must be approved through proper change management process.*