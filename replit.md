# Discord Bot - Moderation & Giveaway System

## Overview

This is a comprehensive Discord bot built with Node.js and Discord.js v14 that provides moderation tools, user registration system, and giveaway management for Discord servers. The bot includes an interactive help system, automated welcome messages, and a keep-alive mechanism for continuous uptime monitoring.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Bot Architecture
- **Framework**: Discord.js v14 with modern gateway intents
- **Runtime**: Node.js with modular command/event handler architecture
- **Keep-Alive System**: Integrated Express.js web server for uptime monitoring
- **Data Persistence**: JSON file-based storage system for user data and giveaway management

### Command System
- **Prefix-based Commands**: Traditional `!` prefix command structure
- **Modular Design**: Separate command files for different functionalities (moderation, giveaway, registration, help)
- **Permission System**: Custom permission wrapper with role hierarchy checking
- **Cooldown Management**: Built-in command cooldown system to prevent spam

### Event-Driven Architecture
- **Event Handlers**: Separate event files for guild member additions, message processing, and button interactions
- **Interactive Components**: Discord buttons and embeds for user registration and giveaway participation
- **Auto-Registration Flow**: Automated welcome messages with registration prompts for new members

### Data Management
- **JSON Database**: File-based storage for user registration data and giveaway information
- **User Persistence**: Tracks user registration status, warnings, and moderation history
- **Giveaway Storage**: Manages active giveaways with participant tracking

### Web Server Integration
- **Express.js Server**: Provides health check endpoints and bot status information
- **Uptime Monitoring**: RESTful API endpoints for external monitoring services
- **Status Dashboard**: JSON responses with bot statistics (guilds, users, uptime)

### Security & Permissions
- **Permission Layers**: Custom permission system with Discord permission integration
- **Role Hierarchy**: Respects Discord's role hierarchy for moderation actions
- **Admin Override**: Administrator permissions bypass all restrictions
- **Bot Permission Validation**: Checks bot permissions before executing moderation actions

## External Dependencies

### Discord Integration
- **Discord.js v14**: Primary Discord API wrapper for bot functionality
- **Gateway Intents**: Guilds, messages, members, and reactions for comprehensive server monitoring
- **OAuth2 Integration**: Bot invitation system with predefined permission scopes

### Web Framework
- **Express.js v5**: Web server for keep-alive functionality and health monitoring
- **HTTP/HTTPS Support**: Configurable protocol support for various hosting environments

### Runtime Environment
- **Node.js**: Server-side JavaScript runtime
- **Environment Variables**: Secure token management and configuration
- **File System**: JSON-based data persistence without external database dependencies

### Hosting Considerations
- **Replit Integration**: Built-in keep-alive system designed for Replit hosting
- **Port Configuration**: Dynamic port assignment with fallback defaults
- **Process Management**: Graceful error handling and automatic recovery mechanisms