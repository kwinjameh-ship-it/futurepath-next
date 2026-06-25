import './globals.css';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import ThemeProvider from '@/components/ThemeProvider';
import AdminFloatButton from '@/components/AdminFloatButton';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'FUTUREPATH AI | ระบบค้นพบตัวตนและแนะแนวอาชีพด้วย AI',
  description: 'ระบบ AI วิเคราะห์ศักยภาพ ทักษะ และแนะแนวอาชีพแห่งอนาคต สำหรับนักเรียนและสถานศึกษา ประมวลผลลึกถึง School DNA ด้วยเทคโนโลยี Gemini AI',
  keywords: ['แนะแนวอาชีพ', 'ค้นหาตัวเอง', 'AI แนะแนว', 'FUTUREPATH AI', 'การศึกษา', 'แบบทดสอบอาชีพ', 'School DNA', 'วิเคราะห์ศักยภาพ'],
  authors: [{ name: 'FUTUREPATH Team' }],
  creator: 'FUTUREPATH AI',
  publisher: 'FUTUREPATH AI',
  robots: 'index, follow',
  openGraph: {
    title: 'FUTUREPATH AI | ค้นพบอาชีพที่ใช่ ด้วย AI วิเคราะห์ศักยภาพ',
    description: 'ทดสอบทักษะ 6 ด้าน เพื่อค้นหาอาชีพที่เหมาะสมกับคุณที่สุด พร้อมแผนพัฒนาศักยภาพเฉพาะบุคคล',
    url: 'https://futurepath-ai.vercel.app', // เปลี่ยนเป็น Domain จริงเมื่อพร้อม
    siteName: 'FUTUREPATH AI',
    images: [
      {
        url: '/img/logo1.png', // แนะนำให้สร้างภาพ OG Image ขนาด 1200x630 เพิ่มทีหลัง
        width: 800,
        height: 600,
        alt: 'FUTUREPATH AI Logo',
      },
    ],
    locale: 'th_TH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FUTUREPATH AI | ระบบค้นพบตัวตนด้วย AI',
    description: 'แนะแนวอาชีพที่ใช่ ผ่านการวิเคราะห์ทักษะด้วย AI สำหรับนักเรียนและโรงเรียน',
    images: ['/img/logo1.png'],
  },
  icons: { icon: '/img/logo1.png', apple: '/img/logo1.png' },
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
          <Toaster position="top-center" reverseOrder={false} toastOptions={{ style: { fontFamily: "'Kanit', sans-serif", fontSize: '16px' } }} />
          {children}
          <AdminFloatButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
