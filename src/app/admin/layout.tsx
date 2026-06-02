//src/app/admin/layout.tsx

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell min-h-screen bg-[#CBD5E1] [--catalog-bg:#CBD5E1]">
      {children}
    </div>
  );
}
