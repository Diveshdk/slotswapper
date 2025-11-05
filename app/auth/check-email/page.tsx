import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-linear-to-b from-white to-gray-50">
      <div className="w-full max-w-sm text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-blue-500">Check your email</h1>
          <p className="text-gray-600 mt-2">
            We've sent a confirmation link to your email address. Click it to verify your account.
          </p>
        </div>
        <Link href="/auth/login">
          <Button className="w-full">Back to Login</Button>
        </Link>
      </div>
    </div>
  )
}
