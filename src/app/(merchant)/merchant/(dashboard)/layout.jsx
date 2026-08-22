import { MerchantSidebar } from "@/components/layout/MerchantSidebar";
import { RequireMerchantAuth } from "@/components/merchant/RequireMerchantAuth";

export default function MerchantLayout({ children }) {
  return (
    // `data-surface="merchant-dark"` pins this scope to a fixed dark palette
    // regardless of the user's light/dark theme preference, so the admin
    // deck always reads as a dark control surface.
    <div
      data-surface="merchant-dark"
      className="min-h-screen bg-ink text-off"
    >
      <MerchantSidebar />
      <main className="lg:pl-64">
        <RequireMerchantAuth>
          <div className="px-5 sm:px-6 lg:px-10 py-8 sm:py-10">
            {children}
          </div>
        </RequireMerchantAuth>
      </main>
    </div>
  );
}
