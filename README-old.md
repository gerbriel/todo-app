# Project Management Application

A modern, full-stack project management application built with React, TypeScript, Vite, Tailwind CSS, and Supabase.

## Features

### 🚀 Core Features
- **Kanban Boards**: Create and manage multiple project boards
- **Drag & Drop**: Intuitive card and list reordering with @dnd-kit
- **Card Management**: Rich cards with descriptions, labels, due dates, and workflows
- **Workflow System**: Task management with assignments and reminders
- **File Attachments**: Drag & drop file uploads with Supabase Storage
- **Labels**: Color-coded organization system
- **Custom Fields**: Flexible data collection (text, email, phone, number)
- **Calendar Views**: Timeline and scheduling with date filtering
- **Activity Tracking**: Comprehensive audit trail
- **Real-time Updates**: Live collaboration with Supabase subscriptions

### 🛠 Tech Stack
- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: TanStack React Query for server state
- **Drag & Drop**: @dnd-kit/sortable for smooth interactions
- **Icons**: Lucide React for consistent iconography
- **Routing**: React Router DOM v6+

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── api/              # API functions and queries
├── components/       # React components
│   ├── board/        # Board-related components
│   ├── card/         # Card-related components
│   ├── layout/       # Layout components
│   ├── ui/           # Reusable UI components
│   └── workflow/     # Workflow/task components
├── hooks/            # Custom React hooks
├── lib/              # Utility libraries
├── pages/            # Page components
├── types/            # TypeScript type definitions
└── main.tsx          # App entry point
```

## Database Schema

The application uses Supabase with PostgreSQL. The database includes:

- Workspaces and boards
- Lists and cards  
- Labels and custom fields
- Workflows (checklists) and tasks
- File attachments
- Activity tracking
- User profiles

## Key Features

### Drag & Drop
Uses @dnd-kit for smooth interactions:
- Cards between lists
- Lists within boards
- Tasks within workflows

### Workflow System
Enhanced task management with:
- Task assignments
- Due date tracking
- Reminder intervals
- Progress indicators

### File Management
Modern upload experience:
- Drag & drop interface
- Progress tracking
- Supabase Storage integration

## Deployment

Build for production:
```bash
npm run build
```

Deploy the `dist/` folder to your preferred hosting service.

## License

MIT License - see LICENSE file for details.

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
