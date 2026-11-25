import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@17.5.0?target= deno"

const cors = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "https://YOUR-SITE.pages.dev",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors })

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) return Response.json({ error: "Sign in required" }, { status: 401, headers: cors })

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return Response.json({ error: "Sign in required" }, { status: 401, headers: cors })

    const body = await req.json()
    if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 30) {
      return Response.json({ error: "Invalid basket" }, { status: 400, headers: cors })
    }

    const clean = body.items.map((item: any) => ({
      product_id: String(item.product_id),
      quantity: Number(item.quantity),
    }))
    if (clean.some((i: any) => !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 10)) {
      return Response.json({ error: "Invalid quantity" }, { status: 400, headers: cors })
    }

    // Prices are always read from the database, never trusted from the browser.
    const ids = [...new Set(clean.map((i: any) => i.product_id))]
    const { data: products, error: productError } = await supabase
      .from("products").select("id,name,price_pence,active").in("id", ids)
    if (productError || !products || products.length !== ids.length || products.some(p => !p.active)) {
      return Response.json({ error: "One or more products are unavailable" }, { status: 400, headers: cors })
    }

    const byId = new Map(products.map(p => [p.id, p]))
    const lineItems = clean.map((item: any) => {
      const product = byId.get(item.product_id)!
      return {
        quantity: item.quantity,
        price_data: {
          currency: "gbp",
          unit_amount: product.price_pence,
          product_data: { name: product.name },
        },
      }
    })

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { httpClient: Stripe.createFetchHttpClient() })
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: lineItems,
      success_url: `${Deno.env.get("SITE_URL")}/?checkout=success`,
      cancel_url: `${Deno.env.get("SITE_URL")}/?checkout=cancelled`,
      metadata: { user_id: user.id },
    })
    return Response.json({ url: session.url }, { headers: cors })
  } catch (e) {
    console.error("Checkout error", e)
    return Response.json({ error: "Unable to create checkout session" }, { status: 500, headers: cors })
  }
})
