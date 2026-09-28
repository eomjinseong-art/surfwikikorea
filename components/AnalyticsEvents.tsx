"use client";

import { track } from "@vercel/analytics";
import { useEffect } from "react";

const UTM_SRC_KEY = "utm_src";
const LANDING_SENT_KEY = "landing_sent";

/** Match the package queue so track() is kept if it runs before <Analytics /> injects. */
function ensureAnalyticsQueue() {
  if (window.va) return;
  const queue = (window.vaq = window.vaq || []);
  window.va = ((...params: [string, unknown?]) => {
    queue.push(params);
  }) as NonNullable<Window["va"]>;
}

function readSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSession(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* sessionStorage can throw in private mode */
  }
}

function searchParam(name: string): string {
  return new URLSearchParams(window.location.search).get(name)?.trim() ?? "";
}

function referrerHostname(): string {
  const referrer = document.referrer;
  if (!referrer) return "";
  try {
    return new URL(referrer).hostname;
  } catch {
    return "";
  }
}

function externalHostname(anchor: HTMLAnchorElement): string | null {
  const raw = anchor.getAttribute("href");
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(anchor.href);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (!url.hostname || url.hostname === window.location.hostname) return null;
  return url.hostname;
}

/** Session landing event plus delegated outbound CTA clicks. */
export default function AnalyticsEvents() {
  useEffect(() => {
    ensureAnalyticsQueue();

    const utmSource = searchParam("utm_source");
    const utmCampaign = searchParam("utm_campaign");

    if (utmSource) writeSession(UTM_SRC_KEY, utmSource);

    if (!readSession(LANDING_SENT_KEY)) {
      track("landing", {
        src: utmSource || referrerHostname() || "none",
        campaign: utmCampaign || "none",
      });
      writeSession(LANDING_SENT_KEY, "1");
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const dest = externalHostname(anchor);
      if (!dest) return;
      track("cta_click", {
        dest,
        src: readSession(UTM_SRC_KEY) || "none",
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
