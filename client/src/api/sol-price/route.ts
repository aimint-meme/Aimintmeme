import { Api } from "@/src/utils/api";
import { NextRequest,NextResponse } from 'next/server';

export async function GET(reg:NextRequest, res: NextResponse)
{
    const cookie = req.headers.get('cookie');
    console.log("response111",response)
    const response = await Api.get("https://frontend-api.pump.fun/sol-price",{ cookie });
    console.log("response111",response)
    return Response.json(response);
}
