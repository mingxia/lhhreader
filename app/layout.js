import './globals.css';

export const metadata = {
  title: '连环画阅读器',
  description: 'Next.js + React 连环画阅读器界面',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
