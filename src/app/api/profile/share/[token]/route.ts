import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  redirect(`/p/${token}`);
}
