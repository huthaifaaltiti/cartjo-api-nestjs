export default function generateSKU({
  productSlug,
  attributes,
}: {
  productSlug: string;
  attributes: { key: string; value: string }[];
}) {
  const attrPart = attributes
    .filter(a => a.key !== 'selling_type')
    .map(a => a.value.substring(0, 3).toUpperCase())
    .join('-');

  const timestamp = Date.now().toString(36).toUpperCase();

  const base = productSlug.substring(0, 10).toUpperCase().replace(/-/g, '');

  return attrPart ? `${base}-${attrPart}-${timestamp}` : `${base}-${timestamp}`;
}
