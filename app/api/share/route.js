import crypto from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function localToken(result){
  return Buffer.from(JSON.stringify({v:1,type:result.type,ei:result.dims.EI,sn:result.dims.SN,tf:result.dims.TF,jp:result.dims.JP})).toString("base64url");
}

export async function POST(request){
  try{
    const result=await request.json();
    if(!result?.type || !result?.dims) return NextResponse.json({error:"Invalid result"},{status:400});
    const origin=new URL(request.url).origin;
    const db=getSupabaseAdmin();

    if(!db){
      const p=localToken(result);
      return NextResponse.json({mode:"local",url:`${origin}/compare?p=${p}`});
    }

    const token=crypto.randomBytes(9).toString("base64url");
    const days=Number(process.env.SHARE_EXPIRES_DAYS||30);
    const expiresAt=new Date(Date.now()+days*86400000).toISOString();
    const {error}=await db.from("share_results").insert({
      token,type:result.type,ei_score:result.dims.EI,sn_score:result.dims.SN,tf_score:result.dims.TF,jp_score:result.dims.JP,expires_at:expiresAt
    });
    if(error) throw error;
    return NextResponse.json({mode:"database",url:`${origin}/compare?friend=${token}`,expiresAt});
  }catch(e){
    return NextResponse.json({error:e.message||"Share failed"},{status:500});
  }
}
