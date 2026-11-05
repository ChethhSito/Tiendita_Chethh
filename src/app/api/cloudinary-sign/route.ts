import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer /, "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET,
    apiKey = process.env.CLOUDINARY_API_KEY,
    cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!token || !url || !key || !secret || !apiKey || !cloudName)
    return NextResponse.json({ error: "No configurado" }, { status: 401 });
  const { data } = await createClient(url, key).auth.getUser(token);
  if (!data.user || data.user.email !== process.env.ADMIN_EMAIL)
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const timestamp = Math.floor(Date.now() / 1000),
    folder = "tiendita-chethh";
  const signature = crypto
    .createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${secret}`)
    .digest("hex");
  return NextResponse.json({ timestamp, folder, signature, apiKey, cloudName });
}
