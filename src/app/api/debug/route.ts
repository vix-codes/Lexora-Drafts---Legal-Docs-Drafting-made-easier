
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    PROJECT_ID: process.env.FIREBASE_PROJECT_ID ?? 'missing',
    CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ?? 'missing',
    PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 'loaded' : 'missing'
  });
}

    