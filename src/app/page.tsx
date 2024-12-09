'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleRedirect = () => {
    router.push('/login');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero sekcija */}
      <section className="flex items-center justify-center bg-green-600 text-white h-72">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Welcome to Event Planning App</h1>
          <p className="mt-2 text-xl">Plan your events with style and ease!</p>
        </div>
      </section>

      {/* About section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">What We Offer</h2>
          <p className="text-lg text-gray-700 mb-6">
            Organize your events with precision! Our platform helps you create, manage, and track all the
            details for your events, ensuring everything goes off without a hitch.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Image 
                src="https://via.placeholder.com/300x200" 
                alt="Event Planning"
                width={300}
                height={200}
                className="rounded-md"
              />
              <h3 className="mt-4 text-xl font-semibold">Create Events</h3>
              <p className="mt-2 text-gray-600">Easily set up and manage events with customizable features.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <Image 
                src="https://via.placeholder.com/300x200" 
                alt="Guest Management"
                width={300}
                height={200}
                className="rounded-md"
              />
              <h3 className="mt-4 text-xl font-semibold">Manage Guests</h3>
              <p className="mt-2 text-gray-600">Track guests, send invitations, and manage RSVPs effortlessly.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <Image 
                src="https://via.placeholder.com/300x200" 
                alt="Budget Tracking"
                width={300}
                height={200}
                className="rounded-md"
              />
              <h3 className="mt-4 text-xl font-semibold">Budget Management</h3>
              <p className="mt-2 text-gray-600">Keep track of your event's expenses and stay within budget.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-green-100 py-12">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-green-600 mb-6">Ready to Start Planning?</h2>
          <p className="text-lg mb-6 text-gray-700">Create your first event today and experience effortless event management!</p>
          <button className="bg-green-600 text-white py-3 px-6 rounded-full hover:bg-green-700 transition" onClick={handleRedirect}>
            Get Started
          </button>
        </div>
      </section>
    </div>
  );
}
