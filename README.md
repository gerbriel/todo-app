# 📋 Advanced Todo & Project Management App

A powerful, feature-rich todo and project management application built with React, TypeScript, and Supabase. Features an advanced calendar view with spanning cards, drag-and-drop functionality, and real-time collaboration.

## ✨ **Key Features**

### 🗓️ **Advanced Calendar View**
- **Spanning Cards**: Cards seamlessly span across multiple dates and break intelligently at row boundaries
- **Dynamic Cell Heights**: Calendar cells automatically resize to accommodate multiple cards without overlap
- **Lane-Based Layout**: Multiple cards on the same dates display in parallel lanes for perfect organization
- **Edge Dragging**: Click and drag card edges to resize start/end dates directly on the calendar
- **Double-Click Editing**: Double-click any card to instantly open the edit modal

### 📊 **Dashboard & Board Management**
- **Dashboard View**: Enhanced overview with board management and card insights
- **Drag & Drop**: Intuitive card movement between lists and boards
- **Real-time Updates**: Changes sync instantly with Supabase
- **Archive System**: Archive and restore boards, lists, and cards

### 🏷️ **Advanced Card Features**
- **Labels & Tags**: Color-coded labels for easy categorization
- **Custom Fields**: Flexible metadata with text, email, phone, and number fields
- **Checklists/Workflows**: Task breakdown with progress tracking
- **File Attachments**: Document and image support
- **Activity Tracking**: Complete audit trail of all changes

### 🔍 **Smart Search & Organization**
- **Global Search**: Find cards, boards, and content across your workspace
- **Quick Filters**: Filter by labels, dates, assignees, and status
- **Search Results**: Contextual search with highlighting and navigation

## 🛠️ **Technology Stack**

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Drag & Drop**: @dnd-kit/core
- **Backend**: Supabase (PostgreSQL, Real-time, Auth)
- **State Management**: TanStack React Query
- **Icons**: Lucide React

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/advanced-todo-app.git
   cd advanced-todo-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL schema provided in `/supabase/schema.sql`
   - Copy your project URL and anon key

4. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🚀 **Deployment to GitHub Pages**

This app is configured for automatic deployment to GitHub Pages:

### **Automatic Deployment**
- Push to `main` branch triggers automatic deployment via GitHub Actions
- App will be available at: `https://yourusername.github.io/todo-app/`

### **Manual Deployment**
```bash
npm run build
npm run deploy
```

### **Environment Variables for Production**
In your GitHub repository settings, add these secrets:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### **Supabase Configuration for GitHub Pages**
Add your GitHub Pages URL to Supabase Auth settings:
- Go to Authentication → Settings → Site URL
- Add: `https://yourusername.github.io/todo-app/`

### **Set Up Admin User**
1. Update the SQL schema with your email:
   ```sql
   -- Replace 'gabrielriosemail@gmail.com' with your actual email
   INSERT INTO allowed_users (email, is_admin) 
   VALUES ('gabrielriosemail@gmail.com', true)
   ON CONFLICT (email) DO NOTHING;
   ```
2. Run this in your Supabase SQL editor
3. Sign up with your email to become the admin

### **User Management**
- Only approved users can access the app
- Admins can:
  - Add new users to the whitelist
  - Remove users from the whitelist
  - Grant/revoke admin privileges
  - Approve/disapprove user registrations
- Users not on the whitelist will see a "pending approval" screen

## 📅 **Calendar Features in Detail**

### Spanning Cards
Cards automatically span across multiple calendar dates with intelligent row breaking. When a card spans multiple days:
- Continues seamlessly across the same row
- Breaks to the next row when reaching week boundaries
- Maintains visual continuity with connecting segments

### Dynamic Heights
Calendar cells adjust their height automatically based on content:
- Base height for date display
- Additional height per card lane needed
- Smooth scaling for different numbers of overlapping events

### Lane Assignment
Smart algorithm prevents card overlap:
- Assigns each card to the first available lane
- Considers the entire span of multi-day cards
- Maintains consistent lane assignment across card segments

## 🗄️ **Database Schema**

The app uses a comprehensive PostgreSQL schema with:
- **Workspaces**: Multi-tenant organization
- **Boards & Lists**: Hierarchical project structure  
- **Cards**: Rich task/event objects with dates, metadata
- **Labels & Custom Fields**: Flexible categorization
- **Checklists**: Task breakdown and workflows
- **Activity Logs**: Complete audit trails
- **Row Level Security**: Secure multi-user access

## 📱 **Screenshots**

### Calendar View
![Calendar View](docs/screenshots/calendar-view.png)
*Advanced calendar with spanning cards and dynamic heights*

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)
*Clean dashboard with board overview and quick actions*

## 🔐 **Security**

- Row Level Security (RLS) enabled on all tables
- User authentication via Supabase Auth
- Automatic profile creation and management
- Secure API endpoints with proper authorization

## 🎨 **UI/UX Features**

- **Dark/Light Mode**: Automatic theme detection
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Keyboard Shortcuts**: Quick navigation and actions
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages

## 📈 **Performance**

- **Optimistic Updates**: Instant UI feedback
- **Efficient Queries**: Smart data fetching with React Query
- **Lazy Loading**: Components load as needed
- **Caching**: Intelligent cache management

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Built with love using modern React ecosystem
- Inspired by the best project management tools
- Special thanks to the open-source community

---

**Built with ❤️ and ☕ for productive project management**