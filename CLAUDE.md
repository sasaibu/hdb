# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Health Data Bank (HDB) mobile application project, built with React Native for iOS and Android platforms (latest OS versions only). The project is currently in early planning stages with documentation-only content.

## Project Structure

The project contains planning documentation in the `doc/` directory:
- `アプリケーション実装方式.md` - Technical implementation approach
- `進捗管理表.md` - Progress management and task tracking
- `全体作業計画.tsv` - Overall work plan with phases and deliverables
- `開発対象機能一覧.tsv` - Detailed feature list and requirements

## Development Status

This is a greenfield project in the planning phase. No React Native code has been implemented yet. The project documentation indicates:
- Framework: React Native
- Platforms: iOS and Android (latest OS only)
- Development approach: Prototyping phases planned
- Current status: Language/framework selection completed, environment setup pending

## Key Features to Implement

Based on project documentation, the app will include:
- User authentication (ID/password)
- Health data integration (HealthKit for iOS, Google Fit/Health Connect for Android)
- Vital data management (steps, temperature, weight, body fat, blood pressure, pulse)
- Dashboard and data visualization
- Push notifications
- Data backup/restore functionality
- User profile management
- WebView integration for external services

## Development Phases

1. **Environment Setup** (20% complete)
   - Framework selection completed
   - Environment setup documentation, project creation, Git repo setup pending

2. **Prototype Phase 1** (0% complete)
   - Initial React Native project setup
   - Basic authentication and navigation
   - Core UI components

3. **Prototype Phase 2** (0% complete)
   - Health platform integrations
   - Full feature implementation
   - Testing and optimization

## Notes for Development

- This project requires health platform integrations (HealthKit/Google Fit)
- WebView components needed for existing HDB system integration
- Data migration functionality required for user transfers
- Platform-specific implementations needed for iOS vs Android health data access
- No existing codebase - all implementation will be from scratch