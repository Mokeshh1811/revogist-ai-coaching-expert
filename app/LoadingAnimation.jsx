// components/LoadingAnimation.jsx
"use client";
import React from "react";
import { DotWave } from "@uiball/loaders";

const LoadingAnimation = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <DotWave size={60} speed={1.5} color="#2563EB" />
    </div>
  );
};

export default LoadingAnimation;
