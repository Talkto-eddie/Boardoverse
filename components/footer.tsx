import Link from "next/link"
import { Github, Twitter, DiscIcon as Discord } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full py-6 md:py-12 border-t border-white/10">
      <div className="container px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">BoardoVerse</h3>
            <p className="text-sm  text-gray-700 dark:text-gray-300">Web3 board games with competitive gameplay and token rewards.</p>
            <div className="flex space-x-4 text-gray-700 dark:text-gray-300">
              <Link href="#" className="dark:hover:text-white hover:text-black">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link href="#" className="dark:hover:text-white hover:text-black">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="dark:hover:text-white hover:text-black">
                <Discord className="h-5 w-5" />
                <span className="sr-only">Discord</span>
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>
                <Link href="#" className="dark:hover:text-white hover:text-black">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="dark:hover:text-white hover:text-black">
                  Whitepaper
                </Link>
              </li>
              <li>
                <Link href="#" className="dark:hover:text-white hover:text-black">
                  API
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Community</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>
                <Link href="#" className="dark:hover:text-white hover:text-black">
                  Discord
                </Link>
              </li>
              <li>
                <Link href="#" className="dark:hover:text-white hover:text-black">
                  Twitter
                </Link>
              </li>
              <li>
                <Link href="#" className="dark:hover:text-white hover:text-black">
                  Forum
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>
                <Link href="#" className=" dark:hover:text-white hover:text-black">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className=" dark:hover:text-white hover:text-black">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className=" dark:hover:text-white hover:text-black">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-gray-700 dark:text-gray-300">
          <p>© 2025 BoardoVerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
