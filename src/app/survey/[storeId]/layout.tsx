export default function SurveyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Super Survey Form
            </h1>
            {/* Menghapus baris "Survei Kepuasan Pelanggan" */}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}