import { currentUser } from "@clerk/nextjs/server"
import { UserPlus, LogIn, UserStarIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
async function Sidebar() {
    const authUser=await currentUser
    if(!authUser)return <UnAuthenticatedSidebar />
  return (
    <div>Sidebar</div>
  )
}

export default Sidebar

const UnAuthenticatedSidebar = () => (
  <div className="sticky top-20">
    <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-3 w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-500 rounded-full flex items-center justify-center shadow-lg">
          <UserStarIcon className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-200 to-white bg-clip-text text-transparent">
          Join the Community
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-center text-sm text-gray-300 mb-4">
          Connect with like-minded people and unlock exclusive features.
        </p>
        <SignInButton mode="modal">
          <Button 
            className="w-full bg-transparent border border-gray-600 text-white hover:bg-gray-800 hover:border-gray-500 transition-all duration-300" 
            size="lg"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button 
            className="w-full bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white shadow-lg hover:shadow-xl transition-all duration-300" 
            size="lg"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create Account
          </Button>
        </SignUpButton>
      </CardContent>
    </Card>
  </div>
);