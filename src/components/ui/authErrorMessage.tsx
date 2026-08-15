"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface AuthErrorMessageProps {
  message: string;
  className?: string;
}

export default function AuthErrorMessage({
  message,
  className = "",
}: AuthErrorMessageProps) {
  // Parse message to extract HTML links and convert them to React Link components
  const parseMessage = (msg: string) => {
    // Pattern to match <a href="...">...</a> tags
    const linkRegex = /<a href="([^"]+)">([^<]+)<\/a>/g;
    const parts: string[] = [];
    let lastIndex = 0;
    let match;
    // let keyCounter = 0;

    while ((match = linkRegex.exec(msg)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        const textBefore = msg.substring(lastIndex, match.index);
        if (textBefore.trim()) {
          parts.push(textBefore);
        }
      }
      // Add the link component
      // parts.push(
      //   <Link
      //     key={`link-${keyCounter++}`}
      //     href={match[1]}
      //     className="underline font-medium text-black-color hover:text-teal-500"
      //   >
      //     {match[2]}
      //   </Link>
      // );
      lastIndex = linkRegex.lastIndex;
    }

    // Add remaining text after the last link
    if (lastIndex < msg.length) {
      parts.push(msg.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [msg];
  };

  const parsedMessage = parseMessage(message);

  return (
    <div
      className={`bg-red-100 border border-red-500 rounded-lg p-4 flex items-start gap-3 ${className}`}
    >
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {/* <p className="text-sm font-semibold text-red-900 mb-1">Almost there:</p> */}
        <div className="text-base text-red-800 leading-relaxed">
          {parsedMessage.map((part, index) => (
            <React.Fragment key={index}>{part}</React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
