import React from "react";
import {
  RiRocketLine,
  RiShieldCheckLine,
  RiHeadphoneLine,
  RiTrophyLine,
} from "react-icons/ri";

const Features = () => {
  return (
    <section className="py-10 lg:py-14">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            [
              RiRocketLine,
              "High-impact launches",
              "Design-led merchandising that stands out.",
            ],
            [
              RiShieldCheckLine,
              "Trusted payments",
              "Safe shopping for every order.",
            ],
            [
              RiHeadphoneLine,
              "Premium support",
              "Expert help when customers need it.",
            ],
            [
              RiTrophyLine,
              "Growth-ready",
              "A platform built for conversion and retention.",
            ],
          ].map(([Icon, title, text]) => (
            <div
              key={title}
              className="surface-card p-6 transition hover:-translate-y-1"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-cyan-400/15 text-cyan-300">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
