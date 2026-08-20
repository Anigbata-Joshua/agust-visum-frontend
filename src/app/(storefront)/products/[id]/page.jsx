// Product detail page — wire to productService.getById(params.id)
export default function ProductDetailPage({ params }) {
  return (
    <main className="px-8 py-16">
      <h1 className="font-display text-3xl">Product {params.id}</h1>
    </main>
  );
}
