import './globals.css';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import ThemeProvider from '@/components/ThemeProvider';

export const metadata = {
  title: 'FUTUREPATH AI | ระบบวิเคราะห์ศักยภาพและแนะแนวอาชีพ',
  description: 'ระบบ AI วิเคราะห์ศักยภาพและแนะแนวอาชีพแห่งอนาคต ด้วยเทคโนโลยี Gemini AI',
  icons: { icon: '/img/logo1.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        {/* ── Preconnect to speed up Google Fonts ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* ── Kanit — all weights 300–900 ── */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap"
        />
        {/* ── Font Awesome icons ── */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body style={{ fontFamily: "'Kanit', sans-serif" }}>
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <AnalyticsTracker />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
