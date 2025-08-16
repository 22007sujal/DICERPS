import { NextResponse } from "next/server";
import pool from "@/app/[utility]/DB"; // adjust path if needed

export async function POST(req: Request) {
  try {
    const { wallet_address, username, profile_image } = await req.json();

    if (!wallet_address || !username || !profile_image) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await pool.query(
      `INSERT INTO dicerps (wallet_address, username, profile_image)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         username = VALUES(username),
         profile_image = VALUES(profile_image)`,
      [wallet_address, username, profile_image]
    );

    return NextResponse.json({ success: true, message: "Profile saved" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
