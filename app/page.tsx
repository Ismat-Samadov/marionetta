"use client";

import dynamic from "next/dynamic";

const MarioGame = dynamic(() => import("@/components/MarioGame"), {
  ssr: false,
});

export default function Home() {
  return <MarioGame />;
}
