"use client";

import React, { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { resolveSecureSocketUrl } from "@/lib/utils";

interface MaintenanceGateProps {
  children: React.ReactNode;
}

export default function MaintenanceGate({ children }: MaintenanceGateProps) {
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);

  const targetTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const activatedRef = useRef(false);

  useEffect(() => {
    let socket: Socket | null = null;

    const activateMaintenance = () => {
      if (!activatedRef.current) {
        activatedRef.current = true;
        setIsMaintenanceActive(true);
      }
    };

    const setNewTargetTime = (rawDatetime: string | null | undefined) => {
      if (!rawDatetime || rawDatetime === "null") return;

      const parsed = new Date(rawDatetime).getTime();
      if (Number.isNaN(parsed)) return;

      targetTimeRef.current = parsed;

      // Immediate check
      if (Date.now() >= parsed) {
        activateMaintenance();
      }
    };

    const startInterval = () => {
      if (intervalRef.current !== null) return;

      intervalRef.current = window.setInterval(() => {
        if (activatedRef.current) return;

        if (
          targetTimeRef.current !== null &&
          Date.now() >= targetTimeRef.current
        ) {
          activateMaintenance();
        }
      }, 1000); // check every second
    };

    const socketUrl = resolveSecureSocketUrl(
      process.env.NEXT_PUBLIC_SERVER_URL,
    );
    if (!socketUrl) {
      return;
    }

    try {
      socket = io(socketUrl, {
        transports: ["websocket", "polling"],
      });

      socket.on("connect", () => {
        socket?.emit("get-times");
      });

      socket.on("times-list", (payload: any) => {
        const first = Array.isArray(payload) ? payload[0] : payload;
        const rawDatetime = first?.datetime;

        if (!rawDatetime) return;

        setNewTargetTime(rawDatetime);
      });

      socket.on("times-updated", (payload: any) => {
        const first = Array.isArray(payload) ? payload[0] : payload;
        setNewTargetTime(first?.datetime);
      });

      socket.on("connect_error", (err) => {
        // Silently handle socket connection errors to keep the console clean.
      });

      startInterval();
    } catch (err) {
      console.error("[MaintenanceGate] socket init failed", err);
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  if (isMaintenanceActive) {
    return <div className="min-h-screen bg-white" />;
  }

  return <>{children}</>;
}
