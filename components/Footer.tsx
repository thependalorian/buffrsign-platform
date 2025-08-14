// Footer component for BuffrSign web app. Purpose: Provide footer consistent with branding. Location: components/Footer.tsx
export default function Footer() {
  return (
    <footer className="footer footer-center p-4 bg-base-100 border-t">
      <aside>
        <p>© {new Date().getFullYear()} BuffrSign</p>
      </aside>
    </footer>
  );
}

