# NaapBook 📏

> **Offline-First Tailor Measurement App**

A lightweight, efficient mobile application designed specifically for tailors to record, store, and manage client body measurements without requiring internet connectivity.

![React Native](https://img.shields.io/badge/React%20Native-0.73+-blue.svg)
![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Status](https://img.shields.io/badge/Status-MVP%20Development-orange.svg)

---

## 🎯 Overview

**NaapBook** (Urdu: نَاپ = measurement) is an offline-first mobile application built with React Native CLI, designed to help individual tailors and small tailoring businesses efficiently manage client measurements and profiles without depending on internet connectivity.

### ✨ Key Features

- 📱 **Completely Offline** - No internet required, ever
- 👥 **Client Management** - Add, edit, view, and delete client profiles
- 📏 **Comprehensive Measurements** - Store detailed body measurements with notes
- 🔍 **Smart Search** - Find clients by name or phone number
- 📊 **Data Export/Import** - Backup and restore data via JSON files
- ⚙️ **Flexible Settings** - Switch between inches/cm, theme preferences
- 🔒 **Encrypted Storage** - Local data protection with MMKV encryption
- 🚀 **High Performance** - Sub-200ms operations, supports 1000+ clients

---

## 🏗️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React Native CLI 0.73+ |
| **Storage** | react-native-mmkv (encrypted) |
| **Styling** | NativeWind (Tailwind CSS) |
| **Navigation** | React Navigation 6 |
| **Forms** | React Hook Form |
| **Icons** | React Native Vector Icons |
| **Language** | TypeScript |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development - optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/naapbook.git
cd naapbook

# Install dependencies
npm install

# iOS setup (if developing for iOS)
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

### Development Setup

```bash
# Install development dependencies
npm install --save-dev

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build:android
```

---

## 📱 App Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components (Button, Input, etc.)
│   ├── forms/          # Form-specific components
│   └── lists/          # List and card components
├── screens/            # Main application screens
│   ├── ClientListScreen.tsx
│   ├── ClientFormScreen.tsx
│   ├── ClientDetailScreen.tsx
│   └── SettingsScreen.tsx
├── navigation/         # Navigation configuration
│   └── AppNavigator.tsx
├── services/           # Business logic and utilities
│   ├── storage.ts      # MMKV storage abstraction
│   ├── validation.ts   # Input validation logic
│   └── export.ts       # Data export/import functions
├── types/             # TypeScript type definitions
│   ├── Client.ts
│   ├── Measurement.ts
│   └── Settings.ts
├── utils/             # Helper functions
│   ├── constants.ts
│   ├── formatters.ts
│   └── converters.ts
└── hooks/             # Custom React hooks
    ├── useStorage.ts
    └── useSettings.ts
```

---

## 📊 Data Schema

### Client Profile
```typescript
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
```

### Measurements
```typescript
interface Measurement {
  value: number;
  notes?: string;
}

interface Measurements {
  chest: Measurement;
  shoulder: Measurement;
  arm_length: Measurement;
  collar: Measurement;
  shirt_length: Measurement;
  waist: Measurement;
  hips: Measurement;
  trouser_length: Measurement;
  inseam: Measurement;
  custom_fields?: { [key: string]: Measurement & { name: string } };
}
```

### App Settings
```typescript
interface AppSettings {
  preferred_unit: 'inches' | 'cm';
  theme: 'light' | 'dark';
  language: string;
  version: string;
  created_at: string;
  updated_at: string;
}
```

---

## 🔧 Core Features

### 1. Client Management
- ➕ Add new clients with comprehensive details
- ✏️ Edit existing client information
- 👁️ View detailed client profiles
- 🗑️ Delete clients with confirmation
- 🔢 Bulk operations support

### 2. Measurement System
- 📏 **Upper Body**: Chest, Shoulder, Arm Length, Collar, Shirt Length
- 👖 **Lower Body**: Waist, Hips, Trouser Length, Inseam
- ➕ **Custom Fields**: Up to 5 additional measurements
- 📝 **Notes**: Individual notes per measurement
- 🔄 **Unit Conversion**: Switch between inches and centimeters

### 3. Data Management
- 🔍 **Search**: Find clients by name or phone
- 📤 **Export**: Backup data as JSON files
- 📥 **Import**: Restore data from JSON files
- 🧹 **Cleanup**: Clear all data with confirmation
- 📊 **Statistics**: Client count and data insights

### 4. Settings & Preferences
- 📐 **Units**: Toggle between inches/centimeters
- 🎨 **Theme**: Light/Dark mode support
- 🌐 **Language**: Prepared for multi-language support
- 🔄 **Backup**: Manual data backup options

---

## 🎯 Performance Targets

| Metric | Target | Status |
|--------|---------|---------|
| **App Launch** | < 3 seconds | ✅ Optimized |
| **Read Operations** | < 100ms | ✅ MMKV powered |
| **Write Operations** | < 200ms | ✅ Efficient storage |
| **Search Results** | < 150ms | ✅ In-memory filtering |
| **Client Capacity** | 1000+ clients | ✅ Tested |
| **Crash-Free Rate** | 95%+ | 🎯 Target |

---

## 📋 Testing

### Unit Tests
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test suite
npm test -- --testNamePattern="Storage"
```

### Performance Testing
```bash
# Generate mock data for testing
npm run generate-mock-data

# Test with different dataset sizes
npm run test:performance:100    # 100 clients
npm run test:performance:500    # 500 clients  
npm run test:performance:1000   # 1000 clients
```

### Manual Testing Checklist
- [ ] Add/Edit/Delete client workflows
- [ ] Search functionality with various queries
- [ ] Export/Import data operations
- [ ] Unit conversion accuracy
- [ ] App performance under load
- [ ] Offline functionality verification

---

## 🚢 Build & Deployment

### Android Build
```bash
# Debug build
npm run android

# Release build
cd android
./gradlew assembleRelease

# Generated APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

### iOS Build (Future)
```bash
# Debug build
npm run ios

# Release build
cd ios
xcodebuild -workspace NaapBook.xcworkspace -scheme NaapBook -configuration Release
```

---

## 🗺️ Roadmap

### Phase 1 - MVP ✅ (Current)
- [x] Core client management
- [x] Measurement storage and retrieval
- [x] Search and filter functionality
- [x] Data export/import
- [x] Settings management
- [x] Offline-first architecture

### Phase 2 - Enhanced Features 🚧 (Planned)
- [ ] Cloud backup integration (Firebase/Supabase)
- [ ] Multi-user authentication
- [ ] PDF export for measurements
- [ ] Client photo attachments
- [ ] Advanced measurement templates

### Phase 3 - Business Features 📋 (Future)
- [ ] Appointment scheduling
- [ ] Order tracking
- [ ] Billing integration
- [ ] Multi-language support (Urdu, Hindi)
- [ ] Tablet optimization

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- TypeScript for all new code
- ESLint + Prettier for code formatting
- Jest for unit testing
- Conventional commits for commit messages

---

## 📄 Documentation

- [Software Requirements Specification (SRS)](docs/SRS.md)
- [API Documentation](docs/API.md)
- [Architecture Guide](docs/ARCHITECTURE.md)
- [Testing Guide](docs/TESTING.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

---

## 🐛 Issues & Support

Found a bug or have a feature request?

- 🐛 [Report Bug](https://github.com/yourusername/naapbook/issues/new?template=bug_report.md)
- 💡 [Request Feature](https://github.com/yourusername/naapbook/issues/new?template=feature_request.md)
- 💬 [Discussions](https://github.com/yourusername/naapbook/discussions)

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/naapbook?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/naapbook?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/naapbook)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/naapbook)

---

## 📱 Screenshots

| Home Screen | Add Client | Measurements | Settings |
|-------------|------------|--------------|----------|
| ![Home](screenshots/home.png) | ![Add](screenshots/add.png) | ![Measurements](screenshots/measurements.png) | ![Settings](screenshots/settings.png) |

---

## 🏆 Acknowledgments

- **React Native Community** - For the amazing framework
- **Meta (Facebook)** - For MMKV storage solution
- **Tailors Community** - For feedback and requirements
- **Open Source Contributors** - For making this possible

---

## 📞 Contact

**Project Maintainer:** [Your Name](mailto:your.email@example.com)  
**Project Link:** [https://github.com/yourusername/naapbook](https://github.com/yourusername/naapbook)

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ for the Tailoring Community**

*Empowering tailors with modern, offline-first technology*

[⭐ Star this project](https://github.com/yourusername/naapbook) • [🍴 Fork it](https://github.com/yourusername/naapbook/fork) • [📢 Share it](https://twitter.com/intent/tweet?text=Check%20out%20NaapBook%20-%20Offline%20Tailor%20Measurement%20App&url=https://github.com/yourusername/naapbook)

</div>