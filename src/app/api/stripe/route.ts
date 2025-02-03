import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // Ensure you're using the latest API version
});

export async function GET() {
  try {
    // Fetch the latest transactions first
    const payments = await stripe.paymentIntents.list({
      limit: 10,
    });

    const customers = await stripe.customers.list({ limit: 10 });

    // Get detailed payment data
    const detailedPayments = await Promise.all(
      payments.data.map(async (payment) => {
        const charge = payment.latest_charge
          ? await stripe.charges.retrieve(payment.latest_charge as string)
          : null;

        return {
          id: payment.id,
          amount: (payment.amount / 100).toFixed(2), // Convert to dollars
          currency: payment.currency.toUpperCase(),
          status: payment.status,
          created: new Date(payment.created * 1000).toLocaleString(),
          receipt_url: charge?.receipt_url || "",
          customer: charge?.billing_details?.name || "Unknown",
          email: charge?.billing_details?.email || "No Email",
          phone: charge?.billing_details?.phone || "No Phone",
          address: charge?.billing_details?.address
            ? `${charge.billing_details.address.line1}, ${charge.billing_details.address.city}, ${charge.billing_details.address.country}`
            : "No Address",
        };
      })
    );

    return NextResponse.json(
      { payments: detailedPayments, customers: customers.data },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
