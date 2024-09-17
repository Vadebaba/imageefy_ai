"use client"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { navLinks } from "@/constants"
import { SignedIn, UserButton } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
//import { Button } from "../ui/button"

const MobileNav = () => {
    const pathname = usePathname();

    return (
        <>
            <header className="header flex justify-between p-5 mt-6">
                <Link href="/" className="flex items-center gap-2 md:py-2 font-bold">
                    IMAGEEFY
                </Link>

                <nav>
                    <SignedIn>
                        <UserButton />

                        <Sheet>
                            <SheetTrigger>
                                <Image
                                    src="/assets/icons/menu.svg"
                                    alt="menu"
                                    width={32}
                                    height={32}
                                    className="cursor-pointer"
                                />
                            </SheetTrigger>

                            <SheetContent className="sheet-content sm:w-64">
                            <>
                                <Image
                                    src="/assets/images/logo-text.svg"
                                    alt="logo"
                                    width={152}
                                    height={23}
                                />

                                <ul className="header-nav_elements">
                                    {navLinks.map((link) => {
                                        const isActive = link.route === pathname

                                        return (
                                            <li
                                                className={`${isActive && 'gradient-text'} p-18 flex whitespace-nowrap text-dark-700`}
                                                key={link.route}
                                            >
                                                <Link className="sidebar-link cursor-pointer" href={link.route}>
                                                    <Image
                                                        src={link.icon}
                                                        alt="logo"
                                                        width={24}
                                                        height={24}
                                                    />
                                                    {link.label}
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </>
                        </SheetContent>
                        </Sheet>
                    </SignedIn>

                </nav>
            </header>
        </>
    )
}

export default MobileNav