"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const calcTransform = (offsetX, offsetY) =>
    `translate3d(${(mousePos.x - window.innerWidth / 2) * offsetX}px, ${
      (mousePos.y - window.innerHeight / 2) * offsetY
    }px, 0)`;

  return (
    <main className="relative min-h-screen bg-white overflow-hidden text-gray-800">
      {/* 🔮 Full-screen background animation blobs */}
      <div
        className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-purple-400 opacity-30 rounded-full mix-blend-multiply filter blur-3xl transition-transform duration-1000"
          style={{ transform: calcTransform(0.005, 0.005) }}
        ></div>
        <div
          className="absolute top-20 right-0 w-[500px] h-[500px] bg-teal-300 opacity-25 rounded-full mix-blend-multiply filter blur-2xl transition-transform duration-1000"
          style={{ transform: calcTransform(-0.008, 0.006) }}
        ></div>
        <div
          className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-blue-300 opacity-20 rounded-full mix-blend-multiply filter blur-2xl transition-transform duration-1000"
          style={{ transform: calcTransform(0.01, -0.01) }}
        ></div>
      </div>

      {/* 🌟 Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-28 pb-16">
        <Image
          src="/t4.png"
          alt="Revogist Assistant Logo"
          width={100}
          height={100}
          className="mx-auto mb-6 rounded-full shadow-xl animate-pulse"
        />
        <h1 className="text-6xl sm:text-7xl font-extrabold mb-4 text-purple-700 drop-shadow-md">
          Revogist
        </h1>
        <h2 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-teal-400 mb-6 drop-shadow-md">
          Revolutionize Learning with{" "}
          <span className="text-black">AI-Powered Voice Agent</span>
        </h2>
        <p className="text-gray-700 text-lg sm:text-xl mb-8 max-w-2xl">
          Unlock personalized learning with voice-driven coaching. Experience
          mock interviews, language enhancement, guided meditation, and more.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-gradient-to-r from-blue-600 to-teal-500 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-transform duration-300"
        >
          🚀 Get Started
        </button>
      </div>

      {/* 💡 About Revogist Section */}
      <section className="relative z-10 bg-white bg-opacity-80 py-16 px-6 md:px-20 text-center rounded-t-3xl shadow-inner">
        <h2 className="text-4xl font-bold text-gray-800 mb-6">
          About <span className="text-purple-500">Revogist</span>
        </h2>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-12">
          Revogist is your personal AI-powered coaching companion designed to
          enhance your skills, confidence, and focus. Explore a wide range of
          interactive features tailored for learners, professionals, and
          self-improvers.
        </p>

        {/* Features */}
        <div className="grid gap-8 md:grid-cols-3 text-left max-w-5xl mx-auto">
          <div className="p-6 bg-blue-50 rounded-xl shadow-md hover:scale-[1.02] transition">
            <h3 className="text-xl font-semibold text-blue-700 mb-2">
              🎓 Lecture Mode
            </h3>
            <p className="text-gray-700">
              Learn complex topics in a simplified voice-based format, driven by
              AI explanations customized to your pace.
            </p>
          </div>
          <div className="p-6 bg-purple-50 rounded-xl shadow-md hover:scale-[1.02] transition">
            <h3 className="text-xl font-semibold text-purple-700 mb-2">
              🧑‍💼 Mock Interviews
            </h3>
            <p className="text-gray-700">
              Practice job interviews with real-time AI feedback and voice
              interaction for every career stage.
            </p>
          </div>
          <div className="p-6 bg-teal-50 rounded-xl shadow-md hover:scale-[1.02] transition">
            <h3 className="text-xl font-semibold text-teal-700 mb-2">
              ❓ Q&A Prep
            </h3>
            <p className="text-gray-700">
              Ask your questions and get accurate, context-aware responses.
              Perfect for exam and interview preparation.
            </p>
          </div>
          <div className="p-6 bg-yellow-50 rounded-xl shadow-md hover:scale-[1.02] transition">
            <h3 className="text-xl font-semibold text-yellow-700 mb-2">
              🗣️ Language Skills
            </h3>
            <p className="text-gray-700">
              Improve fluency, pronunciation, and grammar in multiple languages
              with real-time voice corrections.
            </p>
          </div>
          <div className="p-6 bg-indigo-50 rounded-xl shadow-md hover:scale-[1.02] transition">
            <h3 className="text-xl font-semibold text-indigo-700 mb-2">
              🧘‍♂️ Guided Meditation
            </h3>
            <p className="text-gray-700">
              Reduce stress and boost focus with calming AI-guided meditation and
              breathing sessions.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
