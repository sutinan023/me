import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request,{params}){
  const {token}=await params;
  const db=getSupabaseAdmin();
  if(!db) return NextResponse.json({error:"Database sharing is not configured"},{status:503});
  const {data,error}=await db.from("share_results").select("type,ei_score,sn_score,tf_score,jp_score,expires_at,revoked_at").eq("token",token).maybeSingle();
  if(error||!data) return NextResponse.json({error:"Share link not found"},{status:404});
  if(data.revoked_at) return NextResponse.json({error:"Share link revoked"},{status:410});
  if(data.expires_at && new Date(data.expires_at)<new Date()) return NextResponse.json({error:"Share link expired"},{status:410});
  return NextResponse.json({result:{type:data.type,dims:{EI:data.ei_score,SN:data.sn_score,TF:data.tf_score,JP:data.jp_score}}});
}
