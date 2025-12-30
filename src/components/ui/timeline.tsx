"use client";
import React from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  return (
    <div className="w-full bg-transparent font-sans md:px-10">
      <div className="relative max-w-7xl mx-auto pb-20">
        <ol 
          className="space-y-0"
          role="list"
          aria-label="Timeline of experiences"
        >
          {data.map((item, index) => (
            <li
              key={index}
              className="flex justify-start pt-10 md:pt-40 md:gap-10"
              role="listitem"
              aria-label={`Timeline item ${index + 1}: ${item.title}`}
            >
              {/* Timeline marker */}
              <div className="flex flex-col md:flex-row items-center self-start max-w-xs lg:max-w-sm md:w-full">
                <div 
                  className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-background border border-border flex items-center justify-center z-10"
                  role="img"
                  aria-label={`Timeline marker for ${item.title}`}
                >
                  <div className="h-4 w-4 rounded-full bg-primary border border-primary-foreground" />
                </div>
                <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-foreground">
                  {item.title}
                </h3>
              </div>

              {/* Content */}
              <div className="relative pl-20 pr-4 md:pl-4 w-full">
                <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-foreground">
                  {item.title}
                </h3>
                <div role="region" aria-label={`Content for ${item.title}`}>
                  {item.content}
                </div>
              </div>
            </li>
          ))}
        </ol>

        {/* Timeline line */}
        <div 
          className="absolute md:left-8 left-8 top-0 bottom-0 w-[2px] bg-linear-to-b from-transparent via-border to-transparent"
          role="presentation"
          aria-hidden="true"
        >
          <div className="absolute inset-x-0 top-0 bottom-0 w-[2px] bg-linear-to-b from-purple-500 via-blue-500 to-transparent opacity-60" />
        </div>
      </div>
    </div>
  );
};
