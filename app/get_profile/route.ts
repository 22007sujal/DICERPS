import { NextResponse } from "next/server";
import pool from "../[utility]/DB";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet_address = searchParams.get("wallet_address");

    if (!wallet_address) {
      return NextResponse.json({ error: "Missing wallet_address" }, { status: 400 });
    }

    const [rows]: any = await pool.query(
      "SELECT * FROM dicerps WHERE wallet_address = ?",
      [wallet_address]
    );

    if (rows.length > 0) {
      return NextResponse.json(rows[0]);
    } else {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
