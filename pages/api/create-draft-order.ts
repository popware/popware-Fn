import type { NextApiRequest, NextApiResponse } from "next";

const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_ADMIN_API_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN!;

type Data =
  | { success: true; checkoutUrl: string }
  | { success: false; error: any };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    const { title, price, imageUrl, quantity = 1 , options = {} } = req.body;

    const properties = [
  { name: "Custom Image", value: imageUrl },
  { name: "Preview Image", value: imageUrl },
  { name: "Product ID", value: options.productId || "-" },
  { name: "Template ID", value: options.templateId || "-" },
  { name: "Pattern ID", value: options.patternId || "-" },
  { name: "Text", value: options.text || "-" },
  { name: "Pic", value: options.pic || "-" },
    { name: "Size", value: options.size || "-" },
];

    const draftOrderPayload = {
      draft_order: {
        line_items: [
          {
            title,
            price,
            quantity,
            properties
          },
        ],
        note: "Custom product order from Next.js site",
      },
    };

    const response = await fetch(
      `https://km10x9-7j.myshopify.com/admin/api/2024-01/draft_orders.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": "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",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draftOrderPayload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ success: false, error: data.errors || "Unknown error" });
    }

    const invoiceUrl = data.draft_order?.invoice_url || "";
    return res.status(200).json({ success: true, checkoutUrl: invoiceUrl });
  } catch (error: any) {
    console.error("Draft order creation failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
