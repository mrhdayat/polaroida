# Polaroida 📸

**Polaroida** is a minimalist visual photo journal designed to capture moments with the aesthetic charm of analog photography. Built with modern web technologies, it focuses on simplicity, visual storytelling, and a premium user experience.

![Polaroida Banner](./public/opengraph-image.png)

## ✨ Features

### Core Functionality
-   **Visual Feed**: An immersive, grid-based or timeline feed of your memories.
-   **Photo Uploads**: easy drag-and-drop or camera capture uploads.
-   **Location Mapping**: Interact with your memories on a global map.
-   **Albums & Organization**: Group photos into thematic collections.

### 🎨 Customization (New!)
-   **Visual Style Themes**: Choose from 6 distinct aesthetic themes that transform the entire application:
    -   **Classic White**: Clean, timeless Polaroid look.
    -   **Vintage Film**: Warm, nostalgic tones.
    -   **Minimal Black**: Bold, gallery-inspired dark mode.
    -   **Pastel Dream**: Soft, dreamy aesthetics.
    -   **Darkroom Red**: Intense, safe-light inspired.
    -   **Monochrome**: Pure black and white contrast.
-   **Dynamic Frame Styles**: Polaroid frames adapt intelligently to your chosen theme.

### 🛡️ Production Security & Performance (Added!)
1.  **Strict Content Security Policy**: Middleware-protected headers to prevent XSS and injection attacks.
2.  **SEO Optimization**: Automatic `sitemap.xml` and `robots.txt` generation.
3.  **PWA Support**: Installable on mobile devices via Web Manifest.
4.  **Open Graph Protocol**: Dynamic social sharing cards.
5.  **Global Error Handling**: Graceful error boundaries and custom 404 pages.
6.  **Optimized Performance**: Next.js 14 compiler optimizations and strict caching policies.
7.  **Input Validation**: Zod-based schema validation for data integrity.
8.  **Responsive Design**: Fluid layouts that adapt to any device.
9.  **Secure Authentication**: Powered by Supabase Auth (Row Level Security enabled).
10. **Accessibility**: Semantic HTML and ARIA labels for better screen reader support.

## 🛠️ Tech Stack

-   **Framework**: Next.js 16 (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS (v4)
-   **Database**: Supabase (PostgreSQL)
-   **Animations**: Framer Motion
-   **Icons**: Lucide React
-   **Maps**: Leaflet (React-Leaflet)

## 🚀 Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/polaroida.git
    cd polaroida
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file with your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 📂 Project Structure

-   `/app`: Next.js App Router pages and layouts.
-   `/components`: Reusable UI components.
-   `/lib`: Utility functions and Supabase client.
-   `/database`: SQL migration scripts and schemas.
-   `/public`: Static assets.

## 📄 License

MIT License. Created by [Your Name].
