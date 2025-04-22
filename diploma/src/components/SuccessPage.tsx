// components/SuccessPage.tsx
'use client';

export default function SuccessPage() {
  return (
    <main className="max-w-3xl mx-auto p-10 text-white text-center border m-10 rounded-md bg-green-500">
      <h1 className="text-4xl font-extrabold mb-4">Payment Successful!</h1>
      <p className="text-xl mb-4">Thank you for your payment.</p>
      <p className="text-md">You will receive a confirmation email shortly.</p>
    </main>
  );
}
