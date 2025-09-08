// import { NextResponse } from "next/server"
// import { connectDB } from "../../../lib/mongodb"
// import Business from "../../../models/business"

// export async function GET(req: Request) {
//   await connectDB()
//   const { searchParams } = new URL(req.url)
//   const username = searchParams.get("username")
//   if (!username) {
//     return NextResponse.json({ error: "Username required" }, { status: 400 })
//   }
//   const business = await Business.findOne({ username })
//   return NextResponse.json(business || {})
// }

// export async function POST(req: Request) {
//   await connectDB()
//   const body = await req.json()
//   const { username, ...rest } = body

//   if (!username) {
//     return NextResponse.json({ error: "Username required" }, { status: 400 })
//   }

//   const business = await Business.findOneAndUpdate(
//     { username },
//     { $set: rest },
//     { new: true, upsert: true }
//   )
//   return NextResponse.json({ message: "Business saved", business })
// }

// export async function DELETE(req: Request) {
//   await connectDB()
//   const { searchParams } = new URL(req.url)
//   const username = searchParams.get("username")
//   if (!username) {
//     return NextResponse.json({ error: "Username required" }, { status: 400 })
//   }

//   await Business.findOneAndDelete({ username })
//   return NextResponse.json({ message: "Business deleted" })
// }
