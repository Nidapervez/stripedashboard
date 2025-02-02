"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, DollarSign, CheckCircle, XCircle, FileText } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState<{ payments: any[]; customers: any[] }>({
    payments: [],
    customers: [],
  });

  useEffect(() => {
    // Function to fetch data from the backend
    const fetchData = async () => {
      try {
        const res = await fetch("/api/stripe");
        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();
        setData(data);
      } catch (err) {
        console.error("Error fetching Stripe data:", err);
      }
    };

    fetchData();

    // Polling with a delay of 30 seconds to refresh the data
    const interval = setInterval(fetchData, 30000); // every 30 seconds

    // Cleanup on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6">💳 Stripe Transactions Dashboard</h1>

      {/* Transactions Section */}
      <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">🔄 Recent Transactions</h2>
        <table className="w-full border-collapse border rounded-lg overflow-hidden shadow-md">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="border p-3">Customer</th>
              <th className="border p-3">Email</th>
              <th className="border p-3">Phone</th>
              <th className="border p-3">Address</th>
              <th className="border p-3">Amount</th>
              <th className="border p-3">Status</th>
              <th className="border p-3">Receipt</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {data.payments.length > 0 ? (
              data.payments.map((payment) => (
                <tr key={payment.id} className="border">
                  <td className="border p-3">{payment.customer}</td>
                  <td className="border p-3 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-500" /> {payment.email}
                  </td>
                  <td className="border p-3 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-gray-500" /> {payment.phone}
                  </td>
                  <td className="border p-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" /> {payment.address}
                  </td>
                  <td className="border p-3 flex items-center gap-2 font-bold">
                    <DollarSign className="w-5 h-5 text-green-600" /> ${payment.amount} {payment.currency}
                  </td>
                  <td className="border p-3 flex items-center gap-2">
                    {payment.status === "succeeded" ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    {payment.status}
                  </td>
                  <td className="border p-3">
                    {payment.receipt_url ? (
                      <a href={payment.receipt_url} target="_blank" className="text-blue-500 underline flex items-center gap-1">
                        <FileText className="w-5 h-5" /> View
                      </a>
                    ) : (
                      "No Receipt"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 p-4">
                  No transactions available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Customers Section */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">🧑 Recent Customers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.customers.length > 0 ? (
            data.customers.map((customer) => (
              <div key={customer.id} className="border rounded-lg p-4 bg-gray-50 shadow-md">
                <h3 className="text-lg font-semibold text-gray-800">{customer.name || "No Name"}</h3>
                <p className="text-gray-600 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" /> {customer.email || "No Email"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No customers found</p>
          )}
        </div>
      </div>
    </div>
  );
}
